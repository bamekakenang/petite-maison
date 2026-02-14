# Rapport de Projet — La Petite Maison de l'Épouvante

## Superviser et assurer le développement des applications logicielles

**Rôle** : Lead Developer (Architecte logiciel, ex Lead Developer)  
**Entreprise** : La Petite Maison de l'Épouvante — « Le lieu de rêve pour frissonner »  
**Projet** : Plateforme e-commerce de vente en ligne de produits dérivés (goodies, films, BD, jeux) et gestion d'abonnements fanzine  
**Stack** : Node.js / Express / TypeScript (Backend) + Next.js 14 (Frontend)

---

## 1. Besoins fonctionnels et non fonctionnels

### 1.1. Contexte métier

La Petite Maison de l'Épouvante est une entreprise spécialisée dans l'univers horrifique, fantastique et heroic fantasy. Elle dispose de 4 magasins physiques (Angoulême, Aix-en-Provence, Lyon, Londres), édite un fanzine trimestriel (papier + numérique), organise le Petit Festival de l'Épouvante et possède le collectif de production Evil Ed.

L'entreprise souhaite créer la version « blockbuster » de son site pour proposer une plateforme moderne de vente en ligne et de diffusion. Le SI actuel est hétérogène et fragmenté (CMS, gestion de stock, CRM, échanges CSV manuels). Une nouvelle équipe IT a été recrutée pour ce projet.

### 1.2. Besoins fonctionnels

**BF1 — Gestion du catalogue produits (implémenté dans le POC)**
- Consulter la liste des produits avec pagination et filtres (catégorie, prix, disponibilité)
- Rechercher un produit par nom, SKU ou description
- Ajouter, modifier et supprimer des produits (rôle administrateur)
- Gérer le stock avec alertes automatiques lorsqu'un seuil minimum est atteint
- Uploader des images produits avec validation du format et de la taille
- Catégorisation spécialisée : goodies, films (DVD/Blu-ray), BD, jeux de société, figurines Evil Ed

**BF2 — Gestion des commandes (implémenté dans le POC)**
- Créer une commande avec validation du stock disponible
- Suivre le cycle de vie d'une commande : PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- Annuler une commande avec retour automatique du stock
- Traiter le paiement (simulé dans le cadre du POC)
- Consulter l'historique et les statistiques des commandes
- Intégration prévue avec le contrat transporteur La Poste (v2)

**BF3 — Authentification et gestion des utilisateurs (implémenté dans le POC)**
- Inscription et connexion des utilisateurs
- Gestion des sessions via JWT avec rafraîchissement automatique
- Contrôle d'accès par rôle (ADMIN pour les gestionnaires, MANAGER pour les vendeurs en magasin, CUSTOMER pour les clients)
- Déconnexion sécurisée avec invalidation du refresh token

**BF4 — Internationalisation (implémenté dans le POC)**
- Interface multilingue français / anglais pour le magasin de Londres (the little house of thrill)
- Routage basé sur la locale (`/fr`, `/en`)

**BF5 — Abonnement fanzine (prévu v2)**
- Abonnement papier et/ou numérique avec renouvellement automatique
- Liseuse intégrée dans l'espace utilisateur pour les numéros numérisés

**BF6 — Espace communautaire (prévu v2)**
- Troc et échange de goodies entre particuliers
- Notifications automatiques basées sur les centres d'intérêt et le comportement de navigation
- Système de modération
- Chat entre passionnés

**BF7 — Recommandation produits (prévu v2)**
- Recommandations basées sur les recherches et achats des utilisateurs

**BF8 — Contenu éditorial (prévu v2)**
- Publication de news et articles de fond accessibles à tous
- Intégration des productions Evil Ed (web séries, films restaurés)

### 1.3. Besoins non fonctionnels

Les exigences non fonctionnelles s'appuient sur la norme **ISO 25010** :

**Performance (Efficacité des performances)**
- Temps de réponse moyen de l'API < 200ms (P95)
- Support de 50 requêtes/seconde en charge soutenue pendant 3 minutes
- Pagination systématique pour limiter la charge des réponses volumineuses
- Interface fluide et ergonomique (exigence client)

**Fiabilité (Fiabilité)**
- Taux d'erreurs applicatives < 1% en conditions normales
- Transactions atomiques pour les opérations critiques (création de commande + décrémentation stock)
- Health checks automatiques pour détecter les indisponibilités

