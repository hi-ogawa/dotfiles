# Claude Code Configuration

## Files

- `settings.json` - Synced to `~/.claude/settings.json`
- `notify.sh` - Notification hook script

## Notifications

Notifications use [hooks](https://code.claude.com/docs/en/hooks) to trigger native OS notifications when Claude is waiting for input.

### Setup

**Windows:** Install [BurntToast](https://github.com/Windos/BurntToast):
```powershell
Install-Module -Name BurntToast -Scope CurrentUser
```

> Note: The script uses the lower-level BurntToast API (`New-BTContent` with `-ActivationType Protocol`) instead of `New-BurntToastNotification` to prevent a shell window from flashing when clicking notifications.

The notification icon (`claude-icon.png`) is from [UXWing](https://uxwing.com/claude-ai-icon/) (free for commercial use, no attribution required).

**Linux:** Ensure `notify-send` and `jq` are installed.

### Hook Input

The notification hook receives JSON via stdin:
```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/dir",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "notification_type": "permission_prompt"
}
```

### Notification Types

| Matcher | Description |
|---------|-------------|
| `""` | All notifications |
| `permission_prompt` | Permission requests only |
| `idle_prompt` | Idle for 60+ seconds |

## See Also

- [Claude Code Hooks Docs](https://code.claude.com/docs/en/hooks)
