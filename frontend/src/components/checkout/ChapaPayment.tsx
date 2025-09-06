import React, { useState } from 'react';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { chapaService, ChapaPaymentRequest } from '@/lib/chapa';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ChapaPaymentProps {
  amount: number;
  currency: string;
  customerInfo: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  orderId?: string;
  onSuccess: (txRef: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const ChapaPayment: React.FC<ChapaPaymentProps> = ({
  amount,
  currency,
  customerInfo,
  orderId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Generate unique transaction reference
      const txRef = chapaService.generateTxRef();
      
      // Prepare payment data
      const paymentData: ChapaPaymentRequest = {
        amount: chapaService.formatAmount(amount),
        currency: currency,
        email: customerInfo.email,
        first_name: customerInfo.first_name,
        last_name: customerInfo.last_name,
        phone_number: customerInfo.phone_number,
        tx_ref: txRef,
        callback_url: `${window.location.origin}/api/chapa/callback`,
        return_url: `${window.location.origin}/checkout/success?tx_ref=${txRef}`,
        customization: {
          title: 'Habu Store',
          description: 'Flower Store Payment',
          logo: `${window.location.origin}/logo.png`,
        },
        meta: {
          order_id: orderId,
          customer_email: customerInfo.email,
        },
      };

      // Initialize payment
      const response = await chapaService.initializePayment(paymentData);
      
      if (response.status === 'success' && response.data.checkout_url) {
        // Redirect to Chapa checkout
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.message || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Chapa payment error:', error);
      const errorMessage = error.message || 'Payment initialization failed';
      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPayment = async (txRef: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await chapaService.verifyPayment(txRef);
      
      if (response.status === 'success' && response.data.status === 'successful') {
        onSuccess(txRef);
        toast.success('Payment verified successfully!');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      const errorMessage = error.message || 'Payment verification failed';
      setError(errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Secure Payment with Chapa
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Pay securely using Chapa's payment gateway
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(amount)} {currency}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Customer:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {customerInfo.first_name} {customerInfo.last_name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email:</span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {customerInfo.email}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Security Features */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              SSL Encrypted Payment
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              PCI DSS Compliant
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Multiple Payment Methods
            </span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing || isVerifying}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay with Chapa
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onCancel}
            disabled={isProcessing || isVerifying}
          >
            Cancel Payment
          </Button>
        </div>

        {/* Payment Methods Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Supported: Mobile Money, Bank Transfer, Credit/Debit Cards
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapaPayment;
