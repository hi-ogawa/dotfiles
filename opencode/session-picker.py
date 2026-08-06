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
        rows.append(f"{session['id']}\t{updated:%Y-%m-%d %H:%M}\t{title}\t{directory}")

    return rows


def choose_session(rows: list[str]) -> str | None:
    script_path = Path(__file__).resolve()
    result = subprocess.run(
        [
            "fzf",
            "--ansi",
            "--delimiter=\t",
            "--with-nth=2..",
            "--layout=reverse",
            "--header=enter: select | esc: cancel",
            "--prompt=Sessions> ",
            f"--preview={shlex.quote(str(script_path))} --preview {{1}}",
            "--preview-window=right:60%:wrap",
        ],
        input="\n".join(rows) + "\n",
        stdout=subprocess.PIPE,
        text=True,
    )
    if result.returncode != 0 or not result.stdout:
        return None
    return result.stdout.partition("\t")[0]


def choose_action() -> bool | None:
    while True:
        try:
            action = input("\nenter: continue | f: fork | q: cancel ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            return None

        if not action:
            return False
        if action == "f":
            return True
        if action == "q":
            return None


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

    session_id = choose_session(sessions)
    if session_id is None:
        return 0

    fork = choose_action()
    if fork is None:
        return 0

    arguments = ["opencode", "--session", session_id]
    if fork:
        arguments.append("--fork")
    os.execvp(arguments[0], arguments)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (json.JSONDecodeError, OSError, sqlite3.Error, subprocess.CalledProcessError) as error:
        print(f"opencode-session-picker: {error}", file=sys.stderr)
        sys.exit(1)
