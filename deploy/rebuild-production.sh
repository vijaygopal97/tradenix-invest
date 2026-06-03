#!/bin/bash
# After editing code on the server, run from /var/www/tradenix-venture:
#   bash deploy/rebuild-production.sh
set -euo pipefail
ROOT=/var/www/tradenix-venture
cd "$ROOT/frontend"
npm ci
npm run build
cd "$ROOT/backend"
npm ci --omit=dev
pm2 reload tradenix-api
echo "Production rebuild complete: https://invest.relogico.online"
