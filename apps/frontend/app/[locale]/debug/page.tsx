import { getTranslations } from 'next-intl/server';

// Mêmes données que la page produits
const products = [
  { id: 1, sku: 'FIG-0001', nameKey: 'products.horrificFigurine1', price: 45.99, category: 'figurines', image: 'https://picsum.photos/800/1066?random=1' },
  { id: 2, sku: 'FIG-0002', nameKey: 'products.horrificFigurine2', price: 52.90, category: 'figurines', image: 'https://picsum.photos/800/1066?random=2' },
  { id: 3, sku: 'FIG-0003', nameKey: 'products.horrificFigurine3', price: 38.50, category: 'figurines', image: 'https://picsum.photos/800/1066?random=3' },
  { id: 4, sku: 'FIG-0004', nameKey: 'products.horrificFigurine4', price: 67.20, category: 'figurines', image: 'https://picsum.photos/800/1066?random=4' },
  { id: 5, sku: 'FIG-0005', nameKey: 'products.monsterCreature', price: 89.99, category: 'figurines', image: '/products/monster-creature.webp' },
  { id: 6, sku: 'MSK-0001', nameKey: 'products.pumpkinMask', price: 35.99, category: 'figurines', image: '/products/pumpkin-mask.webp' },
  { id: 7, sku: 'MSK-0002', nameKey: 'products.michaelMyersMask', price: 49.99, category: 'figurines', image: '/products/michael-myers-mask.jpeg' },
  { id: 8, sku: 'DEC-0001', nameKey: 'products.bougeoirSquelette', price: 24.99, category: 'figurines', image: '/products/bougeoir-squelette.jpg' },
  { id: 9, sku: 'DEC-0002', nameKey: 'products.bougieCercueil', price: 19.99, category: 'figurines', image: '/products/bougie-cercueil.jpg' },
  { id: 10, sku: 'DEC-0003', nameKey: 'products.pumpkinDecoration', price: 15.99, category: 'figurines', image: '/products/pumpkin-decoration.jpg' },
  { id: 11, sku: 'ART-0001', nameKey: 'products.horrorScene', price: 129.99, category: 'figurines', image: '/products/horror-scene.jpg' },
  { id: 12, sku: 'JEU-0001', nameKey: 'products.horrorBoardGame1', price: 89.99, category: 'games', image: 'https://picsum.photos/800/1066?random=5' },
  { id: 13, sku: 'JEU-0002', nameKey: 'products.horrorBoardGame2', price: 124.50, category: 'games', image: 'https://picsum.photos/800/1066?random=6' },
  { id: 14, sku: 'JEU-0003', nameKey: 'products.horrorBoardGame3', price: 78.90, category: 'games', image: 'https://picsum.photos/800/1066?random=7' },
  { id: 15, sku: 'BLU-0001', nameKey: 'products.classicHorrorBluray1', price: 29.99, category: 'bluray', image: 'https://picsum.photos/800/1066?random=8' },
  { id: 16, sku: 'BLU-0002', nameKey: 'products.classicHorrorBluray2', price: 34.90, category: 'bluray', image: 'https://picsum.photos/800/1066?random=9' },
  { id: 17, sku: 'BLU-0003', nameKey: 'products.classicHorrorBluray3', price: 39.99, category: 'bluray', image: 'https://picsum.photos/800/1066?random=10' },
  { id: 18, sku: 'BD-0001', nameKey: 'products.horrorComic1', price: 18.50, category: 'comics', image: 'https://picsum.photos/800/1066?random=11' },
  { id: 19, sku: 'BD-0002', nameKey: 'products.horrorComic2', price: 22.90, category: 'comics', image: 'https://picsum.photos/800/1066?random=12' }
];

export default async function DebugPage() {
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug - Nombre de produits</h1>
      
      <div className="mb-8 p-4 bg-yellow-100 rounded-lg">
        <h2 className="text-xl font-bold">Statistiques:</h2>
        <p>Nombre total de produits: <strong>{products.length}</strong></p>
        <p>Figurines: <strong>{products.filter(p => p.category === 'figurines').length}</strong></p>
        <p>Jeux: <strong>{products.filter(p => p.category === 'games').length}</strong></p>
        <p>Blu-ray: <strong>{products.filter(p => p.category === 'bluray').length}</strong></p>
        <p>Comics: <strong>{products.filter(p => p.category === 'comics').length}</strong></p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-2xl font-bold">Liste complète des produits:</h2>
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded">
            <div className="font-bold">{product.id}. {t(product.nameKey)} - {product.sku}</div>
            <div>Prix: €{product.price}</div>
            <div>Catégorie: {product.category}</div>
            <div>Image: <code>{product.image}</code></div>
          </div>
        ))}
      </div>
    </main>
  );
}