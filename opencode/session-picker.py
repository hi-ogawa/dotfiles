#!/usr/bin/env python3

import os
import shlex
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote


def database_uri() -> str:
    data_home = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local/share"))
    db_path = data_home / "opencode" / "opencode.db"
    return f"file:{quote(str(db_path), safe='/')}?mode=ro"


def preview_session(session_id: str) -> None:
    # Keep the preview conversational by excluding tool calls and reasoning parts.
    with sqlite3.connect(database_uri(), uri=True) as connection:
        rows = connection.execute(
            """
            SELECT
              json_extract(message.data, '$.role') AS role,
              json_extract(part.data, '$.text') AS text
            FROM part
            JOIN message ON message.id = part.message_id
            WHERE part.session_id = ?
              AND json_extract(part.data, '$.type') = 'text'
              AND json_extract(message.data, '$.role') IN ('user', 'assistant')
              AND trim(json_extract(part.data, '$.text')) != ''
            ORDER BY part.time_created DESC
            LIMIT 12
            """,
            (session_id,),
        ).fetchall()

    for role, text in reversed(rows):
        if role == "user":
            print(f"\n\033[1;33mUSER\033[0m\n\033[38;5;223m{text}\033[0m")
        else:
            print(f"\n\033[1;36mASSISTANT\033[0m\n\033[38;5;153m{text}\033[0m")


def list_sessions() -> list[str]:
    cwd = Path.cwd().resolve()
    # This path-based shortcut does not reproduce OpenCode's origin-based project identity:
    # - A separate clone with the same origin shares sessions in OpenCode, but its path
    #   will not match until OpenCode registers that checkout as a sandbox.
    # - Outside Git, OpenCode lists root sessions from its global project, while this
    #   lookup uses the current directory and normally returns no sessions.
    try:
        result = subprocess.run(
            [
                "git",
                "rev-parse",
                "--path-format=absolute",
                "--git-common-dir",
                "--show-toplevel",
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
        )
    except FileNotFoundError:
        result = None

    if result is not None and result.returncode == 0:
        common_directory, checkout = result.stdout.splitlines()
        # A linked worktree's common Git directory lives under the primary worktree.
        worktree = Path(common_directory).parent
    else:
        worktree = checkout = cwd

    with sqlite3.connect(database_uri(), uri=True) as connection:
        sessions = connection.execute(
            """
            SELECT session.id, session.time_updated, session.title, session.directory
            FROM session
            JOIN project ON project.id = session.project_id
            WHERE session.parent_id IS NULL
              AND session.time_archived IS NULL
              AND (
                project.worktree IN (?, ?)
                OR EXISTS (
                  SELECT 1 FROM json_each(project.sandboxes) WHERE value IN (?, ?)
                )
              )
            ORDER BY session.time_updated DESC
            LIMIT 100
            """,
            (str(worktree), str(checkout), str(worktree), str(checkout)),
        ).fetchall()

    rows = []

    for session_id, time_updated, session_title, session_directory in sessions:
        updated = datetime.fromtimestamp(time_updated / 1000)
        title = session_title.translate(
            str.maketrans({"\t": " ", "\r": " ", "\n": " "})
        )
        directory = Path(session_directory).name
        # The hidden first TSV field carries the session ID through selection.
        rows.append(f"{session_id}\t{updated:%Y-%m-%d %H:%M}\t{title}\t{directory}")

    return rows


def choose_session(rows: list[str]) -> tuple[str, str] | None:
    # fzf owns the list, filtering, and live right-hand preview.
    script_path = Path(__file__).resolve()
    result = subprocess.run(
        [
            "fzf",
            "--ansi",
            "--delimiter=\t",
            "--with-nth=2..",
            "--layout=reverse",
            "--header=enter: continue | alt-enter: fork | esc: cancel",
            "--prompt=Sessions> ",
            "--bind=enter:print(continue)+accept",
            "--bind=alt-enter:print(fork)+accept",
            f"--preview={shlex.quote(str(script_path))} --internal-preview {{1}}",
            "--preview-window=right:60%:wrap",
        ],
        input="\n".join(rows) + "\n",
        stdout=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0 or not result.stdout:
        return None
    action, _, selection = result.stdout.partition("\n")
    return action, selection.partition("\t")[0]


def main() -> int:
    # fzf reinvokes this script in an internal mode as the highlighted session changes.
    if sys.argv[1:2] == ["--internal-preview"]:
        if len(sys.argv) != 3:
            print(
                "usage: opencode-session-picker --internal-preview SESSION_ID",
                file=sys.stderr,
            )
            return 2
        preview_session(sys.argv[2])
        return 0

    for command in ("opencode", "fzf"):
        if shutil.which(command) is None:
            print(f"Missing required command: {command}", file=sys.stderr)
            return 1

    sessions = list_sessions()
    if not sessions:
        print("No OpenCode sessions found for this project.", file=sys.stderr)
        return 1

    selection = choose_session(sessions)
    if selection is None:
        return 0
    action, session_id = selection

    arguments = ["opencode", "--session", session_id]
    if action == "fork":
        arguments.append("--fork")
    # Replace the wrapper process so the selected OpenCode TUI owns the terminal directly.
    os.execvp(arguments[0], arguments)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, sqlite3.Error) as error:
        print(f"opencode-session-picker: {error}", file=sys.stderr)
        sys.exit(1)
