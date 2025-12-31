"use client";

import { useState } from 'react';

export function LogoutButton({ className = '' }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try { await fetch('/api/auth/logout', { method: 'POST' }); window.location.reload(); }
        finally { setLoading(false); }
      }}
      className={`rounded-xl border px-3 py-2 hover:bg-white/10 ${className}`}
      disabled={loading}
    >
      {loading ? '…' : 'Se déconnecter'}
    </button>
  );
}
