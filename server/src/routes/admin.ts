import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { DashboardController } from '../controllers/dashboardController';
import { CategoryController } from '../controllers/categoryController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', DashboardController.getDashboardStats);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/categories', CategoryController.getCategories);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/categories', CategoryController.createCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
router.put('/categories/:id', CategoryController.updateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
router.delete('/categories/:id', CategoryController.deleteCategory);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders with filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders to date
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/orders', (req, res) => {
  res.json({ message: 'Get all orders - TODO: Implement' });
});

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/analytics', DashboardController.getAnalytics);

/**
 * @swagger
 * /api/admin/dashboard/recent-orders:
 *   get:
 *     summary: Get recent orders for dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of recent orders to return
 *     responses:
 *       200:
 *         description: Recent orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/recent-orders', DashboardController.getRecentOrders);

/**
 * @swagger
 * /api/admin/dashboard/top-products:
 *   get:
 *     summary: Get top products for dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of top products to return
 *     responses:
 *       200:
 *         description: Top products retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/top-products', DashboardController.getTopProducts);

/**
 * @swagger
 * /api/admin/dashboard/category-performance:
 *   get:
 *     summary: Get category performance for dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category performance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/category-performance', DashboardController.getCategoryPerformance);

/**
 * @swagger
 * /api/admin/dashboard/recent-activity:
 *   get:
 *     summary: Get recent activity for dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of recent activities to return
 *     responses:
 *       200:
 *         description: Recent activity retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard/recent-activity', DashboardController.getRecentActivity);

export default router;
