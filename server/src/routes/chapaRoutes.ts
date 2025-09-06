import { Router } from 'express';
import chapaController from '../controllers/chapaController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initialize payment (protected route)
router.post('/initialize', authenticate, chapaController.initializePayment);

// Verify payment (protected route)
router.get('/verify/:txRef', authenticate, chapaController.verifyPayment);

// Webhook callback (public route for Chapa)
router.post('/webhook', chapaController.handleWebhook);

// Check availability (public route)
router.get('/availability', chapaController.checkAvailability);

export default router;
