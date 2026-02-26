#!/bin/bash
# ============================================================================
#  SCRIPT DE DÉMO — Soutenance Bloc 3
#  La Petite Maison de l'Épouvante
#  
#  USAGE : Exécuter chaque section manuellement (copier/coller dans le terminal)
#  PRÉREQUIS : Le backend doit tourner → npm run dev (depuis backend/)
# ============================================================================

BASE_URL="http://localhost:3000/api/v1"

# ============================================================================
#  DÉMO 0 — PRÉPARATION (à faire AVANT la soutenance)
# ============================================================================

echo "============================================"
echo "  DÉMO 0 — Préparation"
echo "============================================"

# 1. S'assurer que la BDD est prête avec les données de seed
cd /Users/bamekakenang/Downloads/petite-maison-front-step2-i18n-fixed/backend
npm run prisma:generate
npx prisma db push --accept-data-loss
npm run prisma:seed

# 2. Lancer le serveur (dans un terminal séparé)
# npm run dev

echo "✅ Préparation terminée. Lancez 'npm run dev' dans un terminal séparé."

# ============================================================================
#  DÉMO 1 — HEALTH CHECK & MÉTRIQUES (Slide Environnement managé)
#  Montre : disponibilité, observabilité, endpoint système
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 1 — Health Check & Métriques"
echo "============================================"

# Health check — prouve que l'application est disponible
echo ""
echo "--- 1.1 Health Check ---"
curl -s $BASE_URL/health | python3 -m json.tool

# Métriques — montre l'observabilité temps réel
echo ""
echo "--- 1.2 Métriques applicatives ---"
curl -s $BASE_URL/metrics | python3 -m json.tool

# ============================================================================
#  DÉMO 2 — AUTHENTIFICATION (BF3 — Gestion des utilisateurs)
#  Montre : register, login, JWT, refresh token, logout
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 2 — Authentification complète (BF3)"
echo "============================================"

# 2.1 — Inscription d'un nouvel utilisateur
echo ""
echo "--- 2.1 Inscription (register) ---"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@petitemaison.fr",
    "password": "Demo2024!Secure",
    "firstName": "Démo",
    "lastName": "Soutenance"
  }' | python3 -m json.tool

# 2.2 — Connexion ADMIN (compte seed)
echo ""
echo "--- 2.2 Connexion Admin ---"
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@petitemaison.fr",
    "password": "password123"
  }')
echo "$ADMIN_RESPONSE" | python3 -m json.tool

# Extraire les tokens
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
ADMIN_REFRESH=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['refreshToken'])")
echo ""
echo "✅ Token ADMIN extrait (15min d'expiration)"

# 2.3 — Connexion CLIENT (compte seed)
echo ""
echo "--- 2.3 Connexion Client ---"
CLIENT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.fr",
    "password": "password123"
  }')
echo "$CLIENT_RESPONSE" | python3 -m json.tool

CLIENT_TOKEN=$(echo "$CLIENT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")
CLIENT_REFRESH=$(echo "$CLIENT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['refreshToken'])")
echo ""
echo "✅ Token CLIENT extrait"

# 2.4 — Rafraîchir un token (refresh)
echo ""
echo "--- 2.4 Refresh Token ---"
curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$CLIENT_REFRESH\"}" | python3 -m json.tool

# ============================================================================
#  DÉMO 3 — CATALOGUE PRODUITS (BF1 — Fonctionnalité métier 1)
#  Montre : CRUD complet, pagination, filtres, recherche
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 3 — Catalogue Produits (BF1)"
echo "============================================"

# 3.1 — Liste des produits (public, sans auth)
echo ""
echo "--- 3.1 Liste produits (page 1, 3 par page) ---"
curl -s "$BASE_URL/products?page=1&limit=3" | python3 -m json.tool

# 3.2 — Filtrer par catégorie
echo ""
echo "--- 3.2 Filtrer par catégorie 'Décoration' ---"
curl -s "$BASE_URL/products?category=D%C3%A9coration" | python3 -m json.tool

# 3.3 — Détail d'un produit
echo ""
echo "--- 3.3 Détail produit (id=1) ---"
curl -s "$BASE_URL/products/1" | python3 -m json.tool

# 3.4 — Catégories disponibles
echo ""
echo "--- 3.4 Catégories distinctes ---"
curl -s "$BASE_URL/products/categories" | python3 -m json.tool

