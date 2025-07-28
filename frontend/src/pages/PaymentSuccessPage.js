import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const PaymentSuccessPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    } else {
      setError('No payment session found');
      setLoading(false);
    }
  }, [user, navigate, searchParams]);

  const checkPaymentStatus = async (sessionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/status/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
      } else {
        setError('Failed to retrieve payment status');
      }
    } catch (error) {
      setError('Error checking payment status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isPaymentSuccessful = paymentStatus?.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className={`${isPaymentSuccessful ? 'bg-green-100' : 'bg-red-100'} rounded-full p-3 w-16 h-16 mx-auto mb-4`}>
          {isPaymentSuccessful ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Failed'}
        </h1>

        {isPaymentSuccessful ? (
          <div>
            <p className="text-gray-600 mb-4">
              Thank you for your purchase! Your order has been confirmed.
            </p>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Amount:</strong> ${paymentStatus?.amount?.toFixed(2) || 'N/A'}</p>
                <p><strong>Currency:</strong> {paymentStatus?.currency?.toUpperCase() || 'USD'}</p>
                <p><strong>Status:</strong> {paymentStatus?.payment_status || 'Unknown'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Unfortunately, your payment could not be processed. Please try again.
            </p>
            
            <div className="bg-white rounded-lg shadow p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Status:</strong> {paymentStatus?.payment_status || 'Failed'}</p>
                <p><strong>Session Status:</strong> {paymentStatus?.session_status || 'Unknown'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;