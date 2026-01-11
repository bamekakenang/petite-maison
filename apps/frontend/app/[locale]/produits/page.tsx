import { ProductsPageClient } from '../../../components/shop/ProductsPageClient';

export default function ProduitsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Client-side render to avoid Azure Server Components crashes (DB/API/middleware issues).
  return <ProductsPageClient locale={locale} />;
}
