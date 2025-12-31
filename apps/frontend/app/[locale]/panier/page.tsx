import { getTranslations } from 'next-intl/server';
import { CartPageClient } from '../../../components/cart/CartPageClient';

export default async function CartPage({ params:{locale} }:{ params:{locale:string} }) {
  const t = await getTranslations();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('pages.cart.title')}</h1>
      <CartPageClient continueHref={`/${locale}/produits`} checkoutHref={`/${locale}/checkout`} />
    </main>
  );
}
