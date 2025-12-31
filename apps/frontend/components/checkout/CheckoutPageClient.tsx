"use client";

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCart } from '../cart/CartProvider';
import { useRouter } from 'next/navigation';
import { currencyForLocale } from '../../lib/currency';

export function CheckoutPageClient({ locale }: { locale: string }) {
  const t = useTranslations();
  const currentLocale = useLocale();
  const { items, total, clear, ready } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<'card'|'paypal'|'apple'|'google'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [customer, setCustomer] = useState({
    email: '',
    name: '',
    phone: '',
    address: { line1: '', city: '', postal_code: '', country: 'FR' }
  });

  const onField = (path: string) => (e: any) => {
    const value = e.target.value;
    setCustomer(prev => {
      const next:any = { ...prev };
      const seg = path.split('.') as string[];
      let obj:any = next;
      for (let i=0;i<seg.length-1;i++){ obj = obj[seg[i]]; }
      obj[seg[seg.length-1]] = value;
      return next;
    });
  };

  const pay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          currency: currencyForLocale(currentLocale),
          locale,
          customer,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'checkout_failed');
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      // Fallback demo flow
      clear();
      router.push(`/${locale}/confirmation`);
    } catch (err: any) {
      console.error(err);
      setError(t('errors.checkoutFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const canPay = ready && items.length > 0 && total > 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form ref={formRef} onSubmit={pay} className="lg:col-span-2 bg-white text-neutral-900 rounded-2xl p-6 space-y-5">
        {!ready && <div className="text-sm text-neutral-500">Chargement du panier…</div>}
        {!canPay && (
          <div className="mb-2 text-sm text-red-600">{t('pages.cart.empty')}</div>
        )}
        <h2 className="text-xl font-semibold">{t('pages.checkout.contactTitle')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">{t('pages.checkout.fields.email')}</label>
            <input type="email" value={customer.email} onChange={onField('email')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('pages.checkout.fields.name')}</label>
            <input value={customer.name} onChange={onField('name')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('pages.checkout.fields.phone')}</label>
            <input value={customer.phone} onChange={onField('phone')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="+33 6 12 34 56 78" />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6">{t('pages.checkout.addressTitle')}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">{t('pages.checkout.fields.line1')}</label>
            <input value={customer.address.line1} onChange={onField('address.line1')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="13 Rue des Chauves-Souris" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('pages.checkout.fields.city')}</label>
            <input value={customer.address.city} onChange={onField('address.city')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div>
            <label className="block text-sm mb-1">{t('pages.checkout.fields.postal')}</label>
            <input value={customer.address.postal_code} onChange={onField('address.postal_code')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">{t('pages.checkout.fields.country')}</label>
            <select value={customer.address.country} onChange={onField('address.country')} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
              {['FR','BE','DE','ES','IT','PT','GB','US'].map(c => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-6">{t('pages.checkout.method')}</h2>
        <div className="grid sm:grid-cols-2 gap-3" aria-disabled={!canPay}>
          {[
            { id:'card', label:t('pages.checkout.methods.card')},
            { id:'paypal', label:'PayPal'},
            { id:'apple', label:'Apple Pay'},
            { id:'google', label:'Google Pay'}
          ].map(opt => (
            <label key={opt.id} className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer ${method===opt.id ? 'border-black' : 'border-neutral-300'}`}>
              <input type="radio" name="method" value={opt.id} checked={method===opt.id as any} onChange={()=>setMethod(opt.id as any)} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>

        {method==='card' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">{t('pages.checkout.card.number')}</label>
              <input className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="4242 4242 4242 4242" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('pages.checkout.card.exp')}</label>
              <input className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="MM/YY" />
            </div>
            <div>
              <label className="block text-sm mb-1">CVC</label>
              <input className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="123" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">{t('pages.checkout.card.name')}</label>
              <input className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="John Doe" />
            </div>
          </div>
        )}

        <button type="submit" disabled={submitting || !canPay} className="rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-60">
          {submitting ? '...' : t('pages.checkout.payNow')} ({total.toFixed(2)}€)
        </button>
        {!canPay && (
          <a href={`/${locale}/produits`} className="inline-block ml-3 text-sm underline">{t('pages.cart.continueShopping')}</a>
        )}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </form>

      <aside className="bg-black/40 border border-white/10 rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">{t('pages.checkout.summary')}</h3>
        <ul className="space-y-3">
          {items.map(i => (
            <li key={i.sku} className="flex justify-between text-sm">
              <span className="truncate">{i.title} × {i.qty}</span>
              <span>{(i.qty * i.price).toFixed(2)}€</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-white/10 pt-4 flex justify-between font-semibold">
          <span>{t('pages.checkout.total')}</span>
          <span>{total.toFixed(2)}€</span>
        </div>
      </aside>
    </div>
  );
}
