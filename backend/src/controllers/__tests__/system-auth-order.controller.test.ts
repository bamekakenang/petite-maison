import request from 'supertest';
import app from '../../app';
import { prisma } from '../../config/database';
import { generateTokens } from '../../utils/jwt';

describe('System/Auth/Order Integration Tests', () => {
  describe('System endpoints', () => {
    it('GET /api/v1/health should return healthy', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('GET /api/v1/metrics should return metrics payload', async () => {
      const res = await request(app).get('/api/v1/metrics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalRequests');
      expect(res.body.data).toHaveProperty('system');
    });

    it('Unknown route should return 404', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(String(res.body.error)).toMatch(/not found/i);
    });
  });

  describe('Auth flow (register/login/refresh/logout)', () => {
    const email = 'user@test.com';
    const password = 'password123';

    it('should register, login, refresh, and logout', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
      });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.data.user.email).toBe(email.toLowerCase());
      expect(registerRes.body.data.tokens.accessToken).toBeTruthy();
      expect(registerRes.body.data.tokens.refreshToken).toBeTruthy();

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email,
        password,
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.tokens.accessToken).toBeTruthy();
      expect(loginRes.body.data.tokens.refreshToken).toBeTruthy();

      const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: loginRes.body.data.tokens.refreshToken,
      });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.accessToken).toBeTruthy();
      expect(refreshRes.body.data.refreshToken).toBeTruthy();

      const logoutRes = await request(app).post('/api/v1/auth/logout').send({
        refreshToken: refreshRes.body.data.refreshToken,
      });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
    });

    it('should reject invalid login', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nope@test.com',
        password: 'wrongpass',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken: 'not-a-real-token',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Orders lifecycle', () => {
    async function createUserAndToken(role: string) {
      const user = await prisma.user.create({
        data: {
          email: `${role.toLowerCase()}@test.com`,
          passwordHash: 'hashed',
          role,
        },
      });

      const token = generateTokens({ userId: user.id, email: user.email, role: user.role }).accessToken;
      return { user, token };
    }

    it('should create order, pay, update status, cancel (return stock), and report stats', async () => {
      const { token: userToken } = await createUserAndToken('USER');
      const { token: adminToken } = await createUserAndToken('ADMIN');

      const product = await prisma.product.create({
        data: {
          sku: 'ORD-PROD-1',
          name: 'Order Product',
          price: 50,
          stock: 10,
          category: 'Test',
          minStock: 2,
        },
      });

      // Create order
      const createRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: '123 Test Street',
          billingAddress: '123 Test Street',
          paymentMethod: 'CARD',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.items).toHaveLength(1);

      const orderId = createRes.body.data.id;

      // Stock should be decreased
      const afterCreateProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(afterCreateProduct?.stock).toBe(8);

      // Process payment
      const payRes = await request(app)
        .post(`/api/v1/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(payRes.status).toBe(200);
      expect(payRes.body.success).toBe(true);
      expect(payRes.body.data.paymentStatus).toBe('PAID');
      expect(payRes.body.data.status).toBe('CONFIRMED');

      // Valid status update (CONFIRMED -> PROCESSING) requires ADMIN/MANAGER
      const statusRes = await request(app)
        .put(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PROCESSING' });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('PROCESSING');

      // Cancel (PROCESSING -> CANCELLED) should return stock
      const cancelRes = await request(app)
        .put(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CANCELLED' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');

      const afterCancelProduct = await prisma.product.findUnique({ where: { id: product.id } });
      expect(afterCancelProduct?.stock).toBe(10);

      // Orders list should be filtered for role USER
      const listRes = await request(app)
        .get('/api/v1/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data.orders)).toBe(true);

      // Stats (filtered for role USER)
      const statsRes = await request(app)
        .get('/api/v1/orders/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.success).toBe(true);
      expect(statsRes.body.data.total).toBe(1);
      expect(statsRes.body.data.byStatus.cancelled).toBe(1);
    });

    it('should reject invalid status transition', async () => {
      const { token: userToken } = await createUserAndToken('USER');
      const { token: adminToken } = await createUserAndToken('ADMIN');

      const product = await prisma.product.create({
        data: {
          sku: 'ORD-PROD-2',
          name: 'Order Product 2',
          price: 10,
          stock: 5,
          category: 'Test',
        },
      });

      const createRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: product.id, quantity: 1 }],
          shippingAddress: '123 Test Street',
          billingAddress: '123 Test Street',
        });

      const orderId = createRes.body.data.id;

      // Invalid transition: PENDING -> DELIVERED
      const res = await request(app)
        .put(`/api/v1/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(String(res.body.error)).toMatch(/cannot transition/i);
    });

    it('should reject order creation when stock is insufficient', async () => {
      const { token: userToken } = await createUserAndToken('USER');

      const product = await prisma.product.create({
        data: {
          sku: 'ORD-PROD-3',
          name: 'Order Product 3',
          price: 10,
          stock: 1,
          category: 'Test',
        },
      });

      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: product.id, quantity: 5 }],
          shippingAddress: '123 Test Street',
          billingAddress: '123 Test Street',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(String(res.body.error)).toMatch(/insufficient stock/i);
    });

    it('should return 404 for missing order', async () => {
      const { token } = await createUserAndToken('ADMIN');
      const res = await request(app)
        .get('/api/v1/orders/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
