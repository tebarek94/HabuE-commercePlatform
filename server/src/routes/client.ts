import { Router } from 'express';
import { ClientProductController } from '../controllers/clientProductController';
import { ClientOrderController } from '../controllers/clientOrderController';
import { authenticate, requireClient } from '../middleware/auth';
import { 
  validateIdParam, 
  validateOrderCreation, 
  validatePaginationQuery,
  validateProductFilters 
} from '../middleware/validation';

const router = Router();
router.get('/products', validatePaginationQuery, validateProductFilters, ClientProductController.getProducts);
router.get('/products/featured', ClientProductController.getFeaturedProducts);
router.get('/products/search', ClientProductController.searchProducts);
router.get('/products/category/:categoryId', validateIdParam, ClientProductController.getProductsByCategory);
router.get('/products/:id', validateIdParam, ClientProductController.getProductById);
router.get('/orders', authenticate, requireClient, ClientOrderController.getUserOrders);
router.get('/orders/:id', authenticate, requireClient, validateIdParam, ClientOrderController.getOrderById);
router.post('/orders', authenticate, requireClient, validateOrderCreation, ClientOrderController.createOrder);
router.patch('/orders/:id/cancel', authenticate, requireClient, validateIdParam, ClientOrderController.cancelOrder);

export default router;
