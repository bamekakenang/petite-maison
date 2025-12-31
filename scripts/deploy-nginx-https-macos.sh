#!/usr/bin/env bash
# Usage: sudo ./scripts/deploy-nginx-https-macos.sh petitemaison.fr
# Requires: Homebrew (brew), nginx, certbot installed via brew.
set -euo pipefail
DOMAIN=${1:?"Domain required (e.g. petitemaison.fr)"}

if ! command -v brew >/dev/null; then
  echo "brew not found. Install Homebrew first: https://brew.sh" >&2
  exit 1
fi

# Install dependencies if missing
brew list nginx >/dev/null 2>&1 || brew install nginx
brew list certbot >/dev/null 2>&1 || brew install certbot

NGINX_ETC="/usr/local/etc/nginx"
SERVER_DIR="$NGINX_ETC/servers"
mkdir -p "$SERVER_DIR"

template="infra/nginx/petitemaison.conf"
target="$SERVER_DIR/$DOMAIN.conf"
cp "$template" "$target"
# macOS sed requires '' for in-place
sed -i '' "s/DOMAIN/$DOMAIN/g" "$target"

# Include servers directory if not already
if ! grep -q "servers/" "$NGINX_ETC/nginx.conf"; then
  echo "include $SERVER_DIR/*;" | sudo tee -a "$NGINX_ETC/nginx.conf" >/dev/null
fi

sudo nginx -t -c "$NGINX_ETC/nginx.conf"
sudo brew services restart nginx

# Obtain cert (webroot challenge handled by nginx site)
sudo certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN --redirect

sudo brew services restart nginx

echo "HTTPS enabled for $DOMAIN (nginx via Homebrew)."
