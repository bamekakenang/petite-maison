'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  sku: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (sku: string) => void;
  clear: () => void;
  updateQty: (sku: string, qty: number) => void;
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  ready: boolean;
  persist: () => void;
};
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'pm_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Load from server first, fallback to localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cart/load', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.items)) {
            if (data.items.length > 0) {
              setItems(data.items);
              setReady(true);
              return;
            }
          }
        }
      } catch (e) {
        console.debug('Failed to load cart from server:', e instanceof Error ? e.message : 'unknown');
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        }
      } catch (e) {
        console.debug('Failed to load cart from localStorage:', e instanceof Error ? e.message : 'unknown');
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist
  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) { console.warn('Failed to save cart to localStorage:', e); }
    try { 
      fetch('/api/cart/save', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ items }) 
      }).catch(e => console.warn('Failed to save cart to server:', e));
    } catch (e) { 
      console.warn('Failed to fetch cart save:', e);
    }
  };
  useEffect(() => { persist(); }, [items]);

  const addItem = (item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.sku === item.sku);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem = (sku: string) => setItems(prev => prev.filter(i => i.sku !== sku));
  const clear = () => setItems([]);

  const updateQty = (sku: string, qty: number) => {
    setItems(prev => prev.map(i => i.sku === sku ? { ...i, qty: Math.max(1, qty) } : i));
  };

  const { count, total } = useMemo(() => ({
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.qty * i.price, 0)
  }), [items]);

  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen(v => !v);

  const value = { items, addItem, removeItem, clear, count, total, updateQty, isOpen, open, close, toggle, ready, persist } as const;
  return <CartContext.Provider value={value as any}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}