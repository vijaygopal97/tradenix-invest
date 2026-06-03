#!/usr/bin/env bash
# Revert Invest With Flair UI to the pre-flair baseline and rebuild production.
set -euo pipefail
ROOT=/var/www/tradenix-venture
cd "$ROOT"

if ! git rev-parse pre-flair-ui >/dev/null 2>&1; then
  echo "error: git tag pre-flair-ui not found" >&2
  exit 1
fi

echo "Restoring frontend from tag pre-flair-ui…"
git checkout pre-flair-ui -- frontend/

echo "Rebuilding production…"
bash "$ROOT/deploy/rebuild-production.sh"
echo "UI reverted. Hard-refresh https://invest.relogico.online"
