import { getTranslations } from 'next-intl/server';
import { CheckoutRedirectClient } from '../../../components/checkout/CheckoutRedirectClient';

export default async function CheckoutPage({ params:{locale} }:{ params:{locale:string} }){
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('pages.checkout.title')}</h1>
      <CheckoutRedirectClient locale={locale} />
    </main>
  );
}
