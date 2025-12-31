"use client";

import { useEffect, useState } from 'react';
import { useCart } from '../cart/CartProvider';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { currencyForLocale } from '../../lib/currency';

export function CheckoutRedirectClient({ locale }: { locale: string }) {
  const { items, ready, persist } = useCart() as any;
  const l = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!items || items.length === 0) {
      router.replace(`/${locale}/panier`);
      return;
    }
    const run = async () => {
      try {
        persist();
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            currency: currencyForLocale(l),
            locale,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined
          })
        });
        const data = await res.json();
        if (res.status === 401 && data?.login) { window.location.href = data.login; return; }
        if (!res.ok || !data?.url) throw new Error(data?.error || 'checkout_failed');
        window.location.href = data.url;
      } catch (e) {
        setError(t('errors.checkoutFailed'));
      }
    };
    void run();
  }, [ready, items, router, persist, l, locale, t]);

  return (
    <div className="mx-auto max-w-2xl text-center py-20">
      <p className="text-neutral-300">{t('pages.checkout.redirecting')}</p>
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
