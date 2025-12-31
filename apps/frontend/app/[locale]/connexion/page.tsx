import { LoginPageClient } from '../../../components/auth/LoginPageClient';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage({ params:{locale} }:{ params:{locale:string} }) {
  await getTranslations();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <LoginPageClient locale={locale} />
    </main>
  );
}
