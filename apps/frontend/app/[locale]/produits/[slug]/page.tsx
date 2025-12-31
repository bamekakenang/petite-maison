import { prisma } from '../../../../lib/prisma';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '../../../../components/AddToCartButton';
import Script from 'next/script';

export default async function ProductDetail({ params:{ slug } }:{ params:{ slug:string } }) {
  const t = await getTranslations();
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return notFound();

  const price = product.priceCents / 100;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900">
          <Image src={product.image} alt={t(product.nameKey)} fill className="object-cover" />
        </div>
        <div>
          <div className="text-sm text-neutral-300 mb-1">{product.sku}</div>
          <h1 className="text-3xl font-bold mb-2">{t(product.nameKey)}</h1>
          <div className="text-xl font-semibold mb-4">{price.toFixed(2)}€</div>
          <div className="space-y-3">
            <AddToCartButton sku={product.sku} title={t(product.nameKey)} price={price} image={product.image} className="w-full" />
          </div>
          <p className="mt-6 text-neutral-300">
            {t('pages.product.descriptionFallback')}
          </p>
        </div>
      </div>
      <Script id="product-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context":"https://schema.org","@type":"Product",
          name: t(product.nameKey),
          sku: product.sku,
          offers: {"@type":"Offer","priceCurrency":"EUR","price":price}
        })}} />
    </main>
  );
}
