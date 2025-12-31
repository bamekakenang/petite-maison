import { Router } from 'express';
import { body } from 'express-validator';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', authenticate, orderController.getOrders);
router.get('/stats', authenticate, orderController.getOrderStats);
router.get('/:id', authenticate, orderController.getOrderById);

router.post(
  '/',
  authenticate,
  validate([
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('shippingAddress').notEmpty().trim(),
    body('billingAddress').notEmpty().trim(),
  ]),
  orderController.createOrder
);

router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate([body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])]),
  orderController.updateOrderStatus
);

router.post('/:id/pay', authenticate, orderController.processPayment);

export default router;
