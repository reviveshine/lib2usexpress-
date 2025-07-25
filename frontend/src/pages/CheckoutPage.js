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
    name: user?.name || '',
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
  }, [user, navigate, location.state]);

  const calculateTotal = async (cartItems) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/payments/calculate-total?shipping_cost=${shippingDetails.cost}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(cartItems)
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

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails({
      ...shippingDetails,
      [name]: name === 'cost' ? parseFloat(value) : value
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const checkoutData = {
        cart_items: cart.map(item => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          total_price: item.total_price || (item.price * item.quantity),
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b">
                <div>
                  <h3 className="font-medium text-gray-900">{item.product_name || item.name}</h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ${item.unit_price || item.price}
                  </p>
                  <p className="text-sm text-gray-600">
                    Seller: {item.seller_name}
                  </p>
                </div>
                <span className="font-medium text-gray-900">
                  ${(item.total_price || (item.price * item.quantity)).toFixed(2)}
                </span>
              </div>
            ))}

            {orderTotal && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${orderTotal.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>${orderTotal.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${orderTotal.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${orderTotal.total_amount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrier
                  </label>
                  <select
                    name="carrier"
                    value={shippingDetails.carrier}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="Aramex">Aramex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service
                  </label>
                  <select
                    name="service"
                    value={shippingDetails.service}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Express">Express (1-3 days)</option>
                    <option value="Standard">Standard (3-5 days)</option>
                    <option value="Economy">Economy (5-10 days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Cost
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={shippingDetails.cost}
                    onChange={handleShippingChange}
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Address</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={buyerInfo.name}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={buyerInfo.email}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={buyerInfo.address}
                    onChange={handleBuyerInfoChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={buyerInfo.city}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={buyerInfo.state}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={buyerInfo.zipCode}
                      onChange={handleBuyerInfoChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="stripe"
                    name="payment_method"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="stripe" className="text-sm font-medium text-gray-700">
                    Credit/Debit Card (Stripe)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paypal"
                    name="payment_method"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="paypal" className="text-sm font-medium text-gray-700">
                    PayPal
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="mobile_money"
                    name="payment_method"
                    value="mobile_money"
                    checked={paymentMethod === 'mobile_money'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <label htmlFor="mobile_money" className="text-sm font-medium text-gray-700">
                    Mobile Money
                  </label>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={loading || !orderTotal}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Processing...' : `Complete Purchase - $${orderTotal?.total_amount?.toFixed(2) || '0.00'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;