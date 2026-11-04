#!/usr/bin/env python3

"""Remove entries for missing paths from VS Code's Open Recent list.

Tested only with VS Code 1.144.1 on macOS 26.5. The script relies on VS Code
internals that are not a public API:

- the list is stored under KEY in SHARED_DB
- each entry has a folderUri, fileUri, or workspace.configPath
- a running VS Code holds GLOBAL_DB open, which lsof can detect

On another platform or VS Code version, check these with --dry-run and lsof
before a real run. If the running check misses VS Code, the edit is silently lost.
"""

import argparse
import json
import os
import shutil
import sqlite3
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

KEY = "history.recentlyOpenedPathsList"

# Older versions stored the list in GLOBAL_DB. It moved to storage shared with the agents window.
SHARED_DB = Path.home() / ".vscode-shared/sharedStorage/state.vscdb"

if sys.platform == "darwin":
    GLOBAL_DB = Path.home() / "Library/Application Support/Code/User/globalStorage/state.vscdb"
else:
    GLOBAL_DB = Path.home() / ".config/Code/User/globalStorage/state.vscdb"


def vscode_running() -> bool:
    # VS Code keeps the list in memory and writes it back on the next change,
    # so an edit made while it runs is lost. It holds the global DB open while it runs.
    result = subprocess.run(["lsof", "-w", str(GLOBAL_DB)], capture_output=True)
    return result.returncode == 0


def entry_path(entry: dict) -> str | None:
    uri = entry.get("folderUri") or entry.get("fileUri") or entry.get("workspace", {}).get("configPath")
    if not uri or not uri.startswith("file://"):
        return None
    return unquote(urlparse(uri).path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove entries for missing paths from VS Code's Open Recent list.")
    parser.add_argument("-n", "--dry-run", action="store_true", help="list entries to remove without changing anything")
    args = parser.parse_args()

    if not args.dry_run and vscode_running():
        sys.exit("VS Code is running. Quit it first, because it overwrites the list on its next change.")

    with sqlite3.connect(SHARED_DB) as connection:
        row = connection.execute("SELECT value FROM ItemTable WHERE key = ?", (KEY,)).fetchone()
        if row is None:
            sys.exit(f"{KEY} not found in {SHARED_DB}")
        data = json.loads(row[0])

        missing = []
        kept = []
        for entry in data["entries"]:
            path = entry_path(entry)
            if path is not None and not os.path.exists(path):
                missing.append(path)
            else:
                kept.append(entry)

        for path in missing:
            print(path)
        print(f"{len(missing)} of {len(data['entries'])} entries point to missing paths", file=sys.stderr)
        if args.dry_run or not missing:
            return

        shutil.copyfile(SHARED_DB, SHARED_DB.with_name(SHARED_DB.name + ".prune-backup"))
        data["entries"] = kept
        connection.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(data), KEY))
    print("removed", file=sys.stderr)


if __name__ == "__main__":
    main()
