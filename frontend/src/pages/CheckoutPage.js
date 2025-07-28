import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [cart, setCart] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    carrier: 'DHL',
    service: 'Express',
    cost: 25.00,
    estimated_days: 3
  });
  const [buyerInfo, setBuyerInfo] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  const [orderTotal, setOrderTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [shippingRates, setShippingRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get cart data from location state or localStorage
    const cartData = location.state?.cart || JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      navigate('/marketplace');
      return;
    }

    setCart(cartData);
    calculateTotal(cartData);
    fetchShippingRates(cartData);
  }, [user, navigate, location.state]);

  const fetchShippingRates = async (cartItems) => {
    if (!cartItems.length) return;
    
    setLoadingRates(true);
    try {
      // Calculate total weight and value for shipping
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);
      const totalValue = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/shipping/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packages: [{
            weight: Math.max(totalWeight, 1),
            length: 30,
            width: 20,
            height: 10,
            value: totalValue
          }],
          destination: {
            country: 'US',
            state: buyerInfo.state || 'NY'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShippingRates(data.rates || []);
        
        // Set default shipping to the first available rate
        if (data.rates && data.rates.length > 0) {
          const defaultRate = data.rates[0];
          setShippingDetails({
            carrier: defaultRate.carrier,
            service: defaultRate.service,
            cost: defaultRate.total_cost,
            estimated_days: defaultRate.transit_days
          });
        }
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  const calculateTotal = async (cartItems) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/calculate-total?shipping_cost=${shippingDetails.cost}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          seller_id: item.seller_id,
          seller_name: item.seller_name
        })))
      });

      if (response.ok) {
        const data = await response.json();
        setOrderTotal(data.breakdown);
      } else {
        setError('Failed to calculate order total');
      }
    } catch (error) {
      setError('Error calculating total');
    }
  };

  const handleBuyerInfoChange = (e) => {
    setBuyerInfo({
      ...buyerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleShippingChange = (carrier, service, cost, days) => {
    setShippingDetails({
      carrier,
      service,
      cost,
      estimated_days: days
    });
    
    // Recalculate total with new shipping cost
    calculateTotal(cart);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!buyerInfo.name.trim()) errors.push('Full name is required');
    if (!buyerInfo.email.trim()) errors.push('Email is required');
    if (!buyerInfo.address.trim()) errors.push('Address is required');
    if (!buyerInfo.city.trim()) errors.push('City is required');
    if (!buyerInfo.state.trim()) errors.push('State is required');
    if (!buyerInfo.zipCode.trim()) errors.push('ZIP code is required');
    
    return errors;
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      setLoading(false);
      return;
    }

    try {
      const checkoutData = {
        cart_items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          seller_id: item.seller_id,
          seller_name: item.seller_name
        })),
        shipping_details: shippingDetails,
        buyer_info: buyerInfo,
        payment_method: paymentMethod,
        origin_url: window.location.origin
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/checkout/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.checkout_url) {
          // Clear cart and redirect to Stripe checkout
          localStorage.removeItem('cart');
          window.location.href = data.checkout_url;
        } else {
          setError('Failed to create checkout session');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Checkout failed');
      }
    } catch (error) {
      setError('Error during checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Independence Day Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '1rem 0',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '3px solid #ffd700'
      }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            animation: 'textGlow 2s ease-in-out infinite alternate'
          }}>
            🇱🇷 Secure Checkout 🇺🇸
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: '0.9',
            marginTop: '0.5rem'
          }}>
            🎉 Complete Your Independence Day Purchase - Connecting Liberian Heritage to American Markets! 🎉
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {error && (
          <div className="error-message mb-6" style={{
            background: 'linear-gradient(135deg, #fef2f2 0%, #fed7d7 100%)',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '10px',
            border: '2px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8" style={{ border: '2px solid #ffd700' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🛍️ Order Summary
              </h2>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {item.image_urls && item.image_urls.length > 0 ? (
                        <img
                          src={item.image_urls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">by {item.seller_name}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {orderTotal && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${orderTotal.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${orderTotal.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${orderTotal.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2" style={{ color: '#dc2626' }}>
                      <span>Total:</span>
                      <span>${orderTotal.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                🚚 Shipping Options
              </h2>
              
              {loadingRates ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-3 text-gray-600">Loading shipping rates...</span>
                </div>
              ) : shippingRates.length > 0 ? (
                <div className="space-y-3">
                  {shippingRates.map((rate, index) => (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        shippingDetails.carrier === rate.carrier && shippingDetails.service === rate.service
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleShippingChange(rate.carrier, rate.service, rate.total_cost, rate.transit_days)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {rate.carrier} {rate.service}
                          </div>
                          <div className="text-sm text-gray-600">
                            {rate.transit_days} business days
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${rate.total_cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No shipping rates available. Using default rates.
                </div>
              )}
            </div>

            {/* Buyer Information */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                📍 Billing Address
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={buyerInfo.name}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={buyerInfo.email}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={buyerInfo.address}
                    onChange={handleBuyerInfoChange}
                    required
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={buyerInfo.city}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={buyerInfo.state}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={buyerInfo.zipCode}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                💳 Payment Method
              </h2>
              
              <div className="space-y-3">
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'stripe' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('stripe')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="stripe"
                      name="payment_method"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <label htmlFor="stripe" className="text-sm font-medium text-gray-700 cursor-pointer">
                        💳 Credit/Debit Card (Stripe)
                      </label>
                      <p className="text-xs text-gray-500">Secure payment with Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'paypal' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('paypal')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="paypal"
                      name="payment_method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <label htmlFor="paypal" className="text-sm font-medium text-gray-700 cursor-pointer">
                        🅿️ PayPal
                      </label>
                      <p className="text-xs text-gray-500">Pay with your PayPal account or guest checkout</p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === 'mobile_money' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`} onClick={() => setPaymentMethod('mobile_money')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="mobile_money"
                      name="payment_method"
                      value="mobile_money"
                      checked={paymentMethod === 'mobile_money'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <label htmlFor="mobile_money" className="text-sm font-medium text-gray-700 cursor-pointer">
                        📱 Mobile Money
                      </label>
                      <p className="text-xs text-gray-500">Pay with mobile money services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || !orderTotal}
              className="registration-submit-btn w-full py-4 px-6 text-lg font-bold rounded-lg shadow-lg transition-all"
              style={{
                background: loading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Processing Payment...
                </span>
              ) : (
                `🚀 Complete Purchase - $${orderTotal?.total_amount?.toFixed(2) || '0.00'}`
              )}
            </button>

            {/* Security Notice */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                🔒 Your payment information is secure and protected with industry-standard encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;