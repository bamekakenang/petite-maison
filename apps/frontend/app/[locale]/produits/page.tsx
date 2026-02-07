import { Suspense } from 'react';
import { ProductsPageClient } from '../../../components/shop/ProductsPageClient';

export default function ProduitsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-neutral-600">Chargement…</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
