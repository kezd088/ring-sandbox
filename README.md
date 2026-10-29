# ring-sandbox

Tiny static site used by KEOS ring as a sandbox project. `deploy.sh <sha>` exports a commit into `releases/<sha>` and switches `current`; `rollback.sh` switches back; `serve.sh` serves `current` on 127.0.0.1:18890. CI runs `node --test`.

ring e2e verify-fail-twice 2026-10-29T15:42:21.210Z
