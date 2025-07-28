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
    <div className="min-h-screen bg-gray-50">
      {/* Independence Day Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '1rem 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '3px solid #ffd700'
      }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🇱🇷 {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Status'} 🇺🇸
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            opacity: '0.9',
            marginTop: '0.5rem'
          }}>
            {isPaymentSuccessful ? '🎉 Your Independence Day Purchase is Complete! 🎉' : 'Payment Processing Update'}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8" style={{ border: '2px solid #ffd700' }}>
            <div className="text-center">
              <div className={`${isPaymentSuccessful ? 'bg-green-100' : 'bg-red-100'} rounded-full p-4 w-20 h-20 mx-auto mb-6`}>
                {isPaymentSuccessful ? (
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isPaymentSuccessful ? 'Thank You for Your Purchase!' : 'Payment Failed'}
              </h2>

              {isPaymentSuccessful ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    🎊 Your order has been confirmed and is being processed. You'll receive an email confirmation shortly.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      💳 Payment Details
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">${paymentStatus?.amount?.toFixed(2) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Currency:</span>
                        <span className="font-medium">{paymentStatus?.currency?.toUpperCase() || 'USD'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-green-600">✅ {paymentStatus?.payment_status || 'Confirmed'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/orders')}
                      className="registration-submit-btn w-full py-3 px-6 rounded-lg font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      📋 View My Orders
                    </button>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="w-full py-3 px-6 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      🛍️ Continue Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-6">
                    Unfortunately, your payment could not be processed. Please try again or contact support if the issue persists.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      ❌ Payment Status
                    </h3>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium text-red-600">{paymentStatus?.payment_status || 'Failed'}</span>
                      </div>
                      {paymentStatus?.session_status && (
                        <div className="flex justify-between">
                          <span>Session Status:</span>
                          <span className="font-medium">{paymentStatus.session_status}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="registration-submit-btn w-full py-3 px-6 rounded-lg font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      🔄 Try Again
                    </button>
                    <button
                      onClick={() => navigate('/marketplace')}
                      className="w-full py-3 px-6 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      🏠 Back to Marketplace
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;