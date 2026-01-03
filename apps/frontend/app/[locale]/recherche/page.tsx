import { redirect } from 'next/navigation';

export default function SearchRedirect({ params, searchParams }: { params: { locale: string }, searchParams?: { q?: string } }) {
  const locale = params.locale || 'fr';
  const q = searchParams?.q ? `?q=${encodeURIComponent(searchParams.q)}` : '';
  redirect(`/${locale}/produits${q}`);
}
