#!/bin/sh
# deploy.sh <sha>: export one commit into releases/<sha>, switch `current`, write a receipt with rollback.
set -u
PROD="${RING_SANDBOX_PROD:-$HOME/KEOS/ops/.local/mac/ring/sandbox-prod}"
REPO="$(cd "$(dirname "$0")" && pwd)"
SHA="$1"
[ -n "$SHA" ] || { echo '{"ok":false,"error":"usage: deploy.sh <sha>"}'; exit 2; }
SHA="$(git -C "$REPO" rev-parse --verify --quiet "$SHA^{commit}")" || { echo '{"ok":false,"error":"unknown commit"}'; exit 2; }
mkdir -p "$PROD/releases" "$PROD/receipts"
PREV="$(readlink "$PROD/current" 2>/dev/null || true)"
PREV_SHA="$(basename "$PREV" 2>/dev/null || true)"
REL="$PROD/releases/$SHA"
if [ ! -f "$REL/.complete" ]; then
  rm -rf "$REL"; mkdir -p "$REL"
  git -C "$REPO" archive --format=tar "$SHA" | tar -x -C "$REL" || { rm -rf "$REL"; echo '{"ok":false,"error":"export failed"}'; exit 1; }
  if [ -n "${RING_SANDBOX_DEPLOY_FAIL:-}" ]; then rm -rf "$REL"; echo "{\"ok\":false,\"error\":\"injected deploy failure\",\"previous_release\":\"$PREV_SHA\"}"; exit 1; fi
  printf '{"sha":"%s","build":"%s"}\n' "$SHA" "$(date -u +%Y%m%dT%H%M%SZ)" > "$REL/version.json"
  [ -f "$REL/index.html" ] && [ -f "$REL/api/health.json" ] || { rm -rf "$REL"; echo '{"ok":false,"error":"release incomplete"}'; exit 1; }
  touch "$REL/.complete"
fi
ln -sfn "$REL" "$PROD/current.tmp" && mv -Tf "$PROD/current.tmp" "$PROD/current" 2>/dev/null || { rm -f "$PROD/current.tmp"; ln -sfn "$REL" "$PROD/current"; }
printf '%s\n' "$PREV_SHA" > "$PROD/previous"
RECEIPT="$PROD/receipts/$(date -u +%Y%m%dT%H%M%SZ)-$SHA.json"
printf '{"ok":true,"sha":"%s","release":"%s","previous_release":"%s","rollback":"%s/rollback.sh","at":"%s"}\n' "$SHA" "$REL" "$PREV_SHA" "$REPO" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$RECEIPT"
cat "$RECEIPT"
