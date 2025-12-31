import {getTranslations} from 'next-intl/server';
import Script from 'next/script';
import { ProductCard } from '../../components/ProductCard';
import Link from 'next/link';

export default async function Home({ params:{locale} }:{ params:{locale:string} }) {
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10 rounded-3xl bg-white p-6 shadow-sm border text-neutral-900">
        <h1 className="text-3xl font-semibold">{t('hero.title')}</h1>
        <p className="text-neutral-600 mt-2">{t('hero.subtitle')}</p>
        <div className="mt-4 flex gap-3">
          <Link href={`/${locale}/produits`} className="inline-block rounded-xl bg-neutral-900 text-white px-5 py-2.5 hover:bg-neutral-800">{t('cta.explore')}</Link>
          <Link href={`/${locale}/fanzine`} className="inline-block rounded-xl border border-neutral-900 text-neutral-900 px-5 py-2.5 hover:bg-neutral-100">{t('cta.zine')}</Link>
        </div>
      </section>

      <section aria-labelledby="featured">
        <h2 id="featured" className="text-xl font-semibold mb-4">{t('featured')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { sku: 'FIG-0005', titleKey: 'products.monsterCreature', price: 89.99, image: '/products/monster-creature.webp' },
            { sku: 'MSK-0001', titleKey: 'products.pumpkinMask', price: 35.99, image: '/products/pumpkin-mask.webp' },
            { sku: 'MSK-0002', titleKey: 'products.michaelMyersMask', price: 49.99, image: '/products/michael-myers-mask.jpeg' },
            { sku: 'DEC-0001', titleKey: 'products.bougeoirSquelette', price: 24.99, image: '/products/bougeoir-squelette.jpg' },
            { sku: 'DEC-0002', titleKey: 'products.bougieCercueil', price: 19.99, image: '/products/bougie-cercueil.jpg' },
            { sku: 'DEC-0003', titleKey: 'products.pumpkinDecoration', price: 15.99, image: '/products/pumpkin-decoration.jpg' },
            { sku: 'ART-0001', titleKey: 'products.horrorScene', price: 129.99, image: '/products/horror-scene.jpg' },
          ].map((p) => (
            <ProductCard
              key={p.sku}
              sku={p.sku}
              title={t(p.titleKey)}
              price={p.price}
              image={p.image}
            />
          ))}
        </div>
      </section>

      <Script id="org-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context":"https://schema.org",
          "@type":"Organization",
          "name":"La Petite Maison de l'Épouvante",
          "url":"http://localhost:3000"
        })}} />
    </main>
  );
}
