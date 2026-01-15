'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AddToCartButton } from '../AddToCartButton';
import { currencyForLocale } from '../../lib/currency';
import { resolveProductImageUrl } from '../../lib/urls';
import { findProductBySlug } from '../../data/products';

type UiProduct = {
  id?: number;
  sku: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
};

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
      description: p?.description ? String(p.description) : undefined,
      createdAt: p?.createdAt ? String(p.createdAt) : undefined,
    }))
    .filter(p => p.sku && p.name);
}

function slugToSku(slug: string): string {
  return slug.replace(/_/g, '-').toUpperCase();
}

export function ProductDetailPageClient({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}) {
  const t = useTranslations();

  const fmt = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyForLocale(locale),
    });
  }, [locale]);

  const fallback = useMemo<UiProduct | null>(() => {
    const product = findProductBySlug(slug);
    if (!product) return null;

    return {
      id: product.id,
      sku: product.sku,
      name: safeT(t, product.nameKey),
      price: product.price,
      imageUrl: product.image,
    };
  }, [slug, t]);

  const [item, setItem] = useState<UiProduct | null>(fallback);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const skuCandidate = slugToSku(slug);
        const params = new URLSearchParams();
        params.set('q', skuCandidate);
        params.set('limit', '50');

        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json().catch(() => null);

        if (res.ok && json) {
          const items = normalizeItems(json);
          const match =
            items.find(p => p.sku.toUpperCase() === skuCandidate) ||
            items.find(p => p.sku.toLowerCase() === slug.toLowerCase());

          if (match && !cancelled) {
            setItem(match);
            setUsedFallback(false);
            setLoading(false);
            return;
          }
        }
      } catch {
        // ignore and fallback
      }

      if (cancelled) return;

      if (fallback) {
        setItem(fallback);
        setUsedFallback(true);
        setLoading(false);
        return;
      }

      setItem(null);
      setNotFound(true);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, fallback]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="py-12 text-center text-neutral-600">Chargement…</div>
      </main>
    );
  }

  if (notFound || !item) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">Produit introuvable</h1>
        <p className="text-neutral-300 mb-4">Ce produit n’existe pas (ou a été supprimé).</p>
        <Link href={`/${locale}/produits`} className="underline">
          Retour à la boutique
        </Link>
      </main>
    );
  }

  const imageSrc = resolveProductImageUrl(item.imageUrl) || '/products/house.svg';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {usedFallback && (
        <p className="mb-4 text-xs text-amber-700">
          Mode secours: impossible de charger l’API, affichage des données locales.
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900">
          {/* Use <img> to avoid sharp/_next/image issues on Azure */}
          <img
            src={imageSrc}
            alt={`Image de ${item.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/products/house.svg';
            }}
          />
        </div>

        <div>
          <div className="text-sm text-neutral-300 mb-1">{item.sku}</div>
          <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
          <div className="text-xl font-semibold mb-4">{fmt.format(item.price)}</div>

          <div className="space-y-3">
            <AddToCartButton
              sku={item.sku}
              title={item.name}
              price={item.price}
              image={imageSrc}
              className="w-full"
            />
          </div>

          <p className="mt-6 text-neutral-300">
            {item.description || t('pages.product.descriptionFallback')}
          </p>
        </div>
      </div>
    </main>
  );
}
