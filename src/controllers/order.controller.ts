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
