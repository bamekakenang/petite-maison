# 🚀 Test Rapide - Petite Maison

## URLs de Test

### En Développement (Local)
```bash
# Frontend
http://localhost:3001/fr

# Diagnostics simples
http://localhost:3001/fr/diagnostics-simple

# Backend API
http://localhost:3000/api/v1/health
http://localhost:3000/api/v1/products
```

### En Production (Azure)
```bash
# Frontend
https://petitemaison-web.azurewebsites.net/fr

# Diagnostics simples
https://petitemaison-web.azurewebsites.net/fr/diagnostics-simple

# Backend API
https://petitemaison-api.azurewebsites.net/api/v1/health
https://petitemaison-api.azurewebsites.net/api/v1/products
```

---

## ✅ Checklist de Vérification

### 1. Page d'Accueil Charge ✓
Visitez : `https://petitemaison-web.azurewebsites.net/fr`

**Attendus** :
- ✅ Page charge sans erreurs
- ✅ Voir le titre "La Petite Maison"
- ✅ Voir les boutons de navigation

### 2. Boutique Affiche les Produits ✓
Visitez : `https://petitemaison-web.azurewebsites.net/fr/produits`

**Attendus** :
- ✅ Produits s'affichent (figurines, jeux, etc.)
- ✅ Aucune erreur Server Component
- ✅ Même si c'est du fallback local (OK!)

### 3. Panier Fonctionne ✓
- ✅ Cliquer "Ajouter au panier" sur un produit
- ✅ Le panier affiche 1 item
- ✅ Ouvrir F12 → Console : pas d'erreur 500

### 4. Vérifier Configuration ✓
Visitez : `https://petitemaison-web.azurewebsites.net/fr/diagnostics-simple`

**Vérifie** :
- ✅ NEXT_PUBLIC_API_URL affichée correctement
- ✅ Doit être: `https://petitemaison-api.azurewebsites.net/api/v1`

### 5. Tester Backend Directement ✓
```bash
# Terminal: Tester la santé du backend
curl https://petitemaison-api.azurewebsites.net/api/v1/health

# Résultat attendu:
# {"ok":true} ou {"status":"ok"}

# Tester les produits
curl https://petitemaison-api.azurewebsites.net/api/v1/products

# Résultat attendu: Liste JSON des produits
```

---

## ❌ Troubleshooting

### Erreur: "Server Components render error"
**Cause** : Problème lors du chargement d'une page  
**Fix** :
1. Attendre 2-3 minutes après déploiement
2. Vider le cache (Ctrl+Shift+Delete)
3. Rafraîchir (F5)

### Erreur: 502 Bad Gateway
**Cause** : Backend Azure pas accessible  
**Fix** :
1. Lire `FIX-502-AZURE.md`
2. Vérifier que backend est en cours d'exécution
3. Vérifier CORS_ORIGIN en Configuration Backend

### Produits vides
**Cause** : Produits du fallback local pas chargés  
**Fix** :
1. Attendre le déploiement complet
2. Vérifier onglet Network (F12) : s'il y a erreurs API
3. C'est normal si c'est du fallback!

### Panier ne persiste pas
**Cause** : localStorage pas accessible ou cookies bloqués  
**Fix** :
1. Vérifier que localStorage n'est pas désactivé
2. Accepter les cookies si demandé
3. Console devrait pas afficher d'erreurs cookies

---

## 📊 État Attendu

### ✅ Cas Optimal (Tout Fonctionne)
- Frontend charge ✓
- Boutique affiche produits (API) ✓
- Panier sauvegarde (cookies serveur) ✓
- Pas d'erreurs console ✓

### ⚠️ Cas Dégradé (Acceptable)
- Frontend charge ✓
- Boutique affiche produits (fallback local) ✓
- Panier sauvegarde (localStorage) ✓
- Logs debug: "Using fallback" ✓

### ❌ Cas Critique
- Frontend ne charge pas
- Erreur 500 Server Component
- Erreur 502 de manière persistante

---

## 📞 Debug Avancé

### Voir les Logs Azure en temps réel
```bash
# Backend logs
az webapp log tail -n petitemaison-api

# Frontend logs
az webapp log tail -n petitemaison-web
```

### Redémarrer les WebApps
```bash
# Redémarrer backend
az webapp restart -n petitemaison-api

# Redémarrer frontend
az webapp restart -n petitemaison-web
```

### Vérifier les Variables d'Environnement
```bash
# Backend
az webapp config appsettings list -n petitemaison-api

# Frontend
az webapp config appsettings list -n petitemaison-web
```

---

## 🎯 Résumé

**En cas de problème** :
1. Visitez `/fr/diagnostics-simple` pour voir la config
2. Testez manuellement avec `curl`
3. Vérifiez DevTools (F12) → Console et Network
4. Lire `FIX-502-AZURE.md` si 502 persiste
5. Attendre le déploiement complet (5-10 min)

**La boutique fonctionne même si le backend échoue grâce au fallback local!** 🛡️
