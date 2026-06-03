#!/bin/bash
set -euo pipefail
ROOT=/var/www/tradenix-venture
DOMAIN=https://invest.relogico.online

cd "$ROOT"
rm -rf frontend
tar -xzf /tmp/frontend-src.tar.gz -C "$ROOT"

cp /tmp/package.json "$ROOT/" 2>/dev/null || true
cp /tmp/README.md "$ROOT/" 2>/dev/null || true

cp "$ROOT/deploy/frontend.env.production" "$ROOT/frontend/.env"
chmod +x "$ROOT/deploy/rebuild-production.sh"

# Ensure backend production URLs (preserve existing JWT_SECRET)
if [ -f "$ROOT/backend/.env" ]; then
  grep -q '^CLIENT_URL=' "$ROOT/backend/.env" && sed -i "s|^CLIENT_URL=.*|CLIENT_URL=${DOMAIN}|" "$ROOT/backend/.env"
fi

cd "$ROOT/frontend"
npm ci
npm run build

cd "$ROOT"
if [ ! -d .git ]; then
  git init -b main
  cat > .gitignore <<'GITEOF'
node_modules/
backend/node_modules/
frontend/node_modules/
backend/.env
frontend/.env
deploy/release.tar.gz
deploy/frontend-src.tar.gz
id_rsa
*.pem
GITEOF
  git add -A
  git config user.email "deploy@relogico.online"
  git config user.name "Tradenix Deploy"
  git commit -m "Production baseline on invest.relogico.online"
fi

echo "DEV_SETUP_DONE"
