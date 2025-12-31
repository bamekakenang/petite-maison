"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LoginPageClient({ locale }: { locale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
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
      if (mode === 'register') {
        body.firstName = firstName;
        body.lastName = lastName;
        body.gender = gender;
        body.phone = phone;
        body.address = address;
        body.city = city;
        body.country = country;
      }
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
          <label className="block text-sm mb-1">{t('pages.auth.register.firstName') ?? 'Prénom'}</label>
          <input value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="Prénom" required />
        </div>
      )}
      {mode==='register' && (
        <div>
          <label className="block text-sm mb-1">{t('pages.auth.register.lastName') ?? 'Nom'}</label>
          <input value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="Nom" />
        </div>
      )}
      {mode==='register' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Sexe</label>
            <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" required>
              <option value="">Choisir</option>
              <option value="F">Féminin</option>
              <option value="M">Masculin</option>
              <option value="O">Autre / Préfère ne pas dire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Pays</label>
            <input value={country} onChange={e=>setCountry(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="France" required />
          </div>
        </div>
      )}
      {mode==='register' && (
        <div>
          <label className="block text-sm mb-1">Téléphone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="+33 6 12 34 56 78" required />
        </div>
      )}
      {mode==='register' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Adresse</label>
            <input value={address} onChange={e=>setAddress(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="12 rue Exemple" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Ville</label>
            <input value={city} onChange={e=>setCity(e.target.value)} className="w-full border border-neutral-300 bg-white text-neutral-900 placeholder-neutral-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" placeholder="Paris" required />
          </div>
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
