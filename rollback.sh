#!/bin/sh
# rollback.sh [sha]: point `current` back at the previous release (or the given sha).
set -u
PROD="${RING_SANDBOX_PROD:-$HOME/KEOS/ops/.local/mac/ring/sandbox-prod}"
TARGET="${1:-$(cat "$PROD/previous" 2>/dev/null || true)}"
[ -n "$TARGET" ] && [ -f "$PROD/releases/$TARGET/.complete" ] || { echo '{"ok":false,"error":"no previous release"}'; exit 1; }
CUR="$(basename "$(readlink "$PROD/current" 2>/dev/null || true)")"
ln -sfn "$PROD/releases/$TARGET" "$PROD/current"
printf '%s\n' "$CUR" > "$PROD/previous"
printf '{"ok":true,"sha":"%s","rolled_back_from":"%s","at":"%s"}\n' "$TARGET" "$CUR" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
