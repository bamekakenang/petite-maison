"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Props = {
  locale: string;
  displayName: string;
  accountLabel: string;
  ordersLabel?: string;
  unsubscribeLabel?: string;
  logoutLabel?: string;
};

export function UserMenu({ locale, displayName, accountLabel, ordersLabel = 'Mes commandes', unsubscribeLabel = 'Se désabonner du fanzine', logoutLabel = 'Se déconnecter' }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const getInitials = (input?: string | null) => {
    if (!input) return '?';
    const str = String(input).trim();
    const base = str.includes('@') ? str.split('@')[0] : str;
    const cleaned = base.replace(/[_\.-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return cleaned.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        className="group flex items-center gap-2 px-2 py-1 rounded-xl border border-white/20 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
      >
        <span
          aria-hidden
          className="avatar-initials inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-red-900 via-red-600 to-black text-white font-semibold uppercase tracking-wide ring-2 ring-red-500/40 shadow-[0_0_12px_rgba(220,38,38,0.45)] transition-transform duration-200 group-hover:scale-105 group-hover:ring-red-400/70 text-base"
        >
          {getInitials(displayName)}
        </span>
        <span className="sr-only">{accountLabel}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/90 backdrop-blur p-1 shadow-lg z-50"
        >
          <Link
            href={`/${locale}/compte`}
            role="menuitem"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            onClick={() => setOpen(false)}
          >
            {accountLabel}
          </Link>
          <Link
            href={`/${locale}/compte#orders`}
            role="menuitem"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            onClick={() => setOpen(false)}
          >
            {ordersLabel}
          </Link>
          <button
            role="menuitem"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-amber-200 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            onClick={async () => {
              try {
                const res = await fetch('/api/subscriptions/cancel', { method: 'POST' });
                if (res.ok) {
                  setOpen(false);
                  // Soft feedback; you can replace with toast
                  alert(unsubscribeLabel);
                }
              } catch {}
            }}
          >
            {unsubscribeLabel}
          </button>
          <button
            role="menuitem"
            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.reload();
              } catch {}
            }}
          >
            {logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
