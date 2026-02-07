import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@petitemaison.fr' },
    update: {},
    create: {
      email: 'admin@petitemaison.fr',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Petite Maison',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'client@example.fr' },
    update: {},
    create: {
      email: 'client@example.fr',
      passwordHash,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'CUSTOMER',
    },
  });

  console.log('✅ Users created:', { admin: admin.email, customer: customer.email });

  // Create products for Fonctionnalité 1
  const products = [
    {
      sku: 'LAMP-001',
      name: 'Lampe de Bureau Design',
      description: 'Lampe élégante en métal brossé avec LED intégrée',
      price: 89.99,
      stock: 50,
      category: 'Éclairage',
      imageUrl: '/products/candle.svg',
      minStock: 10,
    },
    {
      sku: 'CHAIR-001',
      name: 'Chaise Scandinave',
      description: 'Chaise confortable en bois et tissu',
      price: 149.99,
      stock: 30,
      category: 'Mobilier',
      imageUrl: '/products/house.svg',
      minStock: 5,
    },
    {
      sku: 'TABLE-001',
      name: 'Table Basse Moderne',
      description: 'Table en chêne massif avec finition naturelle',
      price: 299.99,
      stock: 15,
      category: 'Mobilier',
      imageUrl: '/products/skull.svg',
      minStock: 3,
    },
    {
      sku: 'VASE-001',
      name: 'Vase Céramique Artisanal',
      description: 'Vase fait main en céramique émaillée',
      price: 45.50,
      stock: 100,
      category: 'Décoration',
      imageUrl: '/products/bat.svg',
      minStock: 20,
    },
    {
      sku: 'CUSHION-001',
      name: 'Coussin Velours Bleu',
      description: 'Coussin décoratif en velours premium',
      price: 29.99,
      stock: 75,
      category: 'Décoration',
      imageUrl: '/products/eye.svg',
      minStock: 15,
    },
    {
      sku: 'MIRROR-001',
      name: 'Miroir Rond Doré',
      description: 'Miroir mural avec cadre doré 60cm',
      price: 129.99,
      stock: 25,
      category: 'Décoration',
      imageUrl: '/products/knife.svg',
      minStock: 5,
    },
    {
      sku: 'RUG-001',
      name: 'Tapis Berbère 200x300',
      description: 'Tapis traditionnel fait main',
      price: 399.99,
      stock: 8,
      category: 'Textile',
      imageUrl: '/products/candle.svg',
      minStock: 2,
    },
    {
      sku: 'LAMP-002',
      name: 'Lampadaire Tripode',
      description: 'Lampadaire moderne en bois et tissu',
      price: 189.99,
      stock: 20,
      category: 'Éclairage',
      imageUrl: '/products/skull.svg',
      minStock: 5,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  console.log(`✅ ${products.length} products created`);

  // Create a sample cart for customer
  const cart = await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
    },
  });

  // Add items to cart
  const [lamp, chair] = await prisma.product.findMany({
    where: { sku: { in: ['LAMP-001', 'CHAIR-001'] } },
  });

  if (lamp && chair) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: lamp.id } },
      update: { quantity: 2 },
      create: { cartId: cart.id, productId: lamp.id, quantity: 2 },
    });

    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId: chair.id } },
      update: { quantity: 1 },
      create: { cartId: cart.id, productId: chair.id, quantity: 1 },
    });

    console.log('✅ Sample cart created with items');
  }

  // Create a sample order for Fonctionnalité 2
  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: customer.id,
      status: 'CONFIRMED',
      totalAmount: 269.98,
      shippingAddress: '123 Rue de la Paix, 75001 Paris',
      billingAddress: '123 Rue de la Paix, 75001 Paris',
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      items: {
        create: [
          {
            productId: lamp.id,
            quantity: 2,
            unitPrice: lamp.price,
            totalPrice: lamp.price * 2,
          },
          {
            productId: chair.id,
            quantity: 1,
            unitPrice: chair.price,
            totalPrice: chair.price,
          },
        ],
      },
    },
  });

  console.log('✅ Sample order created:', order.orderNumber);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
