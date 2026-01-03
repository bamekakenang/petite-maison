#!/usr/bin/env bash
# Usage: sudo ./deploy-nginx-https.sh <domain>
set -euo pipefail
DOMAIN=${1:?"Domain required (e.g. petitemaison.fr)"}

apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

cp infra/nginx/petitemaison.conf /etc/nginx/sites-available/$DOMAIN.conf
sed -i "s/DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN.conf
ln -sf /etc/nginx/sites-available/$DOMAIN.conf /etc/nginx/sites-enabled/$DOMAIN.conf

nginx -t
systemctl reload nginx

certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --redirect --non-interactive --agree-tos -m admin@$DOMAIN
systemctl reload nginx

echo "HTTPS enabled for $DOMAIN"
