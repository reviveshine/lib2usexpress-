import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🔐 No user found, redirecting to login');
        navigate('/login');
        return;
      }

      // Only sellers can access dashboard
      if (user.userType !== 'seller') {
        console.log('🚫 Non-seller trying to access dashboard, redirecting to marketplace');
        navigate('/marketplace');
        return;
      }
      
      console.log('🏪 Seller dashboard access granted for:', user.firstName, user.lastName);
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #dc2626',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p>Loading seller dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={{ 
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '2rem',
              borderRadius: '15px',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                🏪 Welcome to Your Seller Dashboard, {user.firstName}!
              </h3>
              <p style={{ fontSize: '1.1rem', opacity: '0.9' }}>
                🇱🇷 Happy Independence Day! Manage your Liberian products and reach customers in the USA
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #ffd700'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>📦 Total Products</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Products listed</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #ffd700'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>📊 Total Orders</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Orders received</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #ffd700'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>💰 Total Revenue</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>$0</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total earnings</p>
              </div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '15px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.4rem' }}>
                🚀 Quick Actions
              </h4>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Link 
                  to="/add-product" 
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ➕ Add New Product
                </Link>
                <Link 
                  to="/marketplace" 
                  style={{
                    backgroundColor: '#ffd700',
                    color: '#dc2626',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  🛍️ View Marketplace
                </Link>
                <Link 
                  to="/chat" 
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  💬 Messages
                </Link>
              </div>
            </div>
          </div>
        );
              </div>
            </div>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>Welcome to Your Seller Dashboard!</h4>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                This is your central hub for managing your international shipping business from Liberia to the USA. 
                Here you can manage your products, track orders, view analytics, and communicate with buyers.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <Link 
                  to="/add-product"
                  className="btn-primary"
                  style={{ marginRight: '1rem', textDecoration: 'none' }}
                >
                  Add Your First Product
                </Link>
                <button 
                  onClick={() => setActiveTab('shipping')} 
                  className="btn-secondary"
                >
                  Setup Shipping
                </button>
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: '#1f2937' }}>📦 My Products</h3>
              <Link 
                to="/add-product"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                ➕ Add Product
              </Link>
            </div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                🏪 No products listed yet. Start by adding your first product!
              </p>
              <Link 
                to="/add-product"
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                🚀 Add Your First Product
              </Link>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>📊 Recent Orders</h3>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
                📦 No orders yet. Once buyers purchase your products, they'll appear here.
              </p>
            </div>
          </div>
        );
      
      case 'shipping':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>Shipping Configuration</h3>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>Shipping Partners</h4>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Configure your preferred shipping carriers for international delivery to the USA.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {['DHL', 'FedEx', 'UPS', 'Aramex'].map((carrier) => (
                  <div key={carrier} style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <h5 style={{ marginBottom: '0.5rem' }}>{carrier}</h5>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Not configured
                    </p>
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      Setup
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937' }}>Seller Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user.firstName} {user.lastName}</p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            padding: '1rem',
            height: 'fit-content'
          }}>
            <nav>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'products', label: 'Products' },
                { id: 'orders', label: 'Orders' },
                { id: 'shipping', label: 'Shipping' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'profile', label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: activeTab === tab.id ? '#fef2f2' : 'transparent',
                    color: activeTab === tab.id ? '#dc2626' : '#6b7280',
                    border: 'none',
                    borderRadius: '5px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;