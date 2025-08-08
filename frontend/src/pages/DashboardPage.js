import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';
import ProfileTab from '../components/ProfileTab';
import SellerAnalytics from '../components/SellerAnalytics';
import BuyerAnalytics from '../components/BuyerAnalytics';
import ProductManagement from '../components/ProductManagement';

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [onlineUsers, setOnlineUsers] = useState([]);
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
        console.log('🚫 Non-seller trying to access dashboard, redirecting to buyer dashboard');
        navigate('/buyer-dashboard');
        return;
      }
      
      console.log('🏪 Seller dashboard access granted for:', user.firstName, user.lastName);
      
      // Load online users initially
      loadOnlineUsers();
      
      // Set up interval to refresh online users every 30 seconds
      const interval = setInterval(loadOnlineUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, navigate]);

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/online-users`);
      const data = await response.json();
      
      if (data.success) {
        setOnlineUsers(data.online_users);
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

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
              background: 'linear-gradient(135deg, #B22234 0%, #3C3B6E 100%)',
              color: 'white',
              padding: '3rem',
              borderRadius: '25px',
              marginBottom: '3rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 15px 50px rgba(178, 34, 52, 0.2)'
            }}>
              {/* Background pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 200'%3E%3Cpath d='M0 50 Q100 30 200 50 T400 50 L400 200 L0 200 Z' fill='%23DAA520' opacity='0.08'/%3E%3C/svg%3E")`,
                backgroundSize: '400px 200px',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'bottom'
              }}></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ 
                  fontSize: '2.2rem', 
                  marginBottom: '1rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontFamily: 'Georgia, serif',
                  fontWeight: '900'
                }}>
                  🏪 Welcome to Your Seller Dashboard, {user.firstName}!
                </h3>
                <p style={{ 
                  fontSize: '1.2rem', 
                  opacity: '0.95',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontWeight: '400'
                }}>
                  🌍 Manage your authentic Liberian products and connect with American customers
                </p>
              </div>
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
                <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>👥 Users Online</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{onlineUsers.length}</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Active now</p>
              </div>
            </div>

            {/* Online Users Section */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🟢 Online Users ({onlineUsers.length})
              </h4>
              
              {onlineUsers.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {onlineUsers.map((onlineUser) => (
                    <div key={onlineUser.user_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: onlineUser.status === 'online' ? '#10b981' : '#f59e0b'
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: '500', 
                          color: '#1f2937',
                          fontSize: '0.9rem'
                        }}>
                          {onlineUser.name}
                        </p>
                        <p style={{ 
                          margin: 0, 
                          color: '#6b7280', 
                          fontSize: '0.8rem',
                          textTransform: 'capitalize'
                        }}>
                          {onlineUser.userType === 'seller' ? '🏪 Seller' : '🛍️ Buyer'}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '0.7rem',
                        color: onlineUser.status === 'online' ? '#10b981' : '#f59e0b',
                        textTransform: 'capitalize'
                      }}>
                        {onlineUser.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <p>No users currently online</p>
                </div>
              )}
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

      case 'products':
        return <ProductManagement />;

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
      
      case 'analytics':
        return <SellerAnalytics />;

      case 'profile':
        return <ProfileTab />;
      
      default:
        return (
          <div>
            <p>Select a tab to view content.</p>
          </div>
        );
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