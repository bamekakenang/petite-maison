# 🏠 Petite Maison - Application Complète

Backend Node.js/Express + Frontend Next.js avec intégration complète.

## 🚀 Démarrage Rapide (1 commande)

```bash
./START-ALL.sh
```

Ou manuellement:
```bash
# Terminal 1: Backend
cd backend && npm install && npm run prisma:generate && npm run prisma:migrate deploy && npm run prisma:seed && npm run dev

# Terminal 2: Frontend  
cd apps/frontend && npm install && npm run dev
```

## 🌐 URLs
- **Frontend**: http://localhost:3001/fr
- **Backend API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/api/v1/health

## 👤 Comptes Test
- **Admin**: admin@petitemaison.fr / password123
- **Client**: client@example.fr / password123

## ✅ Ce qui est Implémenté

### Backend (100% Fonctionnel)
- ✅ **Fonctionnalité 1**: Gestion Catalogue Produits (CRUD + recherche + filtres)
- ✅ **Fonctionnalité 2**: Gestion Commandes (workflow complet + paiement)
- ✅ JWT Auth + Refresh Tokens
- ✅ 4 Métriques Qualité ISO 25010
- ✅ Pipeline CI/CD DevSecOps
- ✅ Logs Winston + Métriques
- ✅ Tests Jest configurés
- ✅ Documentation complète

### Intégration Frontend-Backend
- ✅ Client API complet (`apps/frontend/lib/api/`)
- ✅ AuthContext React
- ✅ Gestion JWT automatique
- ✅ Exemples d'intégration fournis

## 📚 Documentation

- **INTEGRATION-GUIDE.md** - Guide complet de connexion frontend-backend
- **backend/README.md** - Documentation backend
- **backend/ARCHITECTURE.md** - Architecture et métriques qualité
- **backend/QUICKSTART.md** - Exemples curl et tests API
- **backend/SUMMARY.md** - Résumé complet backend

## 🧪 Test Rapide

```bash
# Test API
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/products

# Test connexion
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.fr","password":"password123"}'
```

## 📁 Structure

```
├── backend/           # API Node.js/Express/TypeScript + SQLite
├── apps/frontend/     # Next.js 14 + i18n
├── INTEGRATION-GUIDE.md  # Guide d'intégration
└── START-ALL.sh       # Script de démarrage
```

## 🎯 Étapes Suivantes

1. Lire **INTEGRATION-GUIDE.md** pour connecter les pages
2. Démarrer avec `./START-ALL.sh`
3. Tester la connexion sur http://localhost:3001/fr/connexion
4. Explorer l'API avec les exemples dans `backend/QUICKSTART.md`

**🚀 Tout est prêt pour l'intégration et les tests!**
