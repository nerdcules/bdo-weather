#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  append-copilot-log.sh --role prompt|response [--text "message"]
  append-copilot-log.sh --role prompt|response < message.txt

Options:
  --role   Entry role. Allowed values: prompt, response
  --text   Entry text. If omitted, script reads from stdin.
EOF
}

role=""
text=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --role)
      role="${2:-}"
      shift 2
      ;;
    --text)
      text="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ "$role" != "prompt" && "$role" != "response" ]]; then
  echo "Error: --role must be 'prompt' or 'response'." >&2
  usage >&2
  exit 1
fi

if [[ -z "$text" ]]; then
  if [[ -t 0 ]]; then
    echo "Error: no --text provided and no stdin data." >&2
    usage >&2
    exit 1
  fi
  text="$(cat)"
fi

repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
log_dir="$repo_root/.copilot-logs"
mkdir -p "$log_dir"

day="$(date '+%Y-%m-%d')"
ts="$(date '+%Y-%m-%d %H:%M:%S %Z')"
base_file="$log_dir/$day.md"

pick_log_file() {
  local candidate="$base_file"
  local index=2

  if [[ ! -f "$candidate" ]]; then
    echo "$candidate"
    return
  fi

  local size
  size=$(wc -c < "$candidate")
  if (( size <= 1048576 )); then
    echo "$candidate"
    return
  fi

  while :; do
    candidate="$log_dir/${day}-part${index}.md"
    if [[ ! -f "$candidate" ]]; then
      echo "$candidate"
      return
    fi

    size=$(wc -c < "$candidate")
    if (( size <= 1048576 )); then
      echo "$candidate"
      return
    fi

    index=$((index + 1))
  done
}

log_file="$(pick_log_file)"

if [[ ! -f "$log_file" ]]; then
  if [[ "$log_file" == "$base_file" ]]; then
    printf '# Copilot Interaction Log - %s\n\n' "$day" > "$log_file"
  else
    part_name="$(basename "$log_file" .md)"
    printf '# Copilot Interaction Log - %s (%s)\n\n' "$day" "$part_name" > "$log_file"
  fi
fi

redact_sensitive() {
  sed -E \
    -e 's/(gh[pousr]_[A-Za-z0-9_]+)/[REDACTED]/g' \
    -e 's/(github_pat_[A-Za-z0-9_]+)/[REDACTED]/g' \
    -e 's/((api|access|secret|private|token)[_-]?(key|token)?[[:space:]]*[:=][[:space:]]*)[^[:space:]]+/\1[REDACTED]/Ig'
}

clean_text="$(printf '%s' "$text" | redact_sensitive)"
heading_role="Prompt"
if [[ "$role" == "response" ]]; then
  heading_role="Response"
fi

{
  printf '## [%s] %s\n' "$ts" "$heading_role"
  printf '%s\n\n' "$clean_text"
  printf -- '---\n\n'
} >> "$log_file"

echo "Logged $heading_role entry to $log_file"
