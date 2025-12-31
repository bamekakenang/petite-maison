import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toCents(n: number) { return Math.round(n * 100); }

const seedProducts = [
  { sku: 'FIG-0005', slug: 'fig-0005', nameKey: 'products.monsterCreature', price: 89.99, category: 'figurines', image: '/products/monster-creature.webp' },
  { sku: 'MSK-0001', slug: 'msk-0001', nameKey: 'products.pumpkinMask', price: 35.99, category: 'figurines', image: '/products/pumpkin-mask.webp' },
  { sku: 'MSK-0002', slug: 'msk-0002', nameKey: 'products.michaelMyersMask', price: 49.99, category: 'figurines', image: '/products/michael-myers-mask.jpeg' },
  { sku: 'DEC-0001', slug: 'dec-0001', nameKey: 'products.bougeoirSquelette', price: 24.99, category: 'figurines', image: '/products/bougeoir-squelette.jpg' },
  { sku: 'DEC-0002', slug: 'dec-0002', nameKey: 'products.bougieCercueil', price: 19.99, category: 'figurines', image: '/products/bougie-cercueil.jpg' }
];

async function main() {
  for (const p of seedProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        slug: p.slug,
        nameKey: p.nameKey,
        priceCents: toCents(p.price),
        image: p.image,
        category: p.category,
      },
      create: {
        sku: p.sku,
        slug: p.slug,
        nameKey: p.nameKey,
        priceCents: toCents(p.price),
        image: p.image,
        category: p.category,
        stock: 100,
      }
    });
  }
  console.log(`Seeded ${seedProducts.length} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
