import { ProductDetailPageClient } from '../../../../components/shop/ProductDetailPageClient';

export default function ProductDetail({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  // Client-side render to avoid Azure Server Components crashes.
  return <ProductDetailPageClient locale={locale} slug={slug} />;
}
