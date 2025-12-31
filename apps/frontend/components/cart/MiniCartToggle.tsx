"use client";

import { useCart } from './CartProvider';

export function MiniCartToggle() {
  const { toggle, count } = useCart() as any;
  return (
    <button onClick={toggle} className="px-3 py-2 rounded-xl border border-white/20 text-white hover:bg-white/10 relative">
      <span className="inline-flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h8v-2h-7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h4.72c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1h-14.31l-.94-2z"/></svg>
        <span>Panier</span>
      </span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-xs grid place-items-center">
          {count}
        </span>
      )}
    </button>
  );
}
