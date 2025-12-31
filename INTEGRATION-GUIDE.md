# 🔗 Guide d'Intégration Frontend-Backend

## ✅ Ce qui a été créé

### 1. Bibliothèque API Client (`apps/frontend/lib/api/`)
- ✅ `client.ts` - Wrapper fetch avec gestion JWT et refresh automatique
- ✅ `auth.ts` - Méthodes login, register, logout
- ✅ `products.ts` - Méthodes CRUD produits
- ✅ `orders.ts` - Méthodes gestion commandes
- ✅ `index.ts` - Export centralisé

### 2. Contexte d'Authentification (`apps/frontend/lib/contexts/AuthContext.tsx`)
- ✅ React Context pour gérer l'état auth
- ✅ Hook `useAuth()` pour accéder au contexte
- ✅ Gestion automatique des tokens JWT en localStorage
- ✅ Refresh automatique des tokens expirés

### 3. Configuration Environnement
- ✅ Variable `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` ajoutée à `.env.local`

## 🔧 Étapes d'Intégration

### Étape 1: Ajouter l'AuthProvider au Layout

**Fichier**: `apps/frontend/app/[locale]/layout.tsx`

```tsx
import { AuthProvider } from '../../lib/contexts/AuthContext';

export default async function RootLayout({children, params:{locale}}:{children:React.ReactNode, params:{locale:string}}){
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="min-h-screen text-neutral-100 horror-film">
        <AuthProvider>
          <CartProvider>
            <Header locale={locale}/>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <div id="content">{children}</div>
            </NextIntlClientProvider>
            <Footer />
            <MiniCart />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Étape 2: Connecter la Page Connexion

**Fichier**: `apps/frontend/app/[locale]/connexion/page.tsx`

**Remplacer le code existant par**:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function LoginPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push(`/${params.locale}/compte`);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('login.title')}</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border bg-black/50 border-white/20"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border bg-black/50 border-white/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-black rounded hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? 'Connexion...' : t('login.submit')}
        </button>
      </form>

      {/* Comptes de test */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
        <p className="font-bold mb-2">Comptes de test:</p>
        <p>Admin: admin@petitemaison.fr / password123</p>
        <p>Client: client@example.fr / password123</p>
      </div>
    </div>
  );
}
```

### Étape 3: Connecter la Page Produits

**Fichier**: `apps/frontend/app/[locale]/produits/page.tsx`

