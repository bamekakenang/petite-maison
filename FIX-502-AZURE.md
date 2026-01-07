# 🔧 FIX: Erreur 502 Bad Gateway sur Azure

## 🎯 Le Problème

```
Error: /api/cart/save responded with 502
Status: Bad Gateway
```

**Signification** : L'API backend Azure n'est pas accessible depuis le frontend.

---

## 🔍 Diagnostic Rapide

### Étape 1: Tester la connexion

Visitez : `https://petitemaison-web.azurewebsites.net/[locale]/diagnostics`

Exemple: `https://petitemaison-web.azurewebsites.net/fr/diagnostics`

Cette page teste :
- ✅ Configuration NEXT_PUBLIC_API_URL
- ✅ Backend Health (/api/v1/health)
- ✅ Backend Products (/api/v1/products)
- ✅ Frontend Cart endpoints (/api/cart/save, /api/cart/load)

---

## ❌ Solutions Selon le Diagnostic

### Cas 1: Backend Health échoue (502 ou timeout)

**Problèmes possibles** :
1. Backend Azure n'est pas déployé
2. Backend n'est pas lancé après déploiement
3. NEXT_PUBLIC_API_URL incorrect

**Fix** :

#### A. Vérifier que le backend est déployé
```bash
# Azure Portal → petitemaison-api → Deployment Center
# Vérifier que le dernier déploiement est "Success"
```

#### B. Redémarrer le backend
```bash
# Azure Portal → petitemaison-api → Restart (en haut)
# Attendre 2-3 minutes que le backend redémarre
```

#### C. Vérifier la startup command
```bash
# Azure Portal → petitemaison-api → Configuration → General settings
# Vérifier "Startup Command" = "node dist/server.js"
```

#### D. Vérifier NEXT_PUBLIC_API_URL
```bash
# Azure Portal → petitemaison-web → Configuration → Application settings
# Chercher NEXT_PUBLIC_API_URL

# Doit être exactement:
# https://petitemaison-api.azurewebsites.net/api/v1
```

**Si NEXT_PUBLIC_API_URL est incorrect** :
1. Modifier la valeur
2. Sauvegarder
3. Redémarrer le frontend (Restart button en haut)
4. Attendre 2-3 minutes

---

### Cas 2: Backend Health OK mais /products échoue

**Problème** : CORS bloqué ou route non existante

**Fix** :

#### Vérifier CORS_ORIGIN
```bash
# Azure Portal → petitemaison-api → Configuration → Application settings
# Chercher CORS_ORIGIN

# Doit contenir:
# https://petitemaison-web.azurewebsites.net
```

**Si incorrect ou manquant** :
1. Ajouter/modifier CORS_ORIGIN
2. Valeur : `https://petitemaison-web.azurewebsites.net`
3. Sauvegarder
4. Redémarrer backend

#### Vérifier que l'endpoint /api/v1/products existe
```bash
# Tester dans un terminal:
curl https://petitemaison-api.azurewebsites.net/api/v1/health

# Doit retourner quelque chose comme:
# {"ok":true}
```

---

### Cas 3: /api/cart/save/load échouent

**Problème** : Problème dans les endpoint Next.js

**Fix** :

1. **Vérifier le build local** :
```bash
cd apps/frontend
npm run build
# Doit compiler sans erreurs
```

2. **Vérifier les logs Azure Frontend** :
```bash
# Azure Portal → petitemaison-web → Logs
# Chercher les erreurs dans "Log stream"
```

3. **Redémarrer le frontend** :
```bash
# Azure Portal → petitemaison-web → Restart (en haut)
# Attendre 2-3 minutes
```

---

## 🎯 Checklist Complète

### Backend (petitemaison-api)