# 3.5 — Créer un produit (ADMIN requis)
echo ""
echo "--- 3.5 Créer un produit (ADMIN) ---"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "sku": "FIGURINE-EVIL-001",
    "name": "Figurine Evil Ed - Édition Limitée",
    "description": "Figurine collector du collectif Evil Ed, 25cm, résine peinte à la main",
    "price": 79.99,
    "stock": 50,
    "category": "Figurines Evil Ed",
    "minStock": 10
  }' | python3 -m json.tool

# 3.6 — Produits en alerte stock (ADMIN)
echo ""
echo "--- 3.6 Alerte stock bas (ADMIN) ---"
curl -s "$BASE_URL/products/low-stock" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

# ============================================================================
#  DÉMO 4 — COMMANDES (BF2 — Fonctionnalité métier 2)
#  Montre : cycle de vie complet PENDING → CONFIRMED → ... → DELIVERED
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 4 — Commandes (BF2)"
echo "============================================"

# 4.1 — Créer une commande (CLIENT)
echo ""
echo "--- 4.1 Créer une commande (CLIENT) ---"
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 3, "quantity": 1}
    ],
    "shippingAddress": "4 Rue du Festival, 16000 Angoulême",
    "billingAddress": "4 Rue du Festival, 16000 Angoulême"
  }')
echo "$ORDER_RESPONSE" | python3 -m json.tool

ORDER_ID=$(echo "$ORDER_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])")
echo ""
echo "✅ Commande créée : ID=$ORDER_ID (statut: PENDING)"

# 4.2 — Traiter le paiement
echo ""
echo "--- 4.2 Paiement de la commande ---"
curl -s -X POST "$BASE_URL/orders/$ORDER_ID/pay" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" | python3 -m json.tool

# 4.3 — Faire avancer le statut (ADMIN) : CONFIRMED → PROCESSING → SHIPPED → DELIVERED
echo ""
echo "--- 4.3 Cycle de vie : CONFIRMED → PROCESSING (ADMIN) ---"
curl -s -X PUT "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "PROCESSING"}' | python3 -m json.tool

echo ""
echo "--- 4.4 PROCESSING → SHIPPED (ADMIN) ---"
curl -s -X PUT "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "SHIPPED"}' | python3 -m json.tool

echo ""
echo "--- 4.5 SHIPPED → DELIVERED (ADMIN) ---"
curl -s -X PUT "$BASE_URL/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "DELIVERED"}' | python3 -m json.tool

# 4.6 — Consulter les statistiques des commandes
echo ""
echo "--- 4.6 Statistiques commandes ---"
curl -s "$BASE_URL/orders/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool

# ============================================================================
#  DÉMO 5 — SÉCURITÉ (Bonnes pratiques intégrées au POC)
#  Montre : 401, 403, Helmet headers, validation, rate limiting
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 5 — Sécurité"
echo "============================================"

# 5.1 — Accès sans token → 401 Unauthorized
echo ""
echo "--- 5.1 Sans token → 401 Unauthorized ---"
curl -s $BASE_URL/orders | python3 -m json.tool

# 5.2 — Token CLIENT sur endpoint ADMIN → 403 Forbidden
echo ""
echo "--- 5.2 CLIENT sur endpoint ADMIN → 403 Forbidden ---"
curl -s -X DELETE "$BASE_URL/products/1" \
  -H "Authorization: Bearer $CLIENT_TOKEN" | python3 -m json.tool

# 5.3 — Token invalide/expiré → 401
echo ""
echo "--- 5.3 Token invalide → 401 ---"
curl -s $BASE_URL/orders \
  -H "Authorization: Bearer token_bidon_invalide" | python3 -m json.tool

# 5.4 — Headers Helmet (sécurité HTTP)
echo ""
echo "--- 5.4 Headers Helmet (sécurité HTTP) ---"
curl -s -I $BASE_URL/health 2>/dev/null | grep -iE "x-|strict|content-security|referrer"

# 5.5 — Validation des entrées (express-validator)
echo ""
echo "--- 5.5 Validation entrées → erreurs détaillées ---"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pas-un-email",
    "password": "123"
  }' | python3 -m json.tool

# 5.6 — Création produit avec données invalides
echo ""
echo "--- 5.6 Produit invalide → validation ---"
curl -s -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "sku": "",
    "name": "",
    "price": -10,
    "stock": -5,
    "category": ""
  }' | python3 -m json.tool

