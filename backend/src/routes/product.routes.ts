import { Router } from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/product.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', authenticate, authorize('ADMIN', 'MANAGER'), productController.getLowStock);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  validate([
    body('sku').notEmpty().trim(),
    body('name').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('stock').isInt({ min: 0 }),
    body('category').notEmpty().trim(),
  ]),
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  productController.updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  productController.deleteProduct
);

export default router;
