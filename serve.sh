#!/bin/sh
# serve.sh: serve the `current` release on 127.0.0.1:18890 (the sandbox "production").
PROD="${RING_SANDBOX_PROD:-$HOME/KEOS/ops/.local/mac/ring/sandbox-prod}"
mkdir -p "$PROD"
exec python3 -m http.server "${RING_SANDBOX_PORT:-18890}" --bind 127.0.0.1 --directory "$PROD/current"
