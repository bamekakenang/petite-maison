# 🚀 Guide de Démarrage Rapide

## Prérequis

- Node.js >= 18.0.0
- npm >= 9.0.0

## Installation et Lancement (5 minutes)

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Créer et initialiser la base de données
npm run prisma:migrate

# 5. Peupler avec des données de test
npm run prisma:seed

# 6. Lancer le serveur en mode développement
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

## ✅ Vérification

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Liste des produits
curl http://localhost:3000/api/v1/products

# Connexion admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petitemaison.fr","password":"password123"}'
```

## 🧪 Tests des 2 Fonctionnalités Métier

### Fonctionnalité 1: Gestion Catalogue Produits

```bash
# 1. Lister les produits avec pagination
curl "http://localhost:3000/api/v1/products?page=1&limit=5"

# 2. Filtrer par catégorie
curl "http://localhost:3000/api/v1/products?category=Mobilier"

# 3. Recherche
curl "http://localhost:3000/api/v1/products?search=lampe"

# 4. Filtrer par prix
curl "http://localhost:3000/api/v1/products?minPrice=50&maxPrice=200"

# 5. Produits en stock uniquement
curl "http://localhost:3000/api/v1/products?inStock=true"

# 6. Obtenir un produit spécifique
curl http://localhost:3000/api/v1/products/1

# 7. Catégories disponibles
curl http://localhost:3000/api/v1/products/categories

# 8. Créer un produit (ADMIN uniquement)
# D'abord, se connecter
export TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petitemaison.fr","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

curl -X POST http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "NEW-001",
    "name": "Nouveau Produit Test",
    "description": "Description du nouveau produit",
    "price": 99.99,
    "stock": 25,
    "category": "Test",
    "minStock": 5
  }'

# 9. Mettre à jour un produit (ADMIN)
curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 79.99, "stock": 45}'

# 10. Produits avec stock faible (ADMIN)
curl http://localhost:3000/api/v1/products/low-stock \
  -H "Authorization: Bearer $TOKEN"
```

### Fonctionnalité 2: Gestion des Commandes

```bash
# 1. Se connecter en tant que client
export CLIENT_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.fr","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Créer une commande
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": 1, "quantity": 2},
      {"productId": 2, "quantity": 1}
    ],
    "shippingAddress": "123 Rue de la Paix, 75001 Paris, France",
    "billingAddress": "123 Rue de la Paix, 75001 Paris, France",
    "paymentMethod": "CARD",
    "notes": "Livraison rapide SVP"
  }'

# 3. Lister mes commandes
curl http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# 4. Voir le détail d'une commande
curl http://localhost:3000/api/v1/orders/1 \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# 5. Payer une commande
curl -X POST http://localhost:3000/api/v1/orders/1/pay \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# 6. Statistiques de mes commandes
curl http://localhost:3000/api/v1/orders/stats \
  -H "Authorization: Bearer $CLIENT_TOKEN"

# 7. Changer le statut d'une commande (ADMIN)
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petitemaison.fr","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

curl -X PUT http://localhost:3000/api/v1/orders/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'

# 8. Annuler une commande (retour automatique du stock)
curl -X PUT http://localhost:3000/api/v1/orders/2/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED"}'

# 9. Toutes les commandes (ADMIN)
curl http://localhost:3000/api/v1/orders?page=1&limit=10 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 10. Statistiques globales (ADMIN)
curl http://localhost:3000/api/v1/orders/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 📊 Métriques et Observabilité

```bash
# Métriques applicatives
curl http://localhost:3000/api/v1/metrics

# Consulter les logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Logs d'erreurs uniquement
tail -f logs/error-$(date +%Y-%m-%d).log
```

## 🧪 Tests

```bash
# Tous les tests
npm test

# Avec coverage
npm test -- --coverage

# Tests en mode watch
npm run test:watch

# Tests d'intégration uniquement
npm run test:integration

# Linting
npm run lint

# Fix auto des problèmes de linting
npm run lint:fix
```

## 📈 Tests de Charge

```bash
# Installer Artillery globalement
npm install -g artillery

# Lancer les tests de charge
npm run load-test

# Ou directement
artillery run load-test.yml
```

**Résultats attendus**:
- 50 req/s soutenus pendant 3 minutes
- Temps de réponse p95 < 200ms
- 0 erreur 5xx

## 🔧 Développement

```bash
# Mode watch (redémarrage automatique)
npm run dev

# Build pour production
npm run build

# Lancer en production
npm start

# Prisma Studio (interface graphique DB)
npm run prisma:studio

# Nouvelle migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

## 🐳 Docker (Optionnel)

```bash
# Build image
docker build -t petite-maison-backend .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./prisma/dev.db" \
  -e JWT_SECRET="your_secret" \
  petite-maison-backend
```

## 📝 Comptes de Test

| Email                    | Mot de passe | Rôle     |
|-------------------------|--------------|----------|
| admin@petitemaison.fr   | password123  | ADMIN    |
| client@example.fr       | password123  | CUSTOMER |

## 🔍 Exemples de Scénarios Complets

### Scénario 1: Client achète des produits

```bash
# 1. Connexion client
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.fr","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Parcourir le catalogue
curl "http://localhost:3000/api/v1/products?page=1&limit=10"

# 3. Voir détail d'un produit
curl http://localhost:3000/api/v1/products/1

# 4. Créer une commande
ORDER=$(curl -s -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 1}],
    "shippingAddress": "123 Rue Test, Paris",
    "billingAddress": "123 Rue Test, Paris"
  }' | jq -r '.data.id')

# 5. Payer la commande
curl -X POST http://localhost:3000/api/v1/orders/$ORDER/pay \
  -H "Authorization: Bearer $TOKEN"

# 6. Vérifier le statut
curl http://localhost:3000/api/v1/orders/$ORDER \
  -H "Authorization: Bearer $TOKEN"
```

### Scénario 2: Admin gère le catalogue

```bash
# 1. Connexion admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@petitemaison.fr","password":"password123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Vérifier produits en rupture
curl http://localhost:3000/api/v1/products/low-stock \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Ajouter du stock
curl -X PUT http://localhost:3000/api/v1/products/7 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'

# 4. Voir statistiques commandes
curl http://localhost:3000/api/v1/orders/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 5. Changer statut commande
curl -X PUT http://localhost:3000/api/v1/orders/1/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'
```

## 🆘 Dépannage

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### Base de données corrompue
```bash
npm run prisma:migrate reset
npm run prisma:seed
```

### Problème de permissions
```bash
chmod +x generate-files.sh
```

### Tests qui échouent
```bash
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
npm test
```

## 📚 Ressources

- [Documentation complète](./README.md)
- [Architecture](./ARCHITECTURE.md)
- [API Documentation](http://localhost:3000/api/v1/docs) (Swagger - à implémenter)

## 🎯 Checklist de Validation

- [ ] Le serveur démarre sans erreur
- [ ] Health check répond OK
- [ ] Login admin fonctionne
- [ ] Liste produits retourne des données
- [ ] Création commande fonctionne
- [ ] Tests passent avec > 70% coverage
- [ ] Logs sont générés dans `logs/`
- [ ] Métriques sont accessibles
- [ ] Tests de charge s'exécutent
