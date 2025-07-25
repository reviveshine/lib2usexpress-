import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Only sellers can access dashboard
      if (parsedUser.userType !== 'seller') {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>Dashboard Overview</h3>
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
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Total Products</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Total Orders</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>0</p>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Total Revenue</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>$0</p>
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
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="btn-primary"
                  style={{ marginRight: '1rem' }}
                >
                  Add Your First Product
                </button>
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
              <h3 style={{ color: '#1f2937' }}>My Products</h3>
              <button className="btn-primary">Add New Product</button>
            </div>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Products Yet</h4>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Start by adding your first product to begin selling internationally.
              </p>
              <button className="btn-primary">Create Your First Product</button>
            </div>
          </div>
        );
      
      case 'orders':
        return (
          <div>
            <h3 style={{ marginBottom: '2rem', color: '#1f2937' }}>Order Management</h3>
            
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#6b7280', marginBottom: '1rem' }}>No Orders Yet</h4>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
                Orders from your customers will appear here once you start selling.
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