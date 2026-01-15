import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../../app';
import { prisma } from '../../config/database';
import { generateTokens } from '../../utils/jwt';

describe('Product Controller Integration Tests', () => {
  let adminToken: string;
  let customerToken: string;

  beforeEach(async () => {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: 'hashed',
        role: 'ADMIN',
      },
    });

    const customerUser = await prisma.user.create({
      data: {
        email: 'customer@test.com',
        passwordHash: 'hashed',
        role: 'CUSTOMER',
      },
    });

    adminToken = generateTokens({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    }).accessToken;

    customerToken = generateTokens({
      userId: customerUser.id,
      email: customerUser.email,
      role: customerUser.role,
    }).accessToken;
  });

  describe('POST /api/v1/products', () => {
    it('should create product with JSON (no image)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'TEST-001',
          name: 'Test Product',
          description: 'Test description',
          price: 19.99,
          stock: 10,
          category: 'Test',
          minStock: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('TEST-001');
      // Prisma returns null for optional fields not provided
      expect(res.body.data.imageUrl).toBeNull();
    });

    it('should create product with multipart/form-data image upload', async () => {
      const testImagePath = path.join(__dirname, '..', '..', 'tests', 'fixtures', 'test-image.jpg');
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });

      const buffer = Buffer.from('fake-image-content');
      fs.writeFileSync(testImagePath, buffer);

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('sku', 'TEST-002')
        .field('name', 'Product with Image')
        .field('price', '29.99')
        .field('stock', '5')
        .field('category', 'Test')
        .attach('image', testImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe('TEST-002');
      expect(res.body.data.imageUrl).toMatch(/^\/uploads\/products\/.+\.jpg$/);

      // Ensure the file is actually written to disk
      const filename = String(res.body.data.imageUrl).split('/').pop();
      const uploadDir = process.env.UPLOAD_DIR;
      expect(uploadDir).toBeTruthy();
      if (uploadDir && filename) {
        expect(fs.existsSync(path.join(uploadDir, 'products', filename))).toBe(true);
      }

      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    });

    it('should reject image upload with invalid mime type', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('sku', 'TEST-002-BAD')
        .field('name', 'Bad Image')
        .field('price', '10')
        .field('stock', '1')
        .field('category', 'Test')
        .attach('image', Buffer.from('not-an-image'), {
          filename: 'bad.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
      expect(String(res.body.error || res.body.message || '')).toMatch(/invalid file type/i);
    });

    it('should reject image upload when file is too large', async () => {
      // UPLOAD_MAX_FILE_SIZE_MB is set to 1 in test setup
      const tooLarge = Buffer.alloc(1 * 1024 * 1024 + 10, 0);

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('sku', 'TEST-002-LARGE')
        .field('name', 'Large Image')
        .field('price', '10')
        .field('stock', '1')
        .field('category', 'Test')
        .attach('image', tooLarge, {
          filename: 'large.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(400);
      expect(String(res.body.error || res.body.message || '')).toMatch(/file too large/i);
    });

    it('should reject product creation without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          sku: 'TEST-003',
          name: 'Unauthorized',
          price: 10,
          stock: 1,
          category: 'Test',
        });

      expect(res.status).toBe(401);
    });

    it('should allow product creation with CUSTOMER role (marketplace mode)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sku: 'TEST-004',
          name: 'Customer Product',
          price: 10,
          stock: 1,
          category: 'Test',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject product creation with missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'TEST-005',
          // missing name, price, stock, category
        });

      expect(res.status).toBe(400);
    });

    it('should reject product creation with duplicate SKU', async () => {
      await prisma.product.create({
        data: {
          sku: 'DUPLICATE-SKU',
          name: 'Existing',
          price: 10,
          stock: 10,
          category: 'Test',
        },
      });

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          sku: 'DUPLICATE-SKU',
          name: 'Duplicate Attempt',
          price: 20,
          stock: 5,
          category: 'Test',
        });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      await prisma.product.createMany({
        data: [
          { sku: 'PROD-1', name: 'Product 1', price: 10, stock: 5, category: 'Cat1' },
          { sku: 'PROD-2', name: 'Product 2', price: 20, stock: 15, category: 'Cat2' },
          { sku: 'PROD-3', name: 'Product 3', price: 30, stock: 0, category: 'Cat1' },
        ],
      });
    });

    it('should list products with pagination', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/v1/products?category=Cat1');

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(2);
    });

    it('should filter products by stock (inStock=true)', async () => {
      const res = await request(app).get('/api/v1/products?inStock=true');

      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBe(2);
    });

    it('should search products by name', async () => {
      const res = await request(app).get('/api/v1/products?search=Product+2');

      expect(res.status).toBe(200);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].name).toContain('Product 2');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get product by ID', async () => {
      const product = await prisma.product.create({
        data: { sku: 'GET-1', name: 'Get Test', price: 15, stock: 10, category: 'Test' },
      });

      const res = await request(app).get(`/api/v1/products/${product.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(product.id);
    });

    it('should return 404 for non-existing product', async () => {
      const res = await request(app).get('/api/v1/products/99999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update product (ADMIN)', async () => {
      const product = await prisma.product.create({
        data: { sku: 'UPD-1', name: 'Update Test', price: 10, stock: 10, category: 'Test' },
      });

      const res = await request(app)
        .put(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 25.99 });

      expect(res.status).toBe(200);
      expect(res.body.data.price).toBe(25.99);
    });

    it('should reject update without ADMIN role (403)', async () => {
      const product = await prisma.product.create({
        data: { sku: 'UPD-2', name: 'Update Test', price: 10, stock: 10, category: 'Test' },
      });

      const res = await request(app)
        .put(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ price: 30 });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should soft delete product (ADMIN)', async () => {
      const product = await prisma.product.create({
        data: { sku: 'DEL-1', name: 'Delete Test', price: 10, stock: 10, category: 'Test' },
      });

      const res = await request(app)
        .delete(`/api/v1/products/${product.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await prisma.product.findUnique({ where: { id: product.id } });
      expect(deleted?.isActive).toBe(false);
    });
  });

  describe('GET /api/v1/products/categories', () => {
    it('should list unique categories', async () => {
      await prisma.product.createMany({
        data: [
          { sku: 'CAT-1', name: 'P1', price: 10, stock: 5, category: 'Books' },
          { sku: 'CAT-2', name: 'P2', price: 10, stock: 5, category: 'Books' },
          { sku: 'CAT-3', name: 'P3', price: 10, stock: 5, category: 'Games' },
        ],
      });

      const res = await request(app).get('/api/v1/products/categories');

      expect(res.status).toBe(200);
      expect(res.body.data).toContain('Books');
      expect(res.body.data).toContain('Games');
    });
  });
});