**Utiliser l'API backend**:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { productsApi, Product } from '../../../lib/api';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function ProductsPage({ params }: { params: { locale: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations();

  useEffect(() => {
    loadProducts();
  }, [page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({ page, limit: 12 });
      
      if (response.success && response.data) {
        setProducts(response.data);
        if (response.meta) {
          setTotalPages(response.meta.totalPages || 1);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="text-xl">Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="p-4 bg-red-500/20 border border-red-500 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{t('products.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/${params.locale}/produits/${product.sku}`}
            className="border border-white/10 rounded-lg p-4 hover:border-white/30 transition"
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-2xl font-bold">{product.price.toFixed(2)} €</p>
            {product.stock === 0 && (
              <p className="text-red-400 text-sm mt-2">Rupture de stock</p>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded border disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="px-4 py-2">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded border disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
```

### Étape 4: Connecter le Checkout/Panier

**Fichier**: `apps/frontend/app/[locale]/checkout/page.tsx` ou intégrer dans le panier

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi } from '../../../lib/api';
import { useAuth } from '../../../lib/contexts/AuthContext';

// Utiliser les items du panier existant
export default function CheckoutPage({ params }: { params: { locale: string } }) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleCheckout = async (cartItems: any[]) => {
    if (!isAuthenticated) {
      router.push(`/${params.locale}/connexion`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: 'CARD'
      };

      const response = await ordersApi.createOrder(orderData);

      if (response.success && response.data) {
        // Simuler le paiement
        await ordersApi.processPayment(response.data.id);
        
        // Rediriger vers confirmation
        router.push(`/${params.locale}/confirmation?order=${response.data.orderNumber}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Adresse de livraison</label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 rounded border bg-black/50 border-white/20"
            placeholder="123 Rue Example, 75001 Paris"
          />
        </div>

        <button
          onClick={() => handleCheckout([])} // Passer les items du cart
          disabled={loading || !shippingAddress}
          className="w-full py-3 bg-white text-black rounded hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Commander'}
        </button>
      </div>
    </div>
  );
}
```

### Étape 5: Modifier le Header pour utiliser useAuth

**Fichier**: `apps/frontend/app/[locale]/layout.tsx`

```tsx
'use client';

import { useAuth } from '../../lib/contexts/AuthContext';

function ClientHeader({ locale }: { locale: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  return (
    // ... header actuel mais avec:
    {user ? (
      <div className="flex items-center gap-2">
        <span>{user.firstName || user.email}</span>
        <button onClick={handleLogout} className="px-3 py-2 rounded">
          Déconnexion
        </button>
      </div>
    ) : (
      <Link href={`/${locale}/connexion`}>Connexion</Link>
    )}
  );
}
```

## 📋 Checklist d'Intégration

- [ ] Backend en cours d'exécution sur `http://localhost:3000`
- [ ] Frontend en cours d'exécution sur `http://localhost:3001`
- [ ] Variable `NEXT_PUBLIC_API_URL` configurée
- [ ] `AuthProvider` ajouté au layout racine
- [ ] Page connexion utilise `useAuth().login()`
- [ ] Page produits utilise `productsApi.getProducts()`
- [ ] Checkout utilise `ordersApi.createOrder()`
- [ ] Header/Navigation utilise `useAuth()` pour afficher état auth

## 🧪 Tests d'Intégration

### 1. Test Connexion
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

1. Aller sur http://localhost:3001/fr
2. Cliquer sur "Connexion"
3. Utiliser: `client@example.fr` / `password123`
4. Vérifier redirection vers compte

### 2. Test Produits
1. Aller sur http://localhost:3001/fr/produits
2. Vérifier que les produits du backend s'affichent
3. Vérifier la pagination fonctionne

### 3. Test Commande Complète
1. Se connecter
2. Ajouter produits au panier
3. Aller au checkout
4. Remplir adresse de livraison
5. Confirmer la commande
6. Vérifier dans le backend: `curl http://localhost:3000/api/v1/orders -H "Authorization: Bearer $TOKEN"`

## 🔍 Dépannage

### Erreur CORS
Si vous voyez des erreurs CORS dans la console:
1. Vérifier que le backend tourne sur port 3000
2. Vérifier `CORS_ORIGIN` dans `backend/.env` inclut `http://localhost:3001`

### Tokens non stockés
Si les tokens ne sont pas persistés:
1. Vérifier que `localStorage` est accessible (pas en mode SSR)
2. Vérifier la console pour erreurs JS
3. S'assurer que les composants utilisant `useAuth` sont marqués `'use client'`

### Produits ne chargent pas
1. Vérifier que le backend a des produits (run seed)
2. Vérifier l'URL de l'API dans `.env.local`
3. Inspecter Network tab pour voir les requêtes

## 📚 Documentation API Backend

Voir `backend/QUICKSTART.md` pour:
- Tous les endpoints disponibles
- Exemples de requêtes curl
- Format des réponses

## 🎯 Prochaines Améliorations

1. **Gestion d'erreurs améliorée**: Toast notifications
2. **Loading states**: Skeletons pendant chargement
3. **Optimistic updates**: Mise à jour UI avant réponse API
4. **Cache**: SWR ou React Query pour cache automatique
5. **SSR**: Pré-charger produits côté serveur avec cookies JWT
6. **Intercepteurs**: Gestion centralisée des erreurs HTTP
7. **Types partagés**: Générer types TypeScript depuis backend Prisma

## ✅ Résumé

L'infrastructure est prête pour connecter le frontend au backend:

**✅ Créé**:
- Bibliothèque API complète avec auto-refresh JWT
- Context React pour authentification
- Interfaces TypeScript

**⏳ À faire**:
- Modifier les pages existantes pour utiliser l'API (exemples fournis ci-dessus)
- Tester le flow complet end-to-end

**🎯 Workflow typique**:
1. User se connecte → JWT stocké
2. User browse produits → API `/products`
3. User ajoute au panier → localStorage
4. User checkout → API `/orders` (nécessite auth)
5. Ordre créé et payé via backend
