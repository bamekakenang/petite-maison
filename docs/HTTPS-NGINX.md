# HTTPS rapide (Nginx + Certbot)

## Schéma
Client → Nginx (TLS termination, redirection HTTP→HTTPS) → Backend (http://localhost:3000) + Frontend (http://localhost:3001)

## Étapes
1) Installer nginx + certbot (Debian/Ubuntu)
```bash
sudo apt-get update && sudo apt-get install -y nginx certbot python3-certbot-nginx
```

2) Créer un serveur pour le frontend (3001) et backend (3000)
Fichier `/etc/nginx/sites-available/petitemaison.conf` :
```nginx
server {
    listen 80;
    server_name petitemaison.fr www.petitemaison.fr;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name petitemaison.fr www.petitemaison.fr;

    ssl_certificate /etc/letsencrypt/live/petitemaison.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/petitemaison.fr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Sécurité
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Frontend Next.js (port 3001)
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:3001;
    }

    # Backend API (port 3000)
    location /api/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:3000;
    }
}
```
Activer :
```bash
sudo ln -s /etc/nginx/sites-available/petitemaison.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

3) Certificat Let’s Encrypt
```bash
sudo certbot --nginx -d petitemaison.fr -d www.petitemaison.fr --redirect --non-interactive --agree-tos -m admin@petitemaison.fr
```
Certbot renouvelle automatiquement via cron.

## Cookies sécurisés
- En prod : `secure: true`, `sameSite: strict`, `httpOnly` pour les tokens (déjà configuré).
- Forcer `NODE_ENV=production` pour activer `secure` dans les routes Next API.

## Tests rapides
```bash
curl -I https://petitemaison.fr/health
curl -k -I https://petitemaison.fr/api/v1/products
```