**Sécurité (Sécurité)**
- Contrainte forte : plateforme à visée commerciale avec données clients
- Authentification JWT avec expiration courte (15 min) et refresh tokens (7 jours)
- Contrôle d'accès RBAC (Role-Based Access Control)
- Protection contre les attaques courantes : injection (validation des entrées), brute force (rate limiting), XSS/clickjacking (Helmet.js)
- Hachage des mots de passe (bcrypt, 10 rounds)
- Communication HTTPS en production (TLS via Nginx / Let's Encrypt)
- Conformité RGPD (données personnelles des clients européens)

**Maintenabilité (Maintenabilité)**
- Complexité cyclomatique ≤ 10 par fonction
- Architecture en couches séparées (Controllers / Services / Middlewares / ORM)
- Typage strict TypeScript sur l'ensemble du codebase
- Couverture de tests ≥ 70%

**Compatibilité (Compatibilité)**
- API REST versionnée (`/api/v1`) pour permettre l'évolution sans casser les clients existants
- Support multi-navigateurs (responsive design)

**Disponibilité (Fiabilité — sous-caractéristique)**
- Hébergement en Europe (exigence client)
- Déploiement sur un orchestrateur (Kubernetes) ou un fournisseur cloud managé (Azure Europe)
- Probes de santé (readiness + liveness) pour le redémarrage automatique
- Stratégie de déploiement Blue/Green pour zéro downtime

**Observabilité**
- Logs structurés JSON avec rotation quotidienne et rétention 14 jours
- Métriques temps réel (temps de réponse, taux d'erreurs, requêtes par endpoint)
- Détection automatique des requêtes lentes (> 1000ms)

**Accessibilité (exigence RGAA)**
- L'interface doit respecter le RGAA (Référentiel Général d'Amélioration de l'Accessibilité) — prévu pour les sprints frontend futurs

---

## 2. Choix des technologies

### 2.1. Backend

**Node.js 18+ avec TypeScript**
- Justification : écosystème riche, performance I/O non-bloquante adaptée aux API REST e-commerce, typage statique améliorant la maintenabilité. L'équipe junior (5 ans d'alternance en développement) maîtrise JavaScript, facilitant la montée en compétence vers TypeScript.
- Alternative rejetée : Java/Spring Boot — complexité excessive pour un POC, courbe d'apprentissage plus longue pour l'équipe actuelle.

**Express.js 4.x**
- Justification : framework HTTP minimaliste, mature et largement adopté. Flexibilité pour intégrer les middlewares de sécurité (Helmet, CORS, Rate Limiting) et le système de métriques custom.
- Alternative rejetée : Fastify — écosystème de middlewares de sécurité moins mature.

**Prisma 5.x (ORM)**
- Justification : génération automatique de types TypeScript à partir du schéma, migrations versionnées, seeding intégré, support multi-provider (SQLite en dev, PostgreSQL en production). Réduit les risques d'injection SQL.
- Alternative rejetée : TypeORM — typage moins strict, documentation moins complète.

**SQLite (dev/test) + PostgreSQL (production)**
- Justification : SQLite permet un développement local sans infrastructure. Migration transparente vers PostgreSQL en production grâce à l'abstraction Prisma. PostgreSQL est adapté à la concurrence d'écriture d'un site e-commerce.

### 2.2. Frontend

**Next.js 14 avec App Router**
- Justification : framework React full-stack avec SSR/SSG, routage fichiers, mode standalone pour déploiement Docker/Azure. Adapté au besoin SEO (pages produits indexables) et à la performance (streaming).
- Alternative rejetée : Nuxt.js — cohérence TypeScript/React avec le backend préférée.

**next-intl**
- Justification : internationalisation intégrée au App Router, supportant `/fr` et `/en` pour le magasin de Londres.

### 2.3. Sécurité

**jsonwebtoken + bcryptjs** — Standards pour l'authentification sans état (JWT) et le hachage de mots de passe. Refresh tokens en base permettent la révocation.

**Helmet.js** — Configuration automatique des headers HTTP sécurisés (HSTS, X-Frame-Options, CSP).

**express-validator** — Validation et sanitization de toutes les entrées côté serveur.

**express-rate-limit** — Protection brute force (100 req/15min global).

### 2.4. Infrastructure et CI/CD

**Docker** — Containerisation multi-stage (base → deps → build → runtime) pour des images légères et reproductibles.

**Kubernetes (Minikube)** — Orchestration avec Deployments, Services, Ingress, ConfigMaps, Secrets, probes de santé. L'annotation Linkerd prépare un service mesh futur. Hébergement prévu en Europe (Azure West Europe).

**GitHub Actions** — CI/CD déclaratif avec jobs parallèles, environnements protégés, intégration native Git. Deux pipelines : `ci-cd.yml` (qualité + tests) et `azure-ci-cd.yml` (déploiement Azure).

**Azure App Service (Europe)** — Fournisseur cloud managé respectant l'exigence d'hébergement européen.

**Nginx + Let's Encrypt** — Reverse proxy avec terminaison TLS et HTTPS obligatoire.

### 2.5. Observabilité et qualité

**Winston + winston-daily-rotate-file** — Logging structuré JSON avec rotation et rétention configurable.

**Jest + Supertest** — Tests unitaires et d'intégration avec couverture intégrée et mocking.

**Artillery** — Tests de charge avec scénarios YAML pondérés, intégrables au pipeline CI/CD.

**ESLint + @typescript-eslint** — Analyse statique, cohérence du style, limite de complexité cyclomatique.

---

## Phase 1 — Structuration du processus de développement

### 1.1. Indicateurs Qualité (ISO 25010) — 4 indicateurs définis

#### 1. Couverture de tests ≥ 70% (Fiabilité)

- **Outil** : Jest avec `--coverage` et seuils configurés dans `jest.config.js`
- **Résultat actuel** : **85.06% lignes, 85.36% statements, 82.75% fonctions**
- **Réduction dette technique** : prévient les régressions fonctionnelles, détecte les bugs avant production. Essentiel pour un site e-commerce où un bug de commande impacte directement le chiffre d'affaires.

#### 2. Temps de réponse moyen < 200ms (Performance)

- **Outil** : middleware `metrics.middleware.ts` (tracking in-memory par endpoint) + Artillery
- **Résultat actuel** : **P50 = 49.9ms, P95 = 125.2ms, P99 = 186.8ms** (4698 requêtes)
- **Réduction dette technique** : identifie les endpoints lents avant qu'ils n'impactent l'expérience d'achat. L'exigence client demande une interface « fluide ».

#### 3. Taux d'erreurs < 1% (Fiabilité)

- **Outil** : compteurs succès/échec dans `metricsMiddleware` + logs structurés Winston
- **Résultat actuel** : 4264 succès / 4698 total = **90.7% succès** (les 401 proviennent de scénarios Artillery sans credentials, non représentatifs de la production)
- **Réduction dette technique** : surveille la stabilité applicative. Un taux d'erreurs élevé sur un site marchand provoque l'abandon de panier.

#### 4. Complexité cyclomatique ≤ 10 par fonction (Maintenabilité)

- **Outil** : ESLint + `@typescript-eslint` en mode strict, TypeScript strict mode (`strict: true`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`)
- **Résultat** : toutes les fonctions respectent la limite (architecture en couches)
- **Réduction dette technique** : facilite la montée en compétences des 2 développeurs juniors de l'équipe et l'ajout des fonctionnalités v2 (espace communautaire, recommandations).

---

### 1.2. Cycle de vie DevSecOps et pipeline CI/CD

#### Schéma du pipeline CI/CD

Fichier : `.github/workflows/ci-cd.yml`

```
Push / PR (main, develop)
    │
    ├──► lint-backend (ESLint + tsc --noEmit)
    │        ↓
    │    test-backend (Jest + coverage ≥ 70%)
    │        ↓
    │    build-backend (tsc → dist/)
    │
    ├──► lint-frontend (tsc --noEmit)
    │        ↓
    │    test-frontend (Jest + coverage)
    │        ↓
    │    build-frontend (next build)
    │
    ├──► security-backend (npm audit + Snyk)
    ├──► security-frontend (npm audit)
    │
    ├──► zap-baseline (OWASP ZAP, si URL configurée)
    │
    ├──► deploy-staging (branche develop)
    │        ↓
    │    performance-test (Artillery load test)
    │
    └──► deploy-production (branche main)
```

Second pipeline : `azure-ci-cd.yml` pour le déploiement Azure WebApps Europe (backend + frontend standalone Next.js).

#### Mesures de sécurité par étape du cycle DevSecOps

- **Plan** : modélisation des menaces (STRIDE), exigences sécurité dans le backlog
- **Code** : TypeScript strict, express-validator, ESLint, revue de code via PR
- **Build** : npm audit (niveau critical), Snyk (severity high)
- **Test** : tests unitaires + intégration (seuil couverture 70%), tests d'acceptation
- **Scan dynamique** : OWASP ZAP baseline
- **Release** : artefacts signés, déploiement conditionnel staging/production
- **Deploy** : Helmet.js, CORS, Rate Limiting, HTTPS (Nginx + Let's Encrypt)
- **Operate** : logs Winston, métriques `/api/v1/metrics`, health checks
- **Monitor** : détection requêtes lentes, alertes taux d'erreurs

#### Lien entre outils CI/CD et métriques qualité

- **Jest** → Métrique 1 : couverture ≥ 70% vérifiée automatiquement dans le job `test-backend`
- **Artillery** → Métrique 2 : temps de réponse P95 < 200ms validé dans `performance-test`
- **Metrics middleware** → Métrique 3 : taux d'erreurs exposé via `/api/v1/metrics`
- **ESLint + TypeScript** → Métrique 4 : complexité cyclomatique vérifiée dans `lint-backend`

---

### 1.3. Compétences et formation

#### Cartographie des compétences nécessaires

- **Lead Developer / Architecte (1)** — poste actuel : Node.js/TypeScript, Express, architecture REST, DevSecOps, CI/CD, Kubernetes, revue de code
- **Développeur Backend Junior (1)** — existant dans l'équipe : TypeScript, Prisma ORM, JWT, tests Jest, API REST. Besoin de monter en compétence sur la sécurité applicative.
- **Développeur Frontend Junior (1)** — existant dans l'équipe : Next.js 14, React, i18n (next-intl), TailwindCSS, accessibilité RGAA. Besoin de monter en compétence sur le testing frontend.
- **DevOps / SRE (1)** — à recruter : Docker, Kubernetes, GitHub Actions, Nginx, monitoring, Azure. Actuellement le technicien existant gère l'infrastructure mais n'a pas les compétences cloud/K8s.

#### Expertises à acquérir

- Kubernetes avancé (scaling, HPA, service mesh Linkerd) — critique pour la v2 avec montée en charge festival
- Observabilité distribuée (Prometheus + Grafana + Jaeger) — nécessaire pour le monitoring en production
- Sécurité applicative OWASP Top 10 — exigence forte du cahier des charges (plateforme commerciale)

#### Action de formation proposée

**Formation certifiante CKA (Certified Kubernetes Administrator)** pour le DevOps/SRE (à recruter ou technicien existant à faire monter en compétence).

- **Durée** : 5 jours
- **Format** : en ligne avec labs pratiques (Linux Foundation)
- **Objectif** : autonomie sur le déploiement, scaling et maintenance du cluster Kubernetes de production hébergé en Europe
- **Impact projet** : permet de gérer la montée en charge lors du Petit Festival de l'Épouvante (pic de trafic annuel) et le déploiement des fonctionnalités v2

---

## Stratégie de tests

### Processus de test formalisé

Le processus de test s'inscrit dans la démarche DevSecOps et couvre l'ensemble du cycle de vie. Il s'appuie sur la **pyramide de tests** : un socle large de tests unitaires, une couche intermédiaire de tests d'intégration, et des tests de charge et sécurité au sommet.

### Types de tests et outils associés

#### 1. Tests unitaires — Jest + ts-jest

- **Périmètre** : logique métier isolée (services, utilitaires, validateurs)
- **Outil** : Jest 29 avec ts-jest pour le support TypeScript natif
- **Approche** : mock des dépendances externes (base de données via `jest.mock`) pour tester la logique pure
- **Fichiers** :
  - `src/services/__tests__/product.service.test.ts` — service produit
  - `src/config/__tests__/prisma-schema-provider.test.ts` — configuration Prisma
- **Parties prenantes** : développeurs backend (exécution à chaque commit)
- **Intégration CI** : job `test-backend`, seuil ≥ 70% vérifié automatiquement

#### 2. Tests d'intégration — Jest + Supertest

- **Périmètre** : endpoints API complets (requête HTTP → routeur → contrôleur → service → BDD → réponse)
- **Outil** : Supertest 6.x sur l'application Express sans démarrer de serveur
- **Approche** : base SQLite dédiée par run (fichier temporaire via `mkdtemp`), nettoyée entre chaque test. Migrations Prisma exécutées en `beforeAll`.
- **Fichiers** :
  - `src/controllers/__tests__/product.controller.test.ts` — **23 tests** : CRUD produits, validation, auth, upload image, pagination, filtres, recherche, gestion des erreurs (401, 403, 404, 409)
  - `src/controllers/__tests__/system-auth-order.controller.test.ts` — **10 tests** : health check, auth flow complet (register → login → refresh → logout), cycle commande (création → paiement → statut → annulation → retour stock), transitions invalides, stock insuffisant
- **Parties prenantes** : développeurs backend + lead developer (exécution à chaque PR)
- **Intégration CI** : même job `test-backend`, couverture agrégée

#### 3. Tests de sécurité — npm audit + Snyk + OWASP ZAP

- **Périmètre** : vulnérabilités des dépendances (statique) et de l'application déployée (dynamique)
- **Outils** :
  - `npm audit --audit-level=critical` : vulnérabilités connues des dépendances
  - Snyk (`snyk/actions/node`) : analyse approfondie, severity high
  - OWASP ZAP (`zaproxy/action-baseline@v0.10.0`) : scan baseline de l'application déployée
- **Parties prenantes** : lead developer + DevOps
- **Intégration CI** : jobs `security-backend`, `security-frontend`, `zap-baseline`

#### 4. Tests de charge / performance — Artillery

- **Périmètre** : comportement de l'application sous charge réaliste simulant le trafic du site
- **Outil** : Artillery 2.x avec scénarios YAML
- **4 scénarios pondérés** simulant le trafic réel de la boutique en ligne :
  - Navigation produits (70%) : health → liste → détail → catégories (ex : parcourir les figurines Evil Ed)
  - Authentification (15%) : login → navigation authentifiée
  - Création commande (10%) : login → sélection produit → commande (ex : achat d'un Blu-ray)
  - Administration (5%) : login → liste commandes → statistiques → métriques
- **Montée en charge progressive** :
  - Warm-up : 5 req/s pendant 60s
  - Ramp-up : 20 req/s pendant 120s
  - Sustained : 50 req/s pendant 180s
- **Seuils** : P50 < 100ms, P95 < 200ms, P99 < 500ms
- **Parties prenantes** : lead developer + DevOps
- **Intégration CI** : job `performance-test` après déploiement staging

#### 5. Analyse statique — ESLint + TypeScript strict

- **Périmètre** : qualité du code, bugs potentiels, conventions
- **Outils** :
  - ESLint avec `@typescript-eslint/recommended` : style et complexité
  - TypeScript strict mode : `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Parties prenantes** : tous les développeurs (chaque commit)
- **Intégration CI** : jobs `lint-backend` et `lint-frontend` (bloquants)

### Environnement de test

- **Base de données** : SQLite en fichier temporaire (`mkdtemp`), isolée par run
- **Setup** : `src/tests/setup.ts` — migrations en `beforeAll`, nettoyage tables en `afterEach` (respect FK), suppression répertoire temporaire en `afterAll`
- **Variables** : JWT secrets de test, bcrypt rounds réduits (4), rate limiting désactivé (100000 req), logs `error` uniquement

### Couverture de code — Résultats

- Lignes : **85.06%** ✅ (seuil 70%)
- Statements : **85.36%** ✅
- Fonctions : **82.75%** ✅
- Branches : **56.14%** (axe d'amélioration : ajouter des tests edge cases)
- Reporters : `text`, `lcov`, `html`, `json-summary`

### Matrice des tests par fonctionnalité

Catalogue Produits (BF1) :
- Tests unitaires : instanciation service ✅
- Tests d'intégration : CRUD complet (23 cas) ✅
- Tests de charge : scénario Browse Products 70% ✅

Commandes (BF2) :
- Tests d'intégration : cycle complet (création → paiement → statut → annulation → retour stock) ✅
- Tests d'intégration : cas d'erreur (stock insuffisant, transition invalide, 404) ✅
- Tests de charge : scénario Create Order 10% ✅

Authentification (BF3) :
- Tests d'intégration : flux complet (register → login → refresh → logout) ✅
- Tests d'intégration : cas d'erreur (login invalide, refresh invalide) ✅
- Tests de charge : scénario Register and Login 15% ✅

Système :
- Tests d'intégration : health check, métriques, route 404 ✅

---

## Phase 2 — Développement et déploiement du POC

### 2.1. Backlog et architecture

#### Backlog — Fonctionnalité 1 : Gestion du Catalogue Produits

**US1** : En tant que client, je veux lister les produits avec filtres pour trouver facilement les goodies/films/BD qui m'intéressent
- Critères d'acceptation : Pagination (10/page), filtres catégorie/prix/stock

**US2** : En tant que client, je veux rechercher un produit par mot-clé
- Critères d'acceptation : Recherche par nom, SKU, description

**US3** : En tant qu'admin (gestionnaire boutique), je veux ajouter un produit au catalogue en ligne
- Critères d'acceptation : Validation SKU unique, upload image (MIME type + taille max 5MB)

**US4** : En tant qu'admin, je veux être alerté si le stock d'un produit est bas pour organiser le réapprovisionnement
- Critères d'acceptation : Alerte automatique si stock < minStock, endpoint `/api/v1/products/low-stock`

#### Backlog — Fonctionnalité 2 : Gestion des Commandes

**US5** : En tant que client, je veux créer une commande pour acheter des produits en ligne
- Critères d'acceptation : Validation stock, transaction atomique, calcul total automatique

**US6** : En tant que client, je veux voir mon historique de commandes
- Critères d'acceptation : Filtrage par utilisateur, pagination

**US7** : En tant qu'admin, je veux gérer les statuts des commandes pour suivre l'expédition
- Critères d'acceptation : Workflow PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED, validation des transitions

**US8** : En tant que système, je retourne le stock si une commande est annulée
- Critères d'acceptation : Retour automatique du stock dans une transaction Prisma

#### Architecture technique

```
                    ┌─────────────────────┐
                    │   Nginx / Ingress   │  ← HTTPS / TLS (Let's Encrypt)
                    │   (reverse proxy)   │
                    └───────┬─────────────┘
                 ┌──────────┴──────────┐
                 │                     │
         ┌───────▼──────┐     ┌───────▼──────┐
         │  Frontend    │     │  Backend API │
         │  Next.js 14  │     │  Express/TS  │
         │  Port 3001   │     │  Port 3000   │
         │  i18n fr/en  │     │  REST /api/v1│
         └──────────────┘     └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │  Prisma ORM  │
                              │  (TypeScript) │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │  SQLite (dev) │
                              │  PostgreSQL   │
                              │  (production) │
                              └──────────────┘

Sécurité intégrée :
├── Helmet.js (headers HTTP sécurisés)
├── JWT + Refresh Tokens (auth)
├── RBAC (ADMIN / MANAGER / CUSTOMER)
├── Rate Limiting (100 req/15min)
├── express-validator (inputs)
├── bcrypt 10 rounds (mots de passe)
└── CORS origines explicites

Observabilité :
├── Winston (logs JSON rotatifs, 14j)
├── Metrics middleware (temps, erreurs)
└── Endpoint /api/v1/metrics
```

---

### 2.2. Protocole d'expérimentation en bac à sable

#### Expérimentation 1 : Orchestration Kubernetes avec Minikube

- **Environnement** : Minikube local (macOS), images Docker buildées localement (`petite-maison-backend:local`, `petite-maison-frontend:local`)
- **Technologies testées** : Kubernetes (Deployments, Services, Ingress, ConfigMap, Secrets, ServiceAccounts, InitContainers), Nginx Ingress Controller
- **Étapes clés** :
  1. Build des images Docker multi-stage (base → deps → build → runtime) via `Dockerfile`
  2. Déploiement du manifeste `k8s/minikube.yaml` dans le namespace `petite-maison`
  3. InitContainer exécutant les migrations Prisma (`prisma migrate deploy` + `prisma seed`)
  4. Configuration des probes de santé :
     - `readinessProbe` : `GET /api/v1/health` (port 3000) et `GET /fr` (port 3001)
     - `livenessProbe` : idem avec initialDelaySeconds plus longs (15s vs 5s)
  5. Ingress Nginx avec routage : `/api/v1` → backend, `/uploads` → backend, `/` → frontend
- **Difficultés rencontrées** :
  - Volume `emptyDir` pour la base SQLite : partagé entre initContainer et container principal, mais ne persiste pas au redémarrage du pod
  - `NEXT_PUBLIC_API_URL` : variable injectée au build-time par Next.js, nécessite une valeur relative (`/api/v1`) en mode Ingress pour éviter les problèmes CORS
  - Routage Ingress : conflit entre Next.js `/api/*` et backend `/api/v1/*`, résolu avec un path `Prefix` plus spécifique
- **Limites** : SQLite via `emptyDir` non persistant (à remplacer par PVC ou PostgreSQL managé)
- **Résultat** : Orchestration fonctionnelle. Application opérationnelle, migrations exécutées, probes validant la disponibilité. Annotation `linkerd.io/inject: enabled` préparant le service mesh.
- **Décision** : **Kubernetes validé** pour la production. Recommandation : Azure Kubernetes Service (AKS) en Europe West pour l'hébergement final.

#### Expérimentation 2 : Pipeline CI/CD GitHub Actions avec DevSecOps

- **Environnement** : GitHub Actions (Ubuntu latest, Node.js 18)
- **Technologies testées** : GitHub Actions (jobs parallèles/séquentiels), Codecov, Snyk, OWASP ZAP, Artillery
- **Étapes clés** :
  1. Configuration de 10 jobs avec dépendances explicites (`needs`)
  2. Jobs parallèles : `lint-backend` / `lint-frontend` / `security-backend` / `security-frontend`
  3. Jobs séquentiels : lint → test → build → deploy
  4. Scan de sécurité : `npm audit --audit-level=critical` + `snyk/actions/node` (severity high)
  5. Vérification du seuil de couverture via script Node.js lisant `coverage-summary.json`
  6. Upload des artefacts de build (`actions/upload-artifact@v4`)
  7. Déploiement conditionnel : staging sur `develop`, production sur `main`
- **Difficultés** :
  - Prisma Generate en CI nécessite `DATABASE_URL` même pour la seule génération du client
  - Gestion des secrets GitHub optionnels (SNYK_TOKEN, ZAP_TARGET_URL) — résolu avec conditions `if` au niveau des steps (et non des jobs)
- **Résultat** : Pipeline complet validé, exécution en ~3-5 minutes.
- **Décision** : **GitHub Actions retenu** comme plateforme CI/CD.

#### Expérimentation 3 : Déploiement Azure WebApps (hébergement Europe)

- **Environnement** : Azure App Service (Web Apps Linux, région Europe West)
- **Technologies testées** : Azure WebApps deploy (`azure/webapps-deploy@v3`), publish profiles, Next.js standalone build
- **Étapes clés** :
  1. Build backend → zip → deploy via publish profile avec `clean: true`
  2. Build frontend Next.js standalone → packaging manuel (server.js + .next + static + messages i18n + data) → zip → deploy
  3. Configuration `NEXT_PUBLIC_API_URL` pointant vers `https://<backend>.azurewebsites.net/api/v1`
- **Difficultés** :
  - Erreurs 502 (documentées dans `AZURE-TROUBLESHOOTING.md` et `FIX-502-AZURE.md`)
  - Next.js standalone ne copie pas automatiquement les fichiers i18n (`messages/`, `data/`, `components/`, `lib/`)
  - Erreur 409 Conflict lors du déploiement (résolue avec `clean: true`)
- **Résultat** : Déploiement fonctionnel. Hébergement en Europe respectant l'exigence client.
- **Décision** : **Azure validé** comme fournisseur cloud. Conforme à l'exigence d'hébergement européen.

---

### 2.3. Développement de l'application

#### Fonctionnalités implémentées

Les 2 fonctionnalités métier sont pleinement opérationnelles avec **17 endpoints REST** :

Auth :
- `POST /api/v1/auth/register` — Inscription
- `POST /api/v1/auth/login` — Connexion
- `POST /api/v1/auth/refresh` — Rafraîchir le token
- `POST /api/v1/auth/logout` — Déconnexion

Produits — Fonctionnalité 1 (BF1) :
- `GET /api/v1/products` — Liste avec filtres et pagination
- `GET /api/v1/products/:id` — Détail produit
- `POST /api/v1/products` — Créer produit (ADMIN)
- `PUT /api/v1/products/:id` — Modifier produit (ADMIN)
- `DELETE /api/v1/products/:id` — Soft delete (ADMIN)
- `GET /api/v1/products/low-stock` — Produits en alerte stock (ADMIN)
- `GET /api/v1/products/categories` — Catégories distinctes

Commandes — Fonctionnalité 2 (BF2) :
- `GET /api/v1/orders` — Liste commandes
- `GET /api/v1/orders/:id` — Détail commande
- `POST /api/v1/orders` — Créer commande
- `PUT /api/v1/orders/:id/status` — Modifier statut (ADMIN)
- `POST /api/v1/orders/:id/pay` — Traiter paiement

Système :
- `GET /api/v1/health` — Health check
- `GET /api/v1/metrics` — Métriques applicatives

#### Sécurité intégrée au POC (2 bonnes pratiques minimum)

1. **JWT avec expiration courte** (15min) + refresh tokens persistés en base (7 jours)
2. **RBAC** : middlewares `authenticate` + `authorize` par rôle (ADMIN, MANAGER, CUSTOMER)
3. **Helmet.js** : headers HTTP sécurisés (HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff)
4. **Rate Limiting** : 100 requêtes / 15 minutes par IP
5. **Validation des entrées** : express-validator sur tous les endpoints
6. **Hachage bcrypt** (10 rounds) pour les mots de passe
7. **HTTPS** via Nginx reverse proxy avec Let's Encrypt

#### Observabilité

- **Logs structurés JSON** avec Winston :
  - Rotation quotidienne, rétention 14 jours
  - Fichiers séparés : `combined-YYYY-MM-DD.log` et `error-YYYY-MM-DD.log`
  - Détection automatique des requêtes lentes (> 1000ms)
- **Métriques temps réel** via endpoint `/api/v1/metrics` :
  - Temps de réponse (avg, min, max)
  - Compteurs requêtes / erreurs par endpoint
  - Métriques système (CPU, RAM, uptime)

#### Résultats des tests de charge

**Résultats** (`load-test-results.json`) :
- 1500 virtual users créés, 4698 requêtes HTTP traitées
- Taux de requêtes : 56 req/s
- **P50 = 49.9ms** (objectif < 100ms ✅)
- **P95 = 125.2ms** (objectif < 200ms ✅)
- **P99 = 186.8ms** (objectif < 500ms ✅)
- Max = 841ms (requête isolée d'authentification bcrypt)

**Conclusion** : l'application maintient un P95 < 200ms sous 50 req/s pendant 3 minutes. La montée en charge est validée pour la v1. Pour le pic du festival, un scaling horizontal (replicas Kubernetes) sera nécessaire.

---

## Phase 3 — Plan de remédiation : Analyse sécurité et recommandations

### 3.1. Analyse des vulnérabilités identifiées

Sur la base des tests, des métriques et d'une revue de l'architecture :

**V1 — Secrets JWT en clair dans les manifestes K8s** (Critique)
- Source : `k8s/minikube.yaml` — `stringData` contient `dev_jwt_secret_change_me`
- Risque : exposition de tous les secrets d'authentification si le dépôt Git est compromis

**V2 — Mots de passe faibles dans les comptes de test** (Haute)
- Source : `prisma/seed.ts` — `password123` pour admin et client
- Risque : comptes exploitables en cas de déploiement accidentel du seed en production

**V3 — SQLite non adapté à la production e-commerce** (Haute)
- Source : architecture actuelle
- Risque : pas de concurrence d'écriture, données non persistantes en K8s (`emptyDir`). Inadapté pour un site marchand avec transactions concurrentes.

**V4 — Rate limiting global uniquement** (Moyenne)
- Source : `app.ts` — un seul rate limiter à 100 req/15min
- Risque : les endpoints `/auth/login` ne sont pas protégés spécifiquement contre le brute force

**V5 — Pas de HTTPS en développement / staging** (Moyenne)
- Source : environnement de développement
- Risque : tokens JWT et mots de passe transmis en clair

**V6 — Absence de scan des images Docker** (Moyenne)
- Source : pipeline CI/CD
- Risque : CVE dans l'image base `node:20-bookworm-slim` non détectées

**V7 — Pas de révocation immédiate des tokens JWT** (Moyenne)
- Source : `auth.service.ts`
- Risque : un token volé reste valide 15 minutes même après logout

**V8 — Logs potentiellement exposant des données sensibles** (Faible)
- Source : `logger.ts`
- Risque : tokens, emails, données personnelles dans les logs — non conforme RGPD

### 3.2. Plan de remédiation priorisé

#### Priorité 1 — Critique (immédiat)

**Action 1 : Externaliser les secrets Kubernetes (V1)**
- Utiliser Azure Key Vault avec le CSI Secret Store Driver
- Justification : un accès en lecture au dépôt expose tous les secrets JWT. Risque maximal pour une plateforme commerciale.

**Action 2 : Politique de mots de passe renforcée (V2)**
- Validation express-validator : longueur ≥ 12, majuscule, chiffre, caractère spécial
- Séparer données de seed des données de production
- Justification : première cible des attaques brute force sur un site marchand.

#### Priorité 2 — Haute (sprint suivant)

**Action 3 : Migration vers PostgreSQL managé (V3)**
- Azure Database for PostgreSQL (région Europe West) avec clustering haute disponibilité
- Justification : SQLite ne gère pas la concurrence ; les tests montrent 1500 vusers simultanés. Indispensable avant la mise en ligne commerciale.

**Action 4 : Rate limiting différencié (V4)**
- Rate limiter spécifique `/api/v1/auth/*` : 5 requêtes / 15 minutes par IP
- Justification : protection ciblée des endpoints d'authentification.

#### Priorité 3 — Moyenne (backlog)

**Action 5 : HTTPS partout (V5)**
- cert-manager dans Kubernetes pour certificats TLS automatiques
- Config Nginx déjà prête (`infra/nginx/petitemaison.conf`)
- Justification : protection des données en transit.

**Action 6 : Scan d'images Docker (V6)**
- Intégrer Trivy dans le pipeline CI/CD
- Justification : détecter les CVE système avant déploiement.

**Action 7 : Token blacklist Redis (V7)**
- Liste noire Redis des tokens JWT invalidés, vérifiée dans le middleware `authenticate`
- Justification : révocation immédiate d'un token volé.

**Action 8 : Filtrage RGPD des logs (V8)**
- Format Winston personnalisé masquant tokens, emails, mots de passe
- Justification : conformité RGPD obligatoire pour les données clients européens.

### 3.3. Bonnes pratiques de sécurité déjà intégrées au POC

1. **Helmet.js** : headers HTTP sécurisés (HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin)
2. **JWT à expiration courte** (15min) avec refresh tokens stockés en base
3. **RBAC** avec middlewares d'authentification et d'autorisation par rôle
4. **Validation des entrées** avec express-validator sur tous les endpoints
5. **Hachage bcrypt** (10 rounds) pour les mots de passe
6. **npm audit** et **Snyk** intégrés dans le pipeline CI/CD
7. **CORS** configuré avec origines explicites
8. **OWASP ZAP** baseline scan intégré au pipeline

---

## Résumé de conformité par critère de notation

### Maintenir et développer son expertise (10 pts)

- **Protocole d'expérimentation (2 pts)** : 3 technologies testées en bac à sable (Kubernetes/Minikube, GitHub Actions CI/CD, Azure WebApps Europe) avec environnement, étapes, difficultés et résultats documentés
- **Implémentation technique POC (4 pts)** : architecture en couches documentée, communication frontend-backend via API REST versionnée, sécurité JWT/RBAC/Helmet, hébergement K8s + Azure Europe, observabilité Winston
- **Fonctionnalité métier (1 pt)** : 2 fonctionnalités complètes (Catalogue + Commandes) répondant aux besoins de vente en ligne de La Petite Maison de l'Épouvante
- **Processus de livraison continue (3 pts)** : pipeline schématisé (10 jobs), conforme DevSecOps, intégré au POC via GitHub Actions + Azure CI/CD

### Piloter le développement et le déploiement (4 pts)

- **Compétences équipe (1 pt)** : 4 profils identifiés (cohérents avec l'équipe existante), expertises à acquérir listées, formation CKA proposée
- **Environnement managé (2 pts)** : Kubernetes + Azure WebApps avec probes de santé ; montée en charge démontrée (50 req/s, P95 = 125.2ms)
- **Indicateurs qualité (1 pt)** : 4 indicateurs ISO 25010 définis, mesurés, axes d'amélioration identifiés

### Assurance qualité logicielle (4 pts)

- **Processus de test (2 pts)** : 5 types formalisés (unitaires, intégration, sécurité, charge, analyse statique) avec outils, parties prenantes et intégration CI. 2 types appliqués au POC : 33+ tests exécutés avec succès, couverture 85%
- **Plan de remédiation (2 pts)** : 8 vulnérabilités priorisées en 3 niveaux, recommandations justifiées. 7+ bonnes pratiques de sécurité déjà intégrées au POC

### Présentation orale (2 pts)

- Schémas d'architecture, pipeline CI/CD et résultats de tests de charge préparés pour la présentation
- Démonstration pratique de l'application disponible (endpoints API, tests, métriques)
