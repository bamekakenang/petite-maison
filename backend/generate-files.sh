#!/bin/bash

# Script pour générer les fichiers restants du backend

# Controllers
mkdir -p src/controllers

# Auth Controller
cat > src/controllers/auth.controller.ts << 'EOF'
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import authService from '../services/auth.service';

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
EOF

# Product Controller
cat > src/controllers/product.controller.ts << 'EOF'
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import productService from '../services/product.service';

export const getProducts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      inStock: req.query.inStock === 'true',
      search: req.query.search as string,
    };
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    const result = await productService.findAll(filters, pagination);
    res.json({ success: true, data: result.products, meta: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.findById(parseInt(req.params.id));
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const product = await productService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await productService.delete(parseInt(req.params.id));
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getLowStockProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await productService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
EOF

# Order Controller
cat > src/controllers/order.controller.ts << 'EOF'
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import orderService from '../services/order.service';

export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.role === 'CUSTOMER' ? req.user.id : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await orderService.findAll(userId, page, limit);
    res.json({ success: true, data: result.orders, meta: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.role === 'CUSTOMER' ? req.user.id : undefined;
    const order = await orderService.findById(parseInt(req.params.id), userId);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateStatus(parseInt(req.params.id), req.body);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.processPayment(parseInt(req.params.id));
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrderStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.role === 'CUSTOMER' ? req.user.id : undefined;
    const stats = await orderService.getOrderStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
EOF

echo "✅ Controllers created"
