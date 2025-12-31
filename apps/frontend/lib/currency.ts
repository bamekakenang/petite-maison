export function currencyForLocale(locale: string): string {
  const l = (locale || 'en').toLowerCase();
  const map: Record<string, string> = {
    fr: 'EUR', en: 'EUR', es: 'EUR', de: 'EUR', it: 'EUR', pt: 'EUR',
    nl: 'EUR', sv: 'EUR', pl: 'PLN', cs: 'CZK', ro: 'RON', tr: 'TRY',
    ru: 'RUB', ar: 'SAR', zh: 'CNY', ja: 'JPY', ko: 'KRW', hi: 'INR'
  };
  const key = l.split('-')[0];
  return map[key] || 'EUR';
}
