import argparse
import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parent
LABEL = "io.github.hi-ogawa.ho-desktop"
BUILD_PATH = ROOT / ".build" / "ho-desktop"
BIN_PATH = Path.home() / ".local/bin/ho-desktop"
PLIST_PATH = Path.home() / f"Library/LaunchAgents/{LABEL}.plist"
LOG_DIR = Path.home() / "Library/Logs/ho-desktop"
DOMAIN = f"gui/{os.getuid()}"


def run(args, *, check=True, quiet=False):
    return subprocess.run(
        [str(arg) for arg in args],
        check=check,
        stdout=subprocess.DEVNULL if quiet else None,
        stderr=subprocess.DEVNULL if quiet else None,
    )


def build() -> None:
    BUILD_PATH.parent.mkdir(parents=True, exist_ok=True)
    run([
        "swiftc",
        ROOT / "main.swift",
        "-O",
        "-framework",
        "AppKit",
        "-framework",
        "ApplicationServices",
        "-framework",
        "Carbon",
        "-o",
        BUILD_PATH,
    ])

    # Give macOS a fixed identity for the executable that requests Accessibility access.
    # https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Introduction/Introduction.html
    run(["codesign", "--force", "--sign", "-", "--identifier", LABEL, BUILD_PATH])
    print(f"Built {BUILD_PATH}")


def atomic_copy(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        shutil.copy2(source, temporary_path)
        temporary_path.chmod(0o755)
        temporary_path.replace(destination)
    finally:
        temporary_path.unlink(missing_ok=True)


def write_launch_agent() -> None:
    PLIST_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    # A per-user LaunchAgent runs inside the logged-in GUI session required by Accessibility APIs.
    # https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html
    properties = {
        "Label": LABEL,
        "ProgramArguments": [str(BIN_PATH)],
        "RunAtLoad": True,
        "KeepAlive": {"SuccessfulExit": False},
        "ProcessType": "Interactive",
        "StandardOutPath": str(LOG_DIR / "stdout.log"),
        "StandardErrorPath": str(LOG_DIR / "stderr.log"),
    }
    with PLIST_PATH.open("wb") as file:
        plistlib.dump(properties, file, sort_keys=False)
    # Reject malformed output before asking launchd to load it.
    run(["plutil", "-lint", PLIST_PATH], quiet=True)


def install() -> None:
    if not BUILD_PATH.is_file():
        raise SystemExit(f"Build artifact not found: run '{Path(__file__).name} build' first")
    atomic_copy(BUILD_PATH, BIN_PATH)
    write_launch_agent()

    if run([BIN_PATH, "--check"], check=False).returncode != 0:
        run([BIN_PATH, "--request-permission"], check=False)
        # Deep-link to Privacy & Security > Accessibility, where the user grants access.
        # https://support.apple.com/guide/mac-help/mh43185/mac
        run(["open", "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"])
        print(f"\nGrant Accessibility access to {BIN_PATH}, then run install again.")
        raise SystemExit(1)

    # Reload the job in the current GUI user's launchd domain after replacing its files.
    run(["launchctl", "bootout", DOMAIN, PLIST_PATH], check=False, quiet=True)
    run(["launchctl", "bootstrap", DOMAIN, PLIST_PATH])
    print(f"Installed and started {LABEL}")
    print(f"Logs: {LOG_DIR}")


def uninstall() -> None:
    # Unload the job before removing the executable and job definition.
    run(["launchctl", "bootout", DOMAIN, PLIST_PATH], check=False, quiet=True)
    PLIST_PATH.unlink(missing_ok=True)
    BIN_PATH.unlink(missing_ok=True)
    print(f"Removed {LABEL}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("build", "install", "uninstall"))
    args = parser.parse_args()
    {"build": build, "install": install, "uninstall": uninstall}[args.command]()


if __name__ == "__main__":
    main()