- [ ] **Déployé** : Deployment Center → dernier job = Success
- [ ] **En cours d'exécution** : Overview → Status = Running
- [ ] **Startup command** : `node dist/server.js`
- [ ] **DATABASE_URL** : PostgreSQL connection string (valide)
- [ ] **NODE_ENV** : `production`
- [ ] **JWT_SECRET** : Défini (valeur aléatoire longue)
- [ ] **CORS_ORIGIN** : `https://petitemaison-web.azurewebsites.net`
- [ ] **Health check OK** : `curl https://.../api/v1/health` → 200

### Frontend (petitemaison-web)

- [ ] **Déployé** : Deployment Center → dernier job = Success
- [ ] **En cours d'exécution** : Overview → Status = Running
- [ ] **NEXT_PUBLIC_API_URL** : `https://petitemaison-api.azurewebsites.net/api/v1`
- [ ] **NODE_ENV** : `production`
- [ ] **Accès OK** : `https://petitemaison-web.azurewebsites.net/fr` → page charge

---

## 🔗 Vérifications Manuelles

### Test 1: Backend santé
```bash
curl -i https://petitemaison-api.azurewebsites.net/api/v1/health
# Résultat attendu: HTTP 200
```

### Test 2: Backend produits
```bash
curl -i https://petitemaison-api.azurewebsites.net/api/v1/products
# Résultat attendu: HTTP 200 + JSON avec produits
```

### Test 3: Frontend accessible
```bash
curl -i https://petitemaison-web.azurewebsites.net/fr
# Résultat attendu: HTTP 200 + contenu HTML
```

### Test 4: Panier endpoint
```bash
curl -i -X POST https://petitemaison-web.azurewebsites.net/api/cart/save \
  -H "Content-Type: application/json" \
  -d '{"items":[]}'
# Résultat attendu: HTTP 200 + JSON
```

---

## 📊 Configuration Azure Correcte

### Backend WebApp (petitemaison-api)

```
General Settings:
  Runtime stack: Node 20 LTS
  Startup command: node dist/server.js

Application Settings:
  DATABASE_URL=postgresql://...
  NODE_ENV=production
  JWT_SECRET=very-long-random-secret-key-here
  CORS_ORIGIN=https://petitemaison-web.azurewebsites.net
  API_VERSION=v1
```

### Frontend WebApp (petitemaison-web)

```
General Settings:
  Runtime stack: Node 20 LTS
  Startup command: (laisser vide - Next.js gère)

Application Settings:
  NEXT_PUBLIC_API_URL=https://petitemaison-api.azurewebsites.net/api/v1
  NODE_ENV=production
```

---

## 🆘 Si Ça Ne Marche Toujours Pas

### 1. Vérifier les logs Azure en temps réel

```bash
# Logs Frontend
az webapp log tail -n petitemaison-web -g [resource-group-name]

# Logs Backend
az webapp log tail -n petitemaison-api -g [resource-group-name]
```

### 2. Redémarrer les deux WebApps

```bash
# Redémarrer backend
az webapp restart -g [resource-group] -n petitemaison-api

# Redémarrer frontend
az webapp restart -g [resource-group] -n petitemaison-web
```

### 3. Videz le cache browser

- Appuyez sur `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
- Vider cache et cookies
- Visiter à nouveau le site

### 4. Rédeployez

Si les logs montrent des erreurs :
```bash
git add -A
git commit -m "Redeploy"
git push origin main
# GitHub Actions refait le déploiement automatiquement
```

---

## 📞 Points de Contact Azure

| Ressource | URL |
|-----------|-----|
| petitemaison-api | https://portal.azure.com → petitemaison-api |
| petitemaison-web | https://portal.azure.com → petitemaison-web |
| Logs | [Resource] → Logs / Log Stream |
| Config | [Resource] → Configuration → App Settings |
| Restart | [Resource] → Restart (button en haut) |

---

## ✅ Résumé du Fix

```mermaid
Error 502 Bad Gateway
        ↓
Tester: /diagnostics
        ↓
    ┌───┴───┐
    ↓       ↓
Backend  Frontend
échoue   échoue
    ↓       ↓
Redémarrer  Vérifier
+ Config    NODE_ENV
```
