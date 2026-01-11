'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProductCard } from '../ProductCard';
import { products as fallbackProducts } from '../../data/products';

type UiProduct = {
  id?: number;
  sku: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  createdAt?: string;
};

const categories = [
  { id: 'all', nameKey: 'category.all' },
  { id: 'figurines', nameKey: 'category.figurines' },
  { id: 'games', nameKey: 'category.games' },
  { id: 'bluray', nameKey: 'category.bluray' },
  { id: 'comics', nameKey: 'category.comics' },
];

function safeT(t: (key: string) => string, key: string): string {
  try {
    const value = t(key);
    return typeof value === 'string' && value ? value : key;
  } catch {
    return key;
  }
}

function normalizeItems(raw: any): UiProduct[] {
  const data = raw?.data;
  const items: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : [];

  return items
    .filter(Boolean)
    .map((p: any) => ({
      id: typeof p?.id === 'number' ? p.id : undefined,
      sku: String(p?.sku || ''),
      name: String(p?.name || ''),
      price: Number(p?.price || 0),
      imageUrl: p?.imageUrl ? String(p.imageUrl) : undefined,
      category: p?.category ? String(p.category) : undefined,
      createdAt: p?.createdAt ? String(p.createdAt) : undefined,
    }))
    .filter(p => p.sku && p.name);
}

export function ProductsPageClient({ locale }: { locale: string }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const q = (searchParams.get('q') || '').trim();
  const categoryFilter = (searchParams.get('category') || '').trim() || 'all';
  const sort = (searchParams.get('sort') || '').trim() || 'newest';

  const fallbackItems = useMemo<UiProduct[]>(() => {
    let items: UiProduct[] = fallbackProducts.map(p => ({
      id: p.id,
      sku: p.sku,
      name: safeT(t, p.nameKey),
      price: p.price,
      imageUrl: p.image,
      category: p.category,
    }));

    if (categoryFilter !== 'all') {
      items = items.filter(p => p.category === categoryFilter);
    }

    if (q) {
      const qLower = q.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(qLower) || p.sku.toLowerCase().includes(qLower)
      );
    }

    return items;
  }, [t, q, categoryFilter]);

  const [items, setItems] = useState<UiProduct[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setUsingFallback(false);

      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
        if (sort) params.set('sort', sort);
        params.set('limit', '200');

        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json().catch(() => null);

        if (res.ok && json) {
          const normalized = normalizeItems(json);
          if (!cancelled) {
            setItems(normalized);
            setLoading(false);
          }
          return;
        }
      } catch {
        // ignore
      }

      if (!cancelled) {
        setItems(fallbackItems);
        setUsingFallback(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [q, categoryFilter, sort, fallbackItems]);

  const sortedItems = useMemo(() => {
    const list = Array.isArray(items) ? [...items] : [];

    switch (sort) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        list.sort((a, b) => {
          const aTime = a.createdAt ? Date.parse(a.createdAt) : NaN;
          const bTime = b.createdAt ? Date.parse(b.createdAt) : NaN;
          if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return bTime - aTime;
          const aId = a.id ?? 0;
          const bId = b.id ?? 0;
          return bId - aId;
        });
        break;
    }

    return list;
  }, [items, sort]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());

    const shouldClear =
      !value ||
      (key === 'category' && value === 'all') ||
      (key === 'sort' && value === 'newest');

    if (shouldClear) next.delete(key);
    else next.set(key, value);

    router.push(`${pathname}${next.toString() ? `?${next.toString()}` : ''}`);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('pages.products.title')}</h1>
          <p className="text-neutral-600">{t('pages.products.subtitle')}</p>
          {usingFallback && (
            <p className="mt-2 text-xs text-amber-700">
              Mode secours: impossible de charger l’API, affichage du catalogue local.
            </p>
          )}
        </div>
        <Link
          href={`/${locale}/compte/vendre`}
          className="shrink-0 rounded-xl bg-white text-black px-4 py-2 border hover:bg-neutral-100"
        >
          {t('nav.addProduct')}
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t('pages.products.categories')}</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const isActive = categoryFilter === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setParam('category', category.id)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {t(category.nameKey)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form
          className="flex-1 max-w-md"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const value = String(fd.get('q') || '').trim();
            setParam('q', value);
          }}
        >
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

        <select
          className="px-4 py-2 border rounded-xl bg-white"
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
        >
          <option value="name">{t('pages.products.sortByName')}</option>
          <option value="price-asc">{t('pages.products.sortByPriceAsc')}</option>
          <option value="price-desc">{t('pages.products.sortByPriceDesc')}</option>
          <option value="newest">{t('pages.products.sortByNewest')}</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-600">Chargement…</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedItems.length > 0 ? (
            sortedItems.map((product) => (
              <ProductCard
                key={product.id ?? product.sku}
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
      )}
    </main>
  );
}
