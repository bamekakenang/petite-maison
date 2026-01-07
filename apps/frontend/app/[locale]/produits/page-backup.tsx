import { getTranslations } from 'next-intl/server';
import { ProductCard } from '../../../components/ProductCard';
import { products as fallbackProducts } from '../../../data/products';

const categories = [
  { id: 'all', nameKey: 'category.all' },
  { id: 'figurines', nameKey: 'category.figurines' },
  { id: 'games', nameKey: 'category.games' },
  { id: 'bluray', nameKey: 'category.bluray' },
  { id: 'comics', nameKey: 'category.comics' }
];

async function fetchProducts(q?: string, category?: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (category && category !== 'all') params.set('category', category);
    params.set('inStock', 'true');

    const url = `${API_URL}/products${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('[produits] Fetching from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      return (data.data || []).sort((a: any, b: any) => a.id - b.id);
    }
    
    console.warn('[produits] API returned non-OK:', response.status);
    return null;
  } catch (error) {
    console.error('[produits] Failed to fetch from API:', error);
    return null;
  }
}

export default async function ProduitsPage({ params, searchParams }: { params: { locale: string }; searchParams?: { q?: string; category?: string } }) {
  const t = await getTranslations();
  const q = (searchParams?.q || '').trim();
  const categoryFilter = (searchParams?.category || 'all').trim();

  // Try to fetch from backend API first
  let items = await fetchProducts(q, categoryFilter);

  // Fallback to local data if API fails
  if (!items || items.length === 0) {
    console.log('[produits] Using fallback local data');
    items = fallbackProducts.map(p => ({
      id: p.id,
      sku: p.sku,
      name: t(p.nameKey),
      price: p.price,
      imageUrl: p.image,
      category: p.category
    })).sort((a, b) => a.id - b.id);

    // Apply filters
    if (categoryFilter && categoryFilter !== 'all') {
      items = items.filter(p => p.category === categoryFilter);
    }
    if (q) {
      const qLower = q.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(qLower) ||
        p.sku.toLowerCase().includes(qLower)
      );
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header de page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('pages.products.title')}</h1>
        <p className="text-neutral-600">{t('pages.products.subtitle')}</p>
      </div>

      {/* Filtres par catégorie */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t('pages.products.categories')}</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isActive = categoryFilter === category.id;
            const href = category.id === 'all' 
              ? `/${params.locale}/produits${q ? `?q=${encodeURIComponent(q)}` : ''}`
              : `/${params.locale}/produits?category=${category.id}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
            return (
              <a
                key={category.id}
                href={href}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {t(category.nameKey)}
              </a>
            );
          })}
        </div>
      </div>

      {/* Barre de recherche et tri */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form className="flex-1 max-w-md" role="search" method="get">
          <div className="flex items-stretch">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t('pages.products.searchPlaceholder')}
              className="w-full px-4 py-2 border border-r-0 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="submit"
              aria-label={t('pages.products.searchPlaceholder')}
              className="px-3 bg-neutral-900 text-white rounded-r-xl border border-neutral-900 hover:bg-red-700 transition flex items-center justify-center"
            >
              🔍
            </button>
          </div>
        </form>
        <select className="px-4 py-2 border rounded-xl bg-white">
          <option value="name">{t('pages.products.sortByName')}</option>
          <option value="price-asc">{t('pages.products.sortByPriceAsc')}</option>
          <option value="price-desc">{t('pages.products.sortByPriceDesc')}</option>
          <option value="newest">{t('pages.products.sortByNewest')}</option>
        </select>
      </div>

      {/* Grille de produits */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.length > 0 ? (
          items.map((product) => (
            <ProductCard
              key={product.id}
              sku={product.sku}
              title={product.name}
              price={product.price}
              image={product.imageUrl}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-neutral-600">{t('pages.products.noProducts')}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-100">
            {t('pagination.previous')}
          </button>
          <button className="px-4 py-2 bg-neutral-900 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-100">2</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-100">3</button>
          <button className="px-4 py-2 border rounded-lg hover:bg-neutral-100">
            {t('pagination.next')}
          </button>
        </div>
      </div>
    </main>
  );
}
