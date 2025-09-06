import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Package } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { chapaService } from '@/lib/chapa';
import toast from 'react-hot-toast';

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending'>('pending');
  const [transactionData, setTransactionData] = useState<any>(null);

  const txRef = searchParams.get('tx_ref');

  useEffect(() => {
    if (txRef) {
      verifyPayment();
    } else {
      setIsVerifying(false);
      setVerificationStatus('failed');
    }
  }, [txRef]);

  const verifyPayment = async () => {
    if (!txRef) return;

    try {
      const response = await chapaService.verifyPayment(txRef);
      
      if (response.status === 'success' && response.data.status === 'successful') {
        setVerificationStatus('success');
        setTransactionData(response.data);
        toast.success('Payment verified successfully!');
      } else {
        setVerificationStatus('failed');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerificationStatus('failed');
      toast.error('Payment verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrders = () => {
    navigate('/client/orders');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Verifying Payment...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your payment with Chapa.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            We couldn't verify your payment. Please contact support if you believe this is an error.
          </p>
          <div className="space-y-3">
            <Button variant="primary" onClick={() => navigate('/client/checkout')}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Transaction Details */}
            {transactionData && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Transaction Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono">
                      {transactionData.tx_ref}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {transactionData.currency} {(transactionData.amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold capitalize">
                      {transactionData.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {new Date(transactionData.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                What's Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Order Confirmation
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You'll receive an email confirmation shortly
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Processing
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      We'll prepare your order for shipping
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Delivery
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Your order will be delivered within 3-5 business days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button variant="primary" size="lg" className="w-full" onClick={handleViewOrders}>
                View My Orders
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
            </div>

            {/* Support Info */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact our support team
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                support@habustore.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
