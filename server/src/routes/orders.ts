import { Router } from 'express';
import { authenticate, requireClient, requireAdmin } from '../middleware/auth';
import { validateIdParam, validateOrderCreation, validateOrderStatusUpdate } from '../middleware/validation';
import { OrderController } from '../controllers/orderController';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's orders (Client) or all orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, OrderController.getOrders as any);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, validateIdParam, OrderController.getOrderById as any);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order (Client only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shipping_address
 *             properties:
 *               shipping_address:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               payment_method:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, cash_on_delivery]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Client access required
 */
router.post('/', authenticate, requireClient, validateOrderCreation, OrderController.createOrder as any);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', authenticate, requireAdmin, validateIdParam, validateOrderStatusUpdate, OrderController.updateOrderStatus as any);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel order (Client only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Client access required
 *       404:
 *         description: Order not found
 */
router.patch('/:id/cancel', authenticate, requireClient, validateIdParam, (req: any, res: any) => {
  res.json({ message: 'Cancel order - TODO: Implement' });
});

export default router;
