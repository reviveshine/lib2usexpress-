import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const BuyerDashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🔐 No user found, redirecting to login');
        navigate('/login');
        return;
      }

      // Only buyers can access buyer dashboard
      if (user.userType !== 'buyer') {
        console.log('🚫 Non-buyer trying to access buyer dashboard, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }
      
      console.log('🛍️ Buyer dashboard access granted for:', user.firstName, user.lastName);
    }
  }, [user, loading, navigate]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shop':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              🛍️ Welcome to the Marketplace
            </h2>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
              <h3 style={{ margin: 0, marginBottom: '1rem', color: '#dc2626' }}>
                Discover Amazing Products
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '2rem', fontSize: '1.1rem' }}>
                Browse authentic Liberian products and connect directly with sellers. 
                From traditional crafts to premium coffee beans - find exactly what you're looking for.
              </p>
              
              <Link
                to="/marketplace"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)'
                }}
              >
                🛍️ Start Shopping Now
              </Link>
            </div>

            {/* Quick Shopping Categories */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem'
            }}>
              {[
                { name: 'Traditional Crafts', icon: '🎨', description: 'Authentic handmade items' },
                { name: 'Coffee & Foods', icon: '☕', description: 'Premium Liberian products' },
                { name: 'Electronics', icon: '📱', description: 'Tech and gadgets' },
                { name: 'Books & Media', icon: '📚', description: 'Educational materials' }
              ].map((category) => (
                <Link
                  key={category.name}
                  to={`/marketplace?category=${category.name.toLowerCase().replace(' ', '_')}`}
                  style={{
                    display: 'block',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    border: '2px solid #dc2626',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.1)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                  <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1rem', fontWeight: 'bold' }}>
                    {category.name}
                  </h4>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              📦 My Orders
            </h2>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ margin: 0, marginBottom: '1rem', color: '#dc2626' }}>
                Your Order History
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '1.5rem' }}>
                Track your purchases, view delivery status, and manage your orders.
              </p>
              
              <Link
                to="/orders"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}
              >
                📦 View All Orders
              </Link>
              
              <Link
                to="/marketplace"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                🛍️ Continue Shopping
              </Link>
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              💬 Messages
            </h2>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ margin: 0, marginBottom: '1rem', color: '#dc2626' }}>
                Chat with Sellers
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '1.5rem' }}>
                Ask questions about products, negotiate prices, and coordinate deliveries directly with sellers.
              </p>
              
              <Link
                to="/chat"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                💬 Open Messages
              </Link>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div style={{ padding: '2rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              🚚 Shipping Calculator
            </h2>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ margin: 0, marginBottom: '1rem', color: '#dc2626' }}>
                Calculate Shipping Costs
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '1.5rem' }}>
                Get accurate shipping estimates from Liberia to the USA for your purchases.
              </p>
              
              <Link
                to="/shipping"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
              >
                📊 Calculate Shipping
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <p>Select a tab to view content.</p>
          </div>
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <p>Loading your shopping dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            🛍️ Shopping Dashboard
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Hello {user.firstName}! Ready to discover amazing products?
          </p>
        </div>

        {/* Navigation and Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation */}
          <div style={{
            borderBottom: '2px solid #fecaca',
            backgroundColor: '#fef2f2',
            display: 'flex',
            overflowX: 'auto'
          }}>
            {[
              { id: 'shop', label: 'Shop', icon: '🛍️' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'chat', label: 'Messages', icon: '💬' },
              { id: 'shipping', label: 'Shipping', icon: '🚚' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 1.5rem',
                  backgroundColor: activeTab === tab.id ? '#dc2626' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #991b1b' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = '#fecaca';
                    e.target.style.color = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardPage;