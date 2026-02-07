import { ProductDetailClient } from '../../../../components/shop/ProductDetailClient';

export default function ProductDetail({
  params: { slug },
}: {
  params: { slug: string };
}) {
  // Client-side render — locale is obtained via useLocale() inside the client component.
  return <ProductDetailClient slug={slug} />;
}
