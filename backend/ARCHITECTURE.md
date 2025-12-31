# Architecture & Qualité Logicielle

## 📐 Architecture Technique

### Stack Technologique
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js 4.x
- **ORM**: Prisma 5.x
- **Base de données**: SQLite (dev) / PostgreSQL (production)
- **Authentification**: JWT avec Refresh Tokens
- **Tests**: Jest + Supertest
- **Documentation**: OpenAPI 3.0 (Swagger)
- **Logs**: Winston avec rotation quotidienne
- **Métriques**: Custom middleware in-memory

### Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Logger)
│   ├── controllers/     # Contrôleurs HTTP
│   ├── services/        # Logique métier
│   ├── middlewares/     # Middlewares (Auth, Validation, Metrics)
│   ├── routes/          # Définition des routes
│   ├── utils/           # Utilitaires (JWT, Errors)
│   ├── types/           # Types TypeScript
│   ├── tests/           # Configuration tests
│   ├── app.ts           # Configuration Express
│   └── server.ts        # Point d'entrée
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Données de test
├── .github/
│   └── workflows/       # CI/CD GitHub Actions
├── logs/                # Logs rotatifs
└── coverage/            # Rapports de couverture

```

## 📊 Métriques Qualité (ISO 25010)

### 1. Fiabilité - Couverture de Tests ≥ 70%

**Objectif**: Garantir que le code est testé de manière exhaustive

**Mesure**:
- Tests unitaires sur les services
- Tests d'intégration sur les API
- Coverage automatique avec Jest

**Suivi**:
```bash
npm test -- --coverage
```

**Seuil**: 70% minimum (branches, fonctions, lignes, statements)

**Dette technique évitée**:
- Régression des fonctionnalités
- Bugs non détectés en production
- Coûts de maintenance élevés

### 2. Performance - Temps de Réponse Moyen < 200ms

**Objectif**: Assurer une expérience utilisateur fluide

**Mesure**:
- Middleware de métriques custom
- Logs des requêtes lentes (> 1000ms)
- Tests de charge Artillery

**Suivi**:
```bash
curl http://localhost:3000/api/v1/metrics
npm run load-test
```

**Seuils**:
- P50: < 100ms
- P95: < 200ms
- P99: < 500ms

**Dette technique évitée**:
- Mauvaise expérience utilisateur
- Surcharge serveur
- Perte de clients

### 3. Fiabilité - Taux d'Erreurs < 1%

**Objectif**: Minimiser les échecs en production

**Mesure**:
- Ratio (requêtes échouées / requêtes totales)
- Logs structurés avec Winston
- Monitoring des erreurs par type

**Suivi**:
```bash
# Via l'API metrics
curl http://localhost:3000/api/v1/metrics

# Dans les logs
tail -f logs/error-*.log
```

**Seuil**: < 1% d'erreurs (< 10 erreurs sur 1000 requêtes)

**Dette technique évitée**:
- Perte de confiance utilisateurs
- Dégradation de service
- Incidents en production

### 4. Maintenabilité - Complexité Cyclomatique ≤ 10

**Objectif**: Code lisible et facile à maintenir

**Mesure**:
- Analyse statique avec ESLint
- TypeScript strict mode
- Revue de code automatisée

**Suivi**:
```bash
npm run lint
npx tsc --noEmit
```

**Seuil**: Complexité cyclomatique ≤ 10 par fonction

**Dette technique évitée**:
- Code spaghetti
- Difficulté à ajouter features
- Bugs difficiles à identifier

## 🔒 Sécurité (DevSecOps)

### Mesures Implémentées

1. **Authentification & Autorisation**
   - JWT avec expiration courte (15min)
   - Refresh tokens stockés en base
   - RBAC (Role-Based Access Control)

2. **Validation des Données**
   - express-validator sur toutes les entrées
   - Sanitization automatique
   - Types stricts TypeScript

3. **Protection Infrastructure**
   - Helmet.js (headers sécurisés)
   - CORS configuré
   - Rate Limiting (100 req/15min)

4. **Cryptographie**
   - bcrypt (10 rounds) pour les mots de passe
   - JWT signés avec secrets forts

5. **Audit Continu**
   - npm audit dans CI/CD
   - Snyk pour vulnérabilités
   - Dépendances à jour

### Pipeline CI/CD

```
Push Code
    ↓
