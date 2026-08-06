#!/usr/bin/env python3

import re
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path


USAGE = "usage: ho-bj start <slug> [-C <root>] -- <command> [args...]"


def fail(message: str, status: int = 1) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(status)


def run_tmux(arguments: list[str], *, allow_failure: bool = False):
    try:
        result = subprocess.run(
            ["tmux", *arguments],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except FileNotFoundError:
        raise RuntimeError("tmux not found") from None

    if result.returncode != 0 and not allow_failure:
        message = result.stderr.strip() or f"tmux exited with status {result.returncode}"
        raise RuntimeError(message)
    return result


def main() -> int:
    # Parse the wrapper arguments while leaving everything after "--" for the job.
    arguments = sys.argv[1:]
    if not arguments or arguments.pop(0) != "start":
        fail(USAGE, 2)

    slug = arguments.pop(0) if arguments else ""
    if re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) is None:
        fail(f"invalid job slug: {slug}", 2)

    root_argument = str(Path.cwd())
    while arguments and arguments[0] != "--":
        if arguments.pop(0) != "-C" or not arguments:
            fail(USAGE, 2)
        root_argument = arguments.pop(0)
    if not arguments or arguments.pop(0) != "--" or not arguments:
        fail(USAGE, 2)

    # Resolve the root before passing it to tmux so the job has a stable working directory.
    try:
        root = Path(root_argument).resolve(strict=True)
        if not root.is_dir():
            raise OSError
    except OSError:
        fail(f"job root not found: {root_argument}")

    # Keep all background jobs as named windows in one shared tmux session.
    if run_tmux(["has-session", "-t", "=ho-bj"], allow_failure=True).returncode != 0:
        run_tmux(["new-session", "-d", "-s", "ho-bj", "-n", "shell"])

    windows = run_tmux(
        ["list-windows", "-t", "=ho-bj", "-F", "#{window_name}"]
    ).stdout.rstrip().splitlines()
    if slug in windows:
        fail(f"job already exists: {slug}")

    # Capture early output so the caller can see whether the job started successfully.
    temporary_directory = Path(tempfile.mkdtemp(prefix="ho-bj."))
    capture_path = temporary_directory / "startup.log"
    capture_path.write_bytes(b"")

    pane_id = ""
    started = False
    cleaned_up = False

    # Stop capturing output and remove a partially initialized window on failure.
    def cleanup() -> None:
        nonlocal cleaned_up
        if cleaned_up:
            return
        cleaned_up = True
        if pane_id:
            run_tmux(["pipe-pane", "-t", pane_id], allow_failure=True)
            if not started:
                run_tmux(["kill-window", "-t", pane_id], allow_failure=True)
        shutil.rmtree(temporary_directory, ignore_errors=True)

    def handle_signal(_signum, _frame) -> None:
        cleanup()
        raise SystemExit(130)

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    try:
        # Create the window with a placeholder shell so capture is ready before the job starts.
        pane_id = run_tmux(
            [
                "new-window",
                "-d",
                "-P",
                "-F",
                "#{pane_id}",
                "-t",
                "=ho-bj:",
                "-n",
                slug,
                "-c",
                str(root),
            ]
        ).stdout.strip()
        run_tmux(["set-option", "-w", "-t", pane_id, "remain-on-exit", "on"])
        run_tmux(
            ["pipe-pane", "-t", pane_id, f"cat >> {shlex.quote(str(capture_path))}"]
        )

        command = f"exec {shlex.join(arguments)}"
        run_tmux(["respawn-pane", "-k", "-t", pane_id, "-c", str(root), command])
        started = True

        # Wait until the job exits or its startup output has been quiet for 500 ms.
        last_size = 0
        idle_polls = 0
        for _ in range(50):
            time.sleep(0.1)
            size = capture_path.stat().st_size
            if size != last_size:
                last_size = size
                idle_polls = 0
            elif size > 0:
                idle_polls += 1

            dead = run_tmux(
                ["display-message", "-p", "-t", pane_id, "#{pane_dead}"]
            ).stdout.strip()
            if dead == "1" or idle_polls >= 5:
                break

        # Close the pipe before reading to avoid racing with writes to the capture file.
        run_tmux(["pipe-pane", "-t", pane_id], allow_failure=True)
        output = capture_path.read_bytes()
        if output:
            sys.stdout.buffer.write(output)
            sys.stdout.buffer.flush()

        # A dead pane represents a startup failure; a live pane is left for later attachment.
        dead = run_tmux(
            ["display-message", "-p", "-t", pane_id, "#{pane_dead}"]
        ).stdout.strip()
        if dead == "1":
            status = int(
                run_tmux(
                    ["display-message", "-p", "-t", pane_id, "#{pane_dead_status}"]
                ).stdout.strip()
            )
            print(f"ho-bj: {slug} exited with status {status}", file=sys.stderr)
            return status

        print(
            f"ho-bj: {slug} is running; attach with: tmux attach -t ho-bj",
            file=sys.stderr,
        )
        return 0
    finally:
        cleanup()


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, RuntimeError, ValueError) as error:
        fail(f"ho-bj: {error}")
