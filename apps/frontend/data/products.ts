export type Product = {
  id: number;
  sku: string;
  slug: string;
  nameKey: string;
  price: number;
  category: 'figurines' | 'games' | 'bluray' | 'comics';
  image: string;
  images?: string[];
  stock?: number;
};

export const products: Product[] = [
  { id: 1, sku: 'FIG-0001', slug: 'fig-0001', nameKey: 'products.horrificFigurine1', price: 45.99, category: 'figurines', image: 'https://picsum.photos/800/1066?random=1' },
  { id: 2, sku: 'FIG-0002', slug: 'fig-0002', nameKey: 'products.horrificFigurine2', price: 52.90, category: 'figurines', image: 'https://picsum.photos/800/1066?random=2' },
  { id: 3, sku: 'FIG-0003', slug: 'fig-0003', nameKey: 'products.horrificFigurine3', price: 38.50, category: 'figurines', image: 'https://picsum.photos/800/1066?random=3' },
  { id: 4, sku: 'FIG-0004', slug: 'fig-0004', nameKey: 'products.horrificFigurine4', price: 67.20, category: 'figurines', image: 'https://picsum.photos/800/1066?random=4' },
  { id: 5, sku: 'FIG-0005', slug: 'fig-0005', nameKey: 'products.monsterCreature', price: 89.99, category: 'figurines', image: '/products/monster-creature.webp' },
  { id: 6, sku: 'MSK-0001', slug: 'msk-0001', nameKey: 'products.pumpkinMask', price: 35.99, category: 'figurines', image: '/products/pumpkin-mask.webp' },
  { id: 7, sku: 'MSK-0002', slug: 'msk-0002', nameKey: 'products.michaelMyersMask', price: 49.99, category: 'figurines', image: '/products/michael-myers-mask.jpeg' },
  { id: 8, sku: 'DEC-0001', slug: 'dec-0001', nameKey: 'products.bougeoirSquelette', price: 24.99, category: 'figurines', image: '/products/bougeoir-squelette.jpg' },
  { id: 9, sku: 'DEC-0002', slug: 'dec-0002', nameKey: 'products.bougieCercueil', price: 19.99, category: 'figurines', image: '/products/bougie-cercueil.jpg' },
  { id: 10, sku: 'DEC-0003', slug: 'dec-0003', nameKey: 'products.pumpkinDecoration', price: 15.99, category: 'figurines', image: '/products/pumpkin-decoration.jpg' },
  { id: 11, sku: 'ART-0001', slug: 'art-0001', nameKey: 'products.horrorScene', price: 129.99, category: 'figurines', image: '/products/horror-scene.jpg' },
  { id: 12, sku: 'JEU-0001', slug: 'jeu-0001', nameKey: 'products.horrorBoardGame1', price: 89.99, category: 'games', image: 'https://picsum.photos/800/1066?random=5' },
  { id: 13, sku: 'JEU-0002', slug: 'jeu-0002', nameKey: 'products.horrorBoardGame2', price: 124.50, category: 'games', image: 'https://picsum.photos/800/1066?random=6' },
  { id: 14, sku: 'JEU-0003', slug: 'jeu-0003', nameKey: 'products.horrorBoardGame3', price: 78.90, category: 'games', image: 'https://picsum.photos/800/1066?random=7' },
  { id: 15, sku: 'BLU-0001', slug: 'blu-0001', nameKey: 'products.classicHorrorBluray1', price: 29.99, category: 'bluray', image: 'https://picsum.photos/800/1066?random=8' },
  { id: 16, sku: 'BLU-0002', slug: 'blu-0002', nameKey: 'products.classicHorrorBluray2', price: 34.90, category: 'bluray', image: 'https://picsum.photos/800/1066?random=9' },
  { id: 17, sku: 'BLU-0003', slug: 'blu-0003', nameKey: 'products.classicHorrorBluray3', price: 39.99, category: 'bluray', image: 'https://picsum.photos/800/1066?random=10' },
  { id: 18, sku: 'BD-0001', slug: 'bd-0001', nameKey: 'products.horrorComic1', price: 18.50, category: 'comics', image: 'https://picsum.photos/800/1066?random=11' },
  { id: 19, sku: 'BD-0002', slug: 'bd-0002', nameKey: 'products.horrorComic2', price: 22.90, category: 'comics', image: 'https://picsum.photos/800/1066?random=12' }
];

export function findProductBySlug(slug: string) {
  return products.find(p => p.slug === slug);
}
