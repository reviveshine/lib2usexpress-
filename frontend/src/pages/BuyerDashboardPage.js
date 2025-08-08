import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import BuyerAnalytics from '../components/BuyerAnalytics';

const BuyerDashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
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
      case 'analytics':
        return <BuyerAnalytics />;
      
      case 'orders':
        return (
          <div style={{ padding: '1rem' }}>
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
                Order Management Coming Soon
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '1.5rem' }}>
                Track your orders, view delivery status, and manage returns all in one place.
              </p>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
              }}>
                <Link
                  to="/marketplace"
                  style={{
                    display: 'block',
                    padding: '1rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }}
                >
                  🛍️ Continue Shopping
                </Link>
                
                <button
                  style={{
                    padding: '1rem',
                    backgroundColor: '#ffffff',
                    color: '#dc2626',
                    border: '2px solid #dc2626',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onClick={() => alert('Order tracking feature coming soon!')}
                >
                  📍 Track Orders
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'favorites':
        return (
          <div style={{ padding: '1rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              ❤️ My Favorites
            </h2>
            
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💝</div>
              <h3 style={{ margin: 0, marginBottom: '1rem', color: '#dc2626' }}>
                Save Your Favorite Products
              </h3>
              <p style={{ margin: 0, color: '#6b7280', marginBottom: '1.5rem' }}>
                Create wishlists, save products for later, and get notified about price changes.
              </p>
              
              <Link
                to="/marketplace"
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
                🛍️ Discover Products to Love
              </Link>
            </div>
          </div>
        );

      case 'account':
        return (
          <div style={{ padding: '1rem' }}>
            <h2 style={{ 
              margin: 0,
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              👤 Account Settings
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {/* Account Information */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                border: '2px solid #dc2626',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
              }}>
                <h3 style={{ marginTop: 0, color: '#dc2626', fontSize: '1.2rem' }}>
                  📋 Account Information
                </h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Email:</strong> {user.email}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Account Type:</strong> 🛍️ Buyer
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Location:</strong> {user.location}
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong>Member Since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </div>
                
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                  onClick={() => alert('Edit profile feature coming soon!')}
                >
                  ✏️ Edit Profile
                </button>
              </div>

              {/* Quick Actions */}
              <div style={{
                backgroundColor: '#fef2f2',
                padding: '2rem',
                borderRadius: '12px',
                border: '2px solid #fecaca'
              }}>
                <h3 style={{ marginTop: 0, color: '#dc2626', fontSize: '1.2rem' }}>
                  🚀 Quick Actions
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Link
                    to="/marketplace"
                    style={{
                      display: 'block',
                      padding: '1rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    🛍️ Browse Products
                  </Link>
                  
                  <Link
                    to="/shipping"
                    style={{
                      display: 'block',
                      padding: '1rem',
                      backgroundColor: '#ffffff',
                      color: '#dc2626',
                      border: '2px solid #dc2626',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    🚚 Calculate Shipping
                  </Link>
                  
                  <Link
                    to="/chat"
                    style={{
                      display: 'block',
                      padding: '1rem',
                      backgroundColor: '#ffffff',
                      color: '#dc2626',
                      border: '2px solid #dc2626',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    💬 Messages
                  </Link>
                </div>
              </div>
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
          <p>Loading your buyer dashboard...</p>
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
        maxWidth: '1200px',
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
            🛍️ Buyer Dashboard
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Welcome back, {user.firstName}! Track your shopping journey.
          </p>
        </div>

        {/* Navigation and Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '250px 1fr',
          gap: '2rem',
          minHeight: '600px'
        }}>
          {/* Sidebar Navigation */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '2px solid #dc2626',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <nav>
              {[
                { id: 'analytics', label: '📊 Analytics', icon: '📊' },
                { id: 'orders', label: '📦 Orders', icon: '📦' },
                { id: 'favorites', label: '❤️ Favorites', icon: '❤️' },
                { id: 'account', label: '👤 Account', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    backgroundColor: activeTab === tab.id ? '#fef2f2' : 'transparent',
                    color: activeTab === tab.id ? '#dc2626' : '#6b7280',
                    border: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.color = '#374151';
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
                  {tab.label.replace(/📊 |📦 |❤️ |👤 /, '')}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboardPage;