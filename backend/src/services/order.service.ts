import { prisma } from '../config/database';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';
import productService from './product.service';
import logger from '../config/logger';

export class OrderService {
  async create(userId: number, data: CreateOrderDto): Promise<any> {
    // Validate and check stock
    for (const item of data.items) {
      const product = await productService.findById(item.productId);
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for product: ${product.name}`);
      }
    }

    // Calculate total and create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Get product prices
      const items = await Promise.all(
        data.items.map(async (item) => {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product!.price,
            totalPrice: product!.price * item.quantity,
          };
        })
      );

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${userId}`,
          userId,
          status: 'PENDING',
          totalAmount,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          paymentMethod: data.paymentMethod || 'CARD',
          notes: data.notes,
          items: {
            create: items,
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });

      // Decrease stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    logger.info('Order created:', { orderId: order.id, orderNumber: order.orderNumber });
    return order;
  }

  async findAll(userId?: number, page = 1, limit = 10): Promise<any> {
    const where = userId ? { userId } : {};
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number, userId?: number): Promise<any> {
    const where: any = { id };
    if (userId) where.userId = userId;

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<any> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, data: UpdateOrderStatusDto): Promise<any> {
    const order = await this.findById(id);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status].includes(data.status)) {
      throw new ValidationError(`Cannot transition from ${order.status} to ${data.status}`);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        items: { include: { product: true } },
      },
    });

    logger.info('Order status updated:', {
      orderId: id,
      oldStatus: order.status,
      newStatus: data.status,
    });

    // If cancelled, return stock
    if (data.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.returnStock(id);
    }

    return updated;
  }

  async processPayment(id: number): Promise<any> {
    const order = await this.findById(id);

    if (order.paymentStatus === 'PAID') {
      throw new ValidationError('Order already paid');
    }

    // Simulate payment processing
    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
      },
    });

    logger.info('Payment processed:', { orderId: id, amount: order.totalAmount });
    return updated;
  }

  private async returnStock(orderId: number): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;

    await prisma.$transaction(
      order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      )
    );

    logger.info('Stock returned for cancelled order:', { orderId });
  }

  async getOrderStats(userId?: number): Promise<any> {
    const where = userId ? { userId } : {};

    const [total, pending, confirmed, processing, shipped, delivered, cancelled] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.count({ where: { ...where, status: 'PENDING' } }),
        prisma.order.count({ where: { ...where, status: 'CONFIRMED' } }),
        prisma.order.count({ where: { ...where, status: 'PROCESSING' } }),
        prisma.order.count({ where: { ...where, status: 'SHIPPED' } }),
        prisma.order.count({ where: { ...where, status: 'DELIVERED' } }),
        prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
      ]);

    const totalRevenue = await prisma.order.aggregate({
      where: { ...where, paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    });

    return {
      total,
      byStatus: { pending, confirmed, processing, shipped, delivered, cancelled },
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}

export default new OrderService();
