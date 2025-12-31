"use client";

import { useCart } from './CartProvider';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function MiniCart() {
  const { isOpen, close, items, total, removeItem } = useCart();
  const params = useParams();
  const locale = (params as any)?.locale || 'fr';

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
      <aside className={`absolute right-0 top-0 h-full w-80 bg-white text-neutral-900 shadow-xl transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Panier</h2>
          <button onClick={close} className="text-sm px-2 py-1 rounded border">✕</button>
        </div>
        <div className="p-4 space-y-3 max-h-[calc(100%-8rem)] overflow-auto">
          {items.length === 0 ? (
            <div className="text-sm text-neutral-500">Votre panier est vide.</div>
          ) : items.map(i => (
            <div key={i.sku} className="flex items-center gap-3">
              <img src={i.image || '/products/house.svg'} className="w-12 h-12 object-cover rounded" alt="" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{i.title}</div>
                <div className="text-xs text-neutral-500">x{i.qty}</div>
              </div>
              <div className="text-sm">{(i.qty * i.price).toFixed(2)}€</div>
              <button onClick={()=>removeItem(i.sku)} className="text-xs px-2 py-1 border rounded ml-1">Retirer</button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex items-center justify-between">
          <div className="font-semibold">Total</div>
          <div className="font-semibold">{total.toFixed(2)}€</div>
        </div>
        <div className="p-4">
          <Link href={`/${locale}/panier`} className="block w-full text-center rounded-xl bg-neutral-900 text-white py-2">Voir le panier</Link>
        </div>
      </aside>
    </div>
  );
}
