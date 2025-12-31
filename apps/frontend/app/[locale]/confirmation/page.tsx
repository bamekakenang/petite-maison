import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ConfirmationPage({ params:{locale} }:{ params:{locale:string} }){
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{t('pages.confirmation.title')}</h1>
      <p className="text-neutral-300 mb-8">{t('pages.confirmation.subtitle')}</p>
      <Link href={`/${locale}/produits`} className="inline-block px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10">{t('pages.confirmation.backToShop')}</Link>
    </main>
  );
}
