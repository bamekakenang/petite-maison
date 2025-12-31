"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LoginPageClient({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body:any = { email, password, remember };
      if (mode === 'register') body.name = name;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'auth_failed');
      // Force a full reload so the server header reads the fresh auth cookie immediately
      window.location.assign(`/${locale}`);
    } catch (e) {
      setError(t(mode === 'login' ? 'pages.auth.login.errors.failed' : 'pages.auth.register.errors.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto bg-white text-neutral-900 rounded-2xl p-6 space-y-4">
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={()=>setMode('login')} className={`flex-1 rounded-xl px-3 py-2 border ${mode==='login'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-300'}`}>{t('pages.auth.login.title')}</button>
        <button type="button" onClick={()=>setMode('register')} className={`flex-1 rounded-xl px-3 py-2 border ${mode==='register'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-300'}`}>{t('pages.auth.register.title')}</button>
      </div>

      {mode==='register' && (
        <div>
          <label className="block text-sm mb-1">{t('pages.auth.register.name')}</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder={t('pages.auth.register.namePlaceholder')} required />
        </div>
      )}
      <div>
        <label className="block text-sm mb-1">{t('pages.auth.login.email')}</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="you@example.com" required />
      </div>
      <div>
        <label className="block text-sm mb-1">{t('pages.auth.login.password')}</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="••••••••" required />
      </div>
      {mode==='login' && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} />
          <span>{t('pages.auth.login.remember')}</span>
        </label>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-60">
        {loading ? '…' : t(mode==='login' ? 'pages.auth.login.submit' : 'pages.auth.register.submit')}
      </button>
    </form>
  );
}
