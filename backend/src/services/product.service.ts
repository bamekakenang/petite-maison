import { prisma } from '../config/database';
import { CreateProductDto, UpdateProductDto, ProductFilters, PaginationParams } from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import logger from '../config/logger';

export class ProductService {
  async create(data: CreateProductDto): Promise<any> {
    // Check if SKU already exists
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new ConflictError('Product SKU already exists');
    }

    const product = await prisma.product.create({
      data,
    });

    logger.info('Product created:', { productId: product.id, sku: product.sku });
    return product;
  }

  async findAll(filters: ProductFilters, pagination: PaginationParams): Promise<any> {
    const {page, limit, sortBy = 'createdAt', sortOrder = 'desc'} = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isActive: true };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    // Execute query
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    logger.debug('Products fetched:', { count: products.length, total });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async findBySku(sku: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto): Promise<any> {
    // Check if product exists
    await this.findById(id);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    logger.info('Product updated:', { productId: product.id, sku: product.sku });
    return product;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Product soft deleted:', { productId: id });
  }

  async updateStock(id: number, quantity: number): Promise<any> {
    const product = await this.findById(id);

    if (product.stock + quantity < 0) {
      throw new ValidationError('Insufficient stock');
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });

    // Check if stock is below minimum
    if (updated.stock < updated.minStock) {
      logger.warn('Stock below minimum threshold:', {
        productId: id,
        sku: updated.sku,
        stock: updated.stock,
        minStock: updated.minStock,
      });
    }

    return updated;
  }

  async getLowStockProducts(): Promise<any[]> {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: prisma.product.fields.minStock },
      },
      orderBy: { stock: 'asc' },
    });

    return products;
  }

  async getCategories(): Promise<string[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return products.map(p => p.category);
  }
}

export default new ProductService();
