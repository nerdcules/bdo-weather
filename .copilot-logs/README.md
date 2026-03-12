# Copilot Interaction Logs

This folder stores markdown logs of all Copilot prompts and responses.

## Automation
- Use scripts/append-copilot-log.sh to append entries in the required format.
- The script auto-creates the daily file, applies timestamp format, and redacts sensitive tokens.
- The script keeps files append-only and rotates to -part2 files when a daily file exceeds 1 MB.

Examples:
- scripts/append-copilot-log.sh --role prompt --text "Implement weather endpoint"
- scripts/append-copilot-log.sh --role response --text "Added endpoint and tests"

## File Convention
- One file per day: `YYYY-MM-DD.md`
- Timestamps use local time in ISO-like format: `YYYY-MM-DD HH:mm:ss`

## Entry Format
## [YYYY-MM-DD HH:mm:ss] Prompt
<user prompt text>

## [YYYY-MM-DD HH:mm:ss] Response
<assistant response text>

---
