import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { AdminDashboardController } from '../controllers/adminDashboardController';
import { AdminProductController } from '../controllers/adminProductController';
import { AdminOrderController } from '../controllers/adminOrderController';
import { AdminCategoryController } from '../controllers/adminCategoryController';
import { AdminManagementController } from '../controllers/adminManagementController';
import { validateIdParam, validateProductCreation, validateProductUpdate, validateOrderStatusUpdate, validatePaginationQuery } from '../middleware/validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// ==================== ADMIN DASHBOARD ====================
router.get('/dashboard', AdminDashboardController.getDashboardStats);
router.get('/dashboard/recent-orders', AdminDashboardController.getRecentOrders);
router.get('/dashboard/top-products', AdminDashboardController.getTopProducts);
router.get('/dashboard/category-performance', AdminDashboardController.getCategoryPerformance);
router.get('/dashboard/recent-activity', AdminDashboardController.getRecentActivity);
router.get('/analytics', AdminDashboardController.getAnalytics);

// ==================== ADMIN CATEGORY MANAGEMENT ====================
router.get('/categories', AdminCategoryController.getCategories);
router.post('/categories', AdminCategoryController.createCategory);
router.put('/categories/:id', validateIdParam, AdminCategoryController.updateCategory);
router.delete('/categories/:id', validateIdParam, AdminCategoryController.deleteCategory);

// ==================== ADMIN PRODUCT MANAGEMENT ====================
router.get('/products', validatePaginationQuery, AdminProductController.getProducts);
router.get('/products/:id', validateIdParam, AdminProductController.getProductById);
router.post('/products', validateProductCreation, AdminProductController.createProduct);
router.post('/products/with-image', AdminProductController.createProductWithImage);
router.put('/products/:id', validateIdParam, validateProductUpdate, AdminProductController.updateProduct);
router.put('/products/:id/with-image', validateIdParam, AdminProductController.updateProductWithImage);
router.delete('/products/:id', validateIdParam, AdminProductController.deleteProduct);
router.patch('/products/:id/stock', validateIdParam, AdminProductController.updateStock);

// ==================== ADMIN ORDER MANAGEMENT ====================
router.get('/orders', AdminOrderController.getAllOrders);
router.get('/orders/:id', validateIdParam, AdminOrderController.getOrderById);
router.patch('/orders/:id/status', validateIdParam, validateOrderStatusUpdate, AdminOrderController.updateOrderStatus);
router.patch('/orders/:id/payment-status', validateIdParam, AdminOrderController.updatePaymentStatus);
router.get('/orders/stats', AdminOrderController.getOrderStats);
router.get('/orders/:id/history', validateIdParam, AdminOrderController.getOrderHistory);
router.get('/orders/analytics', AdminOrderController.getOrderAnalytics);

// ==================== ADMIN USER MANAGEMENT ====================
router.get('/users', AdminManagementController.getAllAdmins);
router.post('/users', AdminManagementController.createAdmin);

export default router;
