#!/usr/bin/env python3

import json
import os
import shlex
import shutil
import sqlite3
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote


def preview_session(session_id: str) -> None:
    data_home = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local/share"))
    db_path = data_home / "opencode" / "opencode.db"
    db_uri = f"file:{quote(str(db_path), safe='/')}?mode=ro"

    # Keep the preview conversational by excluding tool calls and reasoning parts.
    with sqlite3.connect(db_uri, uri=True) as connection:
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
    # OpenCode scopes this list to the Git project associated with the current directory.
    result = subprocess.run(
        ["opencode", "session", "list", "--format", "json", "-n", "100"],
        check=True,
        stdout=subprocess.PIPE,
        text=True,
    )
    sessions = json.loads(result.stdout)
    rows = []

    for session in sessions:
        updated = datetime.fromtimestamp(session["updated"] / 1000)
        title = session["title"].translate(
            str.maketrans({"\t": " ", "\r": " ", "\n": " "})
        )
        directory = Path(session["directory"]).name
        # The hidden first TSV field carries the session ID through selection.
        rows.append(f"{session['id']}\t{updated:%Y-%m-%d %H:%M}\t{title}\t{directory}")

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
            f"--preview={shlex.quote(str(script_path))} --preview {{1}}",
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
    if len(sys.argv) >= 2 and sys.argv[1] == "--preview":
        preview_session(sys.argv[2] if len(sys.argv) >= 3 else "")
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
    except (json.JSONDecodeError, OSError, sqlite3.Error, subprocess.CalledProcessError) as error:
        print(f"opencode-session-picker: {error}", file=sys.stderr)
        sys.exit(1)
