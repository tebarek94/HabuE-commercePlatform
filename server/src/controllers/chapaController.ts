import { Request, Response } from 'express';
import axios from 'axios';

interface ChapaPaymentRequest {
  amount: number;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  tx_ref: string;
  callback_url?: string;
  return_url?: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: {
    order_id?: string;
    customer_id?: string;
  };
}

interface ChapaPaymentResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
  };
}

interface ChapaVerifyResponse {
  status: string;
  message: string;
  data: {
    tx_ref: string;
    amount: number;
    currency: string;
    status: 'successful' | 'failed' | 'pending';
    created_at: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
    };
    meta?: any;
  };
}

class ChapaController {
  private baseUrl = 'https://api.chapa.co/v1';
  private publicKey: string;

  constructor() {
    // Get API key from environment variables
    this.publicKey = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx';
  }

  /**
   * Initialize payment with Chapa
   */
  async initializePayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentData: ChapaPaymentRequest = req.body;

      // Validate required fields
      if (!paymentData.amount || !paymentData.email || !paymentData.tx_ref) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: amount, email, tx_ref'
        });
        return;
      }

      const baseUrl = 'https://api.chapa.co/v1';
      const publicKey = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx';

      const response = await axios.post(`${baseUrl}/transaction/initialize`, paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicKey}`,
        },
      });

      res.json({
        success: true,
        data: response.data
      });
    } catch (error: any) {
      console.error('Chapa payment initialization error:', error);
      
      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data?.message || 'Payment initialization failed',
          error: error.response.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { txRef } = req.params;

      if (!txRef) {
        res.status(400).json({
          success: false,
          message: 'Transaction reference is required'
        });
        return;
      }

      const baseUrl = 'https://api.chapa.co/v1';
      const publicKey = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx';

      const response = await axios.get(`${baseUrl}/transaction/verify/${txRef}`, {
        headers: {
          'Authorization': `Bearer ${publicKey}`,
        },
      });

      res.json({
        success: true,
        data: response.data
      });
    } catch (error: any) {
      console.error('Chapa payment verification error:', error);
      
      if (error.response) {
        res.status(error.response.status).json({
          success: false,
          message: error.response.data?.message || 'Payment verification failed',
          error: error.response.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
        });
      }
    }
  }

  /**
   * Handle Chapa webhook callback
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData = req.body;
      
      console.log('Chapa webhook received:', webhookData);

      // Verify webhook signature if needed
      // Process the webhook data
      // Update order status in database
      
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error: any) {
      console.error('Chapa webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }

  /**
   * Generate unique transaction reference
   */
  generateTxRef(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `habu_${timestamp}_${random}`;
  }

  /**
   * Format amount for Chapa (multiply by 100 for cents)
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Check if Chapa is available
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const baseUrl = 'https://api.chapa.co/v1';
      const publicKey = process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx';

      const response = await axios.get(`${baseUrl}/banks`, {
        headers: {
          'Authorization': `Bearer ${publicKey}`,
        },
      });
      
      res.json({
        success: true,
        available: response.status === 200,
        message: 'Chapa service is available'
      });
    } catch (error: any) {
      console.error('Chapa availability check failed:', error);
      res.json({
        success: false,
        available: false,
        message: 'Chapa service is not available',
        error: error.message
      });
    }
  }
}

export default new ChapaController();
