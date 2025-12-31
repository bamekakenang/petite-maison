# Petite Maison Backend API

Backend API REST pour l'application Petite Maison - Proof of Concept (POC) avec DevSecOps

## 🎯 Fonctionnalités Métier Implémentées

### Fonctionnalité 1: Gestion du Catalogue Produits
- ✅ CRUD complet des produits
- ✅ Recherche et filtres (catégorie, prix, stock)
- ✅ Pagination
- ✅ Gestion du stock avec alertes de seuil minimum
- ✅ Soft delete (désactivation)

### Fonctionnalité 2: Gestion des Commandes
- ✅ Création de commande avec validation du stock
- ✅ Workflow complet (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED)
- ✅ Gestion des annulations avec retour de stock
- ✅ Traitement des paiements (simulé)
- ✅ Historique et statistiques

## 🏗️ Architecture Technique

- **Backend**: Node.js + Express + TypeScript
- **Base de données**: SQLite (Prisma ORM)
- **Authentification**: JWT avec Refresh Tokens
- **Sécurité**: Helmet, CORS, Rate Limiting, express-validator
- **Observabilité**: Winston (logs structurés), métriques custom
- **Tests**: Jest (unitaires + intégration)
- **Documentation**: Swagger/OpenAPI
- **CI/CD**: GitHub Actions

## 📊 Métriques Qualité (ISO 25010)

### 1. **Couverture de tests** (≥ 70%)
Mesure la fiabilité et la maintenabilité du code

### 2. **Temps de réponse moyen** (< 200ms)
Garantit la performance de l'application

### 3. **Taux d'erreurs** (< 1%)
Indicateur de fiabilité et robustesse

### 4. **Complexité cyclomatique** (≤ 10 par fonction)
Assure la maintenabilité et la lisibilité du code

## 🚀 Installation

```bash
cd backend
npm install

# Configuration
cp .env.example .env

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Development
npm run dev

# Production
npm run build
npm start
```

## 📝 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Déconnexion

### Products (Fonctionnalité 1)
- `GET /api/v1/products` - Liste produits (avec filtres & pagination)
- `GET /api/v1/products/:id` - Détail produit
- `POST /api/v1/products` - Créer produit [ADMIN]
- `PUT /api/v1/products/:id` - Modifier produit [ADMIN]
- `DELETE /api/v1/products/:id` - Supprimer produit [ADMIN]
- `GET /api/v1/products/low-stock` - Produits en rupture [ADMIN]
- `GET /api/v1/products/categories` - Liste catégories

### Orders (Fonctionnalité 2)
- `GET /api/v1/orders` - Liste commandes
- `GET /api/v1/orders/:id` - Détail commande
- `POST /api/v1/orders` - Créer commande
- `PUT /api/v1/orders/:id/status` - Modifier statut [ADMIN]
- `POST /api/v1/orders/:id/pay` - Payer commande
- `GET /api/v1/orders/stats` - Statistiques

### System
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métriques applicatives

## 🧪 Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Integration tests
npm run test:integration

# Coverage
npm test -- --coverage
```

## 🔒 Sécurité

- JWT avec expiration courte (15min)
- Refresh tokens stockés en base
- Hachage bcrypt (10 rounds)
- Rate limiting (100 req/15min)
- Helmet (headers sécurisés)
- Validation des inputs (express-validator)
- CORS configuré

## 📈 Tests de Charge

```bash
npm run load-test
```

## 👥 Comptes de test

- **Admin**: admin@petitemaison.fr / password123
- **Client**: client@example.fr / password123