┌───────────┐
│  Linting  │  ← ESLint + TypeScript
└─────┬─────┘
      ↓
┌───────────┐
│   Tests   │  ← Jest (unit + integration)
└─────┬─────┘
      ↓
┌───────────┐
│ Security  │  ← npm audit + Snyk
└─────┬─────┘
      ↓
┌───────────┐
│   Build   │  ← TypeScript compilation
└─────┬─────┘
      ↓
┌────────────────┐
│ Deploy Staging │
└────────┬───────┘
         ↓
┌────────────────┐
│  Load Testing  │  ← Artillery
└────────┬───────┘
         ↓
┌─────────────────┐
│ Deploy Production│
└─────────────────┘
```

## 🎯 Fonctionnalités Métier

### Fonctionnalité 1: Gestion Catalogue Produits

**User Stories**:
- US1: En tant qu'utilisateur, je veux lister tous les produits avec filtres
- US2: En tant qu'utilisateur, je veux rechercher un produit
- US3: En tant qu'admin, je veux ajouter un nouveau produit
- US4: En tant qu'admin, je veux être alerté si le stock est bas

**Critères d'Acceptation**:
- ✅ Pagination fonctionnelle (10 items par page)
- ✅ Filtres par catégorie, prix, disponibilité
- ✅ Recherche par nom, SKU, description
- ✅ Alerte automatique si stock < minStock
- ✅ Soft delete (produits désactivés, non supprimés)

**Tests**:
```bash
# Tests unitaires
npm test -- product.service.test

# Tests API
curl http://localhost:3000/api/v1/products?category=Mobilier&minPrice=100
```

### Fonctionnalité 2: Gestion Commandes

**User Stories**:
- US5: En tant que client, je veux créer une commande
- US6: En tant que client, je veux voir l'historique de mes commandes
- US7: En tant qu'admin, je veux changer le statut d'une commande
- US8: En tant que système, je veux retourner le stock si commande annulée

**Critères d'Acceptation**:
- ✅ Validation du stock avant création commande
- ✅ Workflow complet: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- ✅ Retour automatique du stock en cas d'annulation
- ✅ Calcul automatique du montant total
- ✅ Transaction atomique (commande + items + décrément stock)

**Tests**:
```bash
# Tests services
npm test -- order.service.test

# Tests API
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"productId":1,"quantity":2}],...}'
```

## 🚀 Déploiement

### Environnements

- **Development**: Local (SQLite)
- **Staging**: Docker + PostgreSQL
- **Production**: Kubernetes + PostgreSQL (cluster)

### Stratégie de Déploiement

- **Blue/Green Deployment** pour zéro downtime
- **Health Checks** obligatoires avant switch
- **Rollback automatique** si erreurs > 5%

## 📈 Monitoring & Observabilité

### Logs
- **Format**: JSON structuré
- **Niveaux**: error, warn, info, debug
- **Rotation**: Quotidienne, rétention 14 jours
- **Centralisation**: ELK Stack (production)

### Métriques
- Temps de réponse (min, max, avg, p95, p99)
- Taux d'erreurs par endpoint
- Nombre de requêtes par minute
- Utilisation ressources (CPU, RAM)

### Traces
- Correlation ID sur chaque requête
- Traces distribuées (Jaeger en production)

## 🧪 Tests de Charge

Objectifs:
- 50 requêtes/seconde soutenus pendant 3 minutes
- Temps de réponse < 200ms à 95% de charge
- 0 erreur 5xx sous charge normale

Scénarios:
1. Consultation produits (70%)
2. Authentification (15%)
3. Création commandes (10%)
4. Opérations admin (5%)