# ============================================================================
#  DÉMO 6 — TESTS (Processus de test formalisé)
#  Montre : 33+ tests, couverture 85%, 0 échec
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 6 — Tests (Jest + Supertest)"
echo "============================================"
echo ""
echo "Exécutez dans un terminal séparé :"
echo "  cd /Users/bamekakenang/Downloads/petite-maison-front-step2-i18n-fixed/backend"
echo "  npm test"
echo ""
echo "Résultat attendu :"
echo "  ✅ 33+ tests passing"
echo "  ✅ Couverture : 85% lignes, 85% statements, 82% fonctions"
echo "  ✅ Seuil 70% respecté"

# ============================================================================
#  DÉMO 7 — LINT & QUALITÉ DU CODE (Gate 1)
#  Montre : 0 erreur ESLint, TypeScript compile, complexité OK
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 7 — Lint & Qualité du code"
echo "============================================"
echo ""
echo "Exécutez dans un terminal séparé :"
echo "  cd /Users/bamekakenang/Downloads/petite-maison-front-step2-i18n-fixed/backend"
echo "  npm run lint"
echo "  npx tsc --noEmit"
echo ""
echo "Résultat attendu :"
echo "  ✅ 0 erreur ESLint"
echo "  ✅ TypeScript compile sans erreur"

# ============================================================================
#  DÉMO 8 — OBSERVABILITÉ (Logs Winston)
#  Montre : logs structurés JSON, rotation, fichiers séparés
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 8 — Observabilité (Logs)"
echo "============================================"
echo ""
echo "Après avoir exécuté les démos précédentes, montrez les logs :"
echo "  ls -la /Users/bamekakenang/Downloads/petite-maison-front-step2-i18n-fixed/backend/logs/"
echo ""
echo "Puis affichez un extrait :"
echo "  tail -5 /Users/bamekakenang/Downloads/petite-maison-front-step2-i18n-fixed/backend/logs/combined-*.log | python3 -m json.tool"
echo ""
echo "Points à souligner :"
echo "  → Logs JSON structurés (timestamp, level, message, metadata)"
echo "  → Rotation quotidienne (combined-YYYY-MM-DD.log)"
echo "  → Fichier erreurs séparé (error-YYYY-MM-DD.log)"
echo "  → Rétention 14 jours automatique"

# ============================================================================
#  DÉMO 9 — PIPELINE CI/CD (GitHub Actions)
#  Montre : pipeline en live sur GitHub
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 9 — Pipeline CI/CD (GitHub)"
echo "============================================"
echo ""
echo "Ouvrez dans le navigateur :"
echo "  https://github.com/bamekakenang/petite-maison/actions"
echo ""
echo "Points à montrer :"
echo "  1. Workflow 'CI/CD Pipeline' → dernier run vert ✅"
echo "  2. Les 10 jobs avec dépendances (lint → test → build → security → deploy)"
echo "  3. Le job 'test-backend' → logs couverture 85%"
echo "  4. Le job 'security-backend' → npm audit + Snyk"
echo "  5. Workflow 'CI-CD Azure WebApps' → déploiement Azure réussi ✅"

# ============================================================================
#  DÉMO 10 — LOGOUT (fin du cycle auth)
# ============================================================================

echo ""
echo "============================================"
echo "  DÉMO 10 — Déconnexion"
echo "============================================"

echo ""
echo "--- 10.1 Logout (invalidation du refresh token) ---"
curl -s -X POST $BASE_URL/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$CLIENT_REFRESH\"}" | python3 -m json.tool

echo ""
echo "--- 10.2 Tentative refresh après logout → échec ---"
curl -s -X POST $BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$CLIENT_REFRESH\"}" | python3 -m json.tool

echo ""
echo "✅ Token invalidé — le refresh ne fonctionne plus après logout"

# ============================================================================
echo ""
echo "============================================"
echo "  🎉 FIN DES DÉMOS"
echo "============================================"
echo ""
echo "Résumé des points couverts :"
echo "  ✅ Health check + métriques (disponibilité, observabilité)"
echo "  ✅ Auth complète : register → login → refresh → logout (BF3)"
echo "  ✅ Catalogue produits : CRUD, filtres, pagination, catégories (BF1)"
echo "  ✅ Commandes : cycle PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED (BF2)"
echo "  ✅ Sécurité : 401, 403, Helmet headers, validation entrées"
echo "  ✅ Tests : 33+ tests, couverture 85%"
echo "  ✅ Lint : 0 erreur ESLint, TypeScript strict"
echo "  ✅ Logs : JSON structurés, rotation, rétention"
echo "  ✅ Pipeline CI/CD : 10 jobs, 6 quality gates"
echo "  ✅ Invalidation token : refresh bloqué après logout"
