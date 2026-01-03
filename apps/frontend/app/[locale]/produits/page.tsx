import { getTranslations } from 'next-intl/server';
import { ProductCard } from '../../../components/ProductCard';
import { prisma } from '../../../lib/prisma';

const categories = [
  { id: 'all', nameKey: 'category.all' },
  { id: 'figurines', nameKey: 'category.figurines' },
  { id: 'games', nameKey: 'category.games' },
  { id: 'bluray', nameKey: 'category.bluray' },
  { id: 'comics', nameKey: 'category.comics' }
];

export default async function ProduitsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const t = await getTranslations();
  const q = (searchParams?.q || '').trim();
  const qLower = q.toLowerCase();

  // Fetch all products (small catalog) then filter on translated names + sku/slug/category
  const allProducts = await prisma.product.findMany({
    orderBy: { id: 'asc' },
  });

  const items = q
    ? allProducts.filter((p) => {
        const haystack = [
          t(p.nameKey),
          p.sku,
          p.slug ?? '',
          p.category,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(qLower);
      })
    : allProducts;

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
          {categories.map(category => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full border hover:bg-neutral-100 transition-colors"
            >
              {t(category.nameKey)}
            </button>
          ))}
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
        {items.map((product: { id: number; sku: string; nameKey: string; priceCents: number; image: string }) => (
          <ProductCard
            key={product.id}
            sku={product.sku}
            title={t(product.nameKey)}
            price={product.priceCents / 100}
            image={product.image}
          />
        ))}
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