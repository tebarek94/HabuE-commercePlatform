// Chapa Payment Integration
// Based on Chapa API documentation: https://developer.chapa.co/

import { getAuthToken } from '@/lib/authUtils';

export interface ChapaPaymentRequest {
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

export interface ChapaPaymentResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaVerifyResponse {
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

class ChapaService {
  private baseUrl = '/api/chapa'; // Use backend API instead of direct Chapa API

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return getAuthToken();
  }

  /**
   * Initialize payment with Chapa through backend
   */
  async initializePayment(paymentData: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${this.baseUrl}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment initialization failed');
      }

      const result = await response.json();
      return result.data; // Backend returns data in result.data
    } catch (error) {
      console.error('Chapa payment initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify payment status through backend
   */
  async verifyPayment(txRef: string): Promise<ChapaVerifyResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${this.baseUrl}/verify/${txRef}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const result = await response.json();
      return result.data; // Backend returns data in result.data
    } catch (error) {
      console.error('Chapa payment verification error:', error);
      throw error;
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
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return ['ETB', 'USD'];
  }

  /**
   * Check if Chapa is available through backend
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/availability`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.success && result.available;
    } catch (error) {
      console.error('Chapa availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chapaService = new ChapaService();
