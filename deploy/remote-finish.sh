#!/bin/bash
set -euo pipefail

APP_ROOT=/var/www/tradenix-venture
DOMAIN=invest.relogico.online

cd "$APP_ROOT/backend"
npm ci --omit=dev

JWT_SECRET=$(openssl rand -hex 48)
cat > "$APP_ROOT/backend/.env" <<EOF
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tradenix_venture
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CLIENT_URL=https://${DOMAIN}
ADMIN_EMAIL=admin@tradenix.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Tradenix Admin
DEFAULT_DAILY_INTEREST=0.5
EOF
chmod 600 "$APP_ROOT/backend/.env"

node scripts/import-db.mjs

cp "$APP_ROOT/deploy/ecosystem.config.cjs" /etc/tradenix/ecosystem.config.cjs 2>/dev/null || mkdir -p /etc/tradenix && cp "$APP_ROOT/deploy/ecosystem.config.cjs" /etc/tradenix/ecosystem.config.cjs

pm2 delete tradenix-api 2>/dev/null || true
pm2 start /etc/tradenix/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

cp "$APP_ROOT/deploy/nginx-${DOMAIN}.conf" /etc/nginx/sites-available/${DOMAIN}
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if ! command -v certbot >/dev/null 2>&1; then
  apt-get install -y -qq certbot python3-certbot-nginx
fi

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@${DOMAIN#*.} --redirect || certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo "DEPLOY_FINISH_DONE"
