'use client';
import { usePathname, useParams, useRouter } from 'next/navigation';

const langs = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'sv', label: 'Svenska' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ro', label: 'Română' },
  { code: 'cs', label: 'Čeština' }
];

export function LocaleSwitcher() {
  const pathname = usePathname() || '/';
  const params = useParams();
  const router = useRouter();
  const currentLocale = (params.locale as string) || 'fr';
  // remove current locale prefix (any two-letter code)
  const base = pathname.replace(/^\/[a-zA-Z-]+/, '');

  return (
    <div aria-label="Language selector" className="relative inline-flex items-center rounded-xl border border-white/20 bg-black/40 backdrop-blur px-2 py-1 text-white">
      <select
        value={currentLocale}
        onChange={(e) => router.push(`/${e.target.value}${base || '/'}`)}
        className="bg-transparent text-white text-sm outline-none border-none appearance-none pr-5 cursor-pointer"
      >
        {langs.map(l => (
          <option key={l.code} value={l.code} className="text-black">{l.label}</option>
        ))}
      </select>
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="opacity-80 pointer-events-none absolute right-2">
        <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.044l3.71-3.813a.75.75 0 111.08 1.04l-4.24 4.36a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/>
      </svg>
    </div>
  );
}
