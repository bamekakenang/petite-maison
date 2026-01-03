#!/usr/bin/env bash
# Usage: ./scripts/deploy-nginx-https-macos.sh petitemaison.fr
# Requires: Homebrew (brew), nginx, certbot installed via brew.
set -euo pipefail
DOMAIN=${1:?"Domain required (e.g. petitemaison.fr)"}

BREW_PREFIX=$(brew --prefix)

if ! command -v brew >/dev/null; then
  echo "brew not found. Install Homebrew first: https://brew.sh" >&2
  exit 1
fi

# Install dependencies if missing
brew list nginx >/dev/null 2>&1 || brew install nginx
brew list certbot >/dev/null 2>&1 || brew install certbot
NGINX_ETC="$BREW_PREFIX/etc/nginx"
SERVER_DIR="$NGINX_ETC/servers"
mkdir -p "$SERVER_DIR"

template="infra/nginx/petitemaison.conf"
target="$SERVER_DIR/$DOMAIN.conf"
cp "$template" "$target"
# macOS sed requires '' for in-place
sed -i '' "s/DOMAIN/$DOMAIN/g" "$target"
# Ensure Certbot SSL parameter files exist before nginx test
CERTBOT_BASE=$(brew --prefix certbot)
CERTBOT_SSL_DH=$(find -L "$CERTBOT_BASE" -path '*ssl-dhparams.pem' -print -quit)
CERTBOT_OPTIONS=$(find -L "$CERTBOT_BASE" -path '*options-ssl-nginx.conf' -print -quit)
# Fallback to Cellar in case opt symlink not traversed
if [[ -z "$CERTBOT_SSL_DH" || -z "$CERTBOT_OPTIONS" ]]; then
  CERTBOT_CELLAR=$(brew --cellar certbot)
  CERTBOT_SSL_DH=${CERTBOT_SSL_DH:-$(find "$CERTBOT_CELLAR" -path '*ssl-dhparams.pem' -print -quit)}
  CERTBOT_OPTIONS=${CERTBOT_OPTIONS:-$(find "$CERTBOT_CELLAR" -path '*options-ssl-nginx.conf' -print -quit)}
fi
if [[ -z "$CERTBOT_SSL_DH" || -z "$CERTBOT_OPTIONS" ]]; then
  echo "Could not locate certbot SSL parameter files under $CERTBOT_BASE" >&2
  exit 1
fi
sudo mkdir -p /etc/letsencrypt
sudo cp -n "$CERTBOT_SSL_DH" /etc/letsencrypt/ssl-dhparams.pem
sudo cp -n "$CERTBOT_OPTIONS" /etc/letsencrypt/options-ssl-nginx.conf
# Stop nginx before issuing cert (standalone uses its own webserver)
brew services stop nginx >/dev/null 2>&1 || true
# Obtain cert (standalone challenge on :80)
sudo certbot certonly --standalone --preferred-challenges http -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN

# Include servers directory if not already
if ! grep -q "servers/" "$NGINX_ETC/nginx.conf"; then
  echo "include $SERVER_DIR/*;" | sudo tee -a "$NGINX_ETC/nginx.conf" >/dev/null
fi

sudo nginx -t -c "$NGINX_ETC/nginx.conf"
brew services restart nginx

echo "HTTPS enabled for $DOMAIN (nginx via Homebrew)."
