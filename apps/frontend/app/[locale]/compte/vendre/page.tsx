import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { currentUser } from '../../../../lib/auth';
import { AddProductPageClient } from '../../../../components/admin/AddProductPageClient';

export default async function SellProductPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations();

  const user = await currentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-2">{t('nav.addProduct')}</h1>
        <p className="text-neutral-300 mb-4">Vous devez être connecté pour ajouter un produit.</p>
        <Link
          href={`/${locale}/connexion`}
          className="inline-block rounded-xl bg-white text-black px-4 py-2"
        >
          {t('nav.login')}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-2">Ajouter un produit à vendre</h1>
      <p className="text-neutral-300 mb-6">
        Remplissez le formulaire ci-dessous. Le produit sera créé côté backend (catalogue).
      </p>
      <AddProductPageClient locale={locale} />
    </main>
  );
}
