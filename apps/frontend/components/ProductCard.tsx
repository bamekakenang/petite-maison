'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './cart/CartProvider';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { currencyForLocale } from '../lib/currency';

export function ProductCard({ sku, title, price, image }: { sku: string; title: string; price: number; image?: string }) {
  const t = useTranslations();
  const { addItem, open } = useCart() as any;
  const locale = useLocale();
  const fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyForLocale(locale) });

  const [src, setSrc] = useState(image || '/products/house.svg');
  const blur = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2QzZDNkMyIvPjwvc3ZnPg=='

  return (
    <article className="group border rounded-2xl p-3 bg-white hover:shadow-md transition" aria-labelledby={`${sku}-title`}>
      <Link href={`./produits/${sku.toLowerCase()}`}
        className="relative aspect-[3/4] mb-2 bg-neutral-900 rounded-xl overflow-hidden vhs-grain blood-drip glitch-hover block">
        <Image
          alt={`Image de ${title}`}
          src={src}
          onError={() => setSrc('/products/house.svg')}
          fill
          sizes="(min-width:768px) 25vw, 50vw"
          placeholder="blur"
          blurDataURL={blur}
          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition duration-300"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"/>
        {/* Overlay title for visibility */}
        <div className="absolute left-2 right-2 bottom-2">
          <span className="inline-block max-w-full truncate rounded-lg bg-black/60 text-white text-xs px-2 py-1 shadow">
            {title}
          </span>
        </div>
      </Link>
      <div className="text-sm text-neutral-500">{sku}</div>
      <h3 id={`${sku}-title`} className="font-medium text-neutral-900 line-clamp-2">{title}</h3>
      <div className="mt-1 font-semibold text-neutral-900">{fmt.format(price)}</div>
      <button
        onClick={() => { addItem({ sku, title, price, image: src }); open?.(); }}
        className="mt-2 w-full rounded-xl bg-neutral-900 text-white py-2 hover:bg-red-700 transition"
        aria-label={`Ajouter ${title} au panier`}
      >
        {t('addToCart')}
      </button>
    </article>
  );
}
