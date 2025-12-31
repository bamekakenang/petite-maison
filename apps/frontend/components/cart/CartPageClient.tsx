'use client';

import { useCart } from './CartProvider';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { currencyForLocale } from '../../lib/currency';

export function CartPageClient({ continueHref, checkoutHref }: { continueHref: string; checkoutHref?: string }) {
  const { items, removeItem, clear, total, updateQty, ready, persist } = useCart() as any;
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-neutral-300">Chargement du panier…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-neutral-300 mb-6">{t('pages.cart.empty')}</p>
        <a href={continueHref} className="inline-block px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10">{t('pages.cart.continueShopping')}</a>
      </div>
    );
  }

  async function goToStripe() {
    persist();
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          currency: currencyForLocale(locale),
          locale,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });
      const data = await res.json();
      if (res.status === 401 && data?.login) {
        window.location.href = data.login;
        return;
      }
      if (!res.ok || !data?.url) throw new Error(data?.error || 'checkout_failed');
      window.location.href = data.url;
    } catch (e) {
      // Fallback: redirect to login
      router.push(`/${locale}/connexion?next=/${locale}/panier`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
      <ul className="divide-y divide-white/10">
        {items.map((item: any) => (
          <li key={item.sku} className="flex items-center gap-4 py-4">
            <img src={item.image || '/products/house.svg'} alt={item.title} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-neutral-300">{item.sku} • x{item.qty}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.sku, item.qty - 1)} className="px-2 py-1 rounded border border-white/20 hover:bg-white/10">-</button>
              <span className="w-6 text-center">{item.qty}</span>
              <button onClick={() => updateQty(item.sku, item.qty + 1)} className="px-2 py-1 rounded border border-white/20 hover:bg-white/10">+</button>
            </div>
            <div className="w-24 text-right">{(item.price * item.qty).toFixed(2)}€</div>
            <button onClick={() => removeItem(item.sku)} className="ml-2 px-2 py-1 rounded border border-white/20 hover:bg-white/10">{t('pages.cart.remove')}</button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end items-center gap-3 p-4">
        <div className="font-semibold">Total: {total.toFixed(2)}€</div>
        <button onClick={clear} className="px-3 py-2 rounded border border-white/20 hover:bg-white/10">{t('pages.cart.clear')}</button>
        <button disabled={loading} onClick={() => { void goToStripe(); }} className="px-3 py-2 rounded bg-white text-black hover:bg-neutral-200 disabled:opacity-60">{loading ? '…' : t('pages.cart.checkout')}</button>
      </div>
    </div>
  );
}
