import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';
import ProfileTab from '../components/ProfileTab';

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
      
      case 'analytics':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: '#1f2937' }}>📊 Analytics & Insights</h3>
              <select 
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  backgroundColor: 'white'
                }}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            {/* Key Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #10b981'
              }}>
                <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>💰 Revenue</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>$1,245</p>
                <p style={{ fontSize: '0.8rem', color: '#10b981' }}>↗️ +12% vs last period</p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #3b82f6'
              }}>
                <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>📦 Orders</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>23</p>
                <p style={{ fontSize: '0.8rem', color: '#3b82f6' }}>↗️ +8% vs last period</p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #f59e0b'
              }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>👀 Views</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>156</p>
                <p style={{ fontSize: '0.8rem', color: '#f59e0b' }}>↗️ +15% vs last period</p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: '2px solid #8b5cf6'
              }}>
                <h4 style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>🔄 Conversion</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>14.7%</p>
                <p style={{ fontSize: '0.8rem', color: '#8b5cf6' }}>↗️ +2.3% vs last period</p>
              </div>
            </div>

            {/* Charts and Detailed Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              {/* Sales Chart */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>📈 Sales Performance</h4>
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Simulated Chart Bars */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: '150px',
                    gap: '8px'
                  }}>
                    {[45, 67, 89, 56, 78, 92, 73].map((height, index) => (
                      <div
                        key={index}
                        style={{
                          width: '30px',
                          height: `${height}px`,
                          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                          borderRadius: '4px 4px 0 0',
                          opacity: 0.8
                        }}
                      />
                    ))}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}>
                    Last 7 Days
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>🏆 Top Products</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { name: 'Liberian Coffee Beans', sales: 12, revenue: '$240' },
                    { name: 'Traditional Fabric', sales: 8, revenue: '$320' },
                    { name: 'Palm Wine', sales: 6, revenue: '$180' },
                    { name: 'Local Artwork', sales: 4, revenue: '$400' }
                  ].map((product, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: index === 0 ? '#fef2f2' : '#f9fafb',
                      borderRadius: '8px',
                      border: index === 0 ? '1px solid #fecaca' : '1px solid #e5e7eb'
                    }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          {product.name}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {product.sales} sales
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', color: '#10b981' }}>
                          {product.revenue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Insights */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h4 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>🎯 Customer Insights</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                <div>
                  <h5 style={{ color: '#dc2626', marginBottom: '1rem' }}>📍 Top Locations</h5>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {[
                      { city: 'New York, NY', percentage: 35 },
                      { city: 'Los Angeles, CA', percentage: 28 },
                      { city: 'Washington, DC', percentage: 22 },
                      { city: 'Atlanta, GA', percentage: 15 }
                    ].map((location, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', color: '#1f2937' }}>{location.city}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{location.percentage}%</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '4px',
                          background: '#e5e7eb',
                          borderRadius: '2px',
                          marginTop: '0.25rem'
                        }}>
                          <div style={{
                            width: `${location.percentage}%`,
                            height: '100%',
                            background: '#dc2626',
                            borderRadius: '2px'
                          }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 style={{ color: '#dc2626', marginBottom: '1rem' }}>🕒 Peak Hours</h5>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {[
                      { time: '2:00 PM - 4:00 PM', activity: 'High' },
                      { time: '7:00 PM - 9:00 PM', activity: 'Very High' },
                      { time: '10:00 AM - 12:00 PM', activity: 'Medium' },
                      { time: '8:00 PM - 10:00 PM', activity: 'High' }
                    ].map((hour, index) => (
                      <li key={index} style={{ 
                        marginBottom: '0.75rem',
                        padding: '0.5rem',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}>
                        <div style={{ color: '#1f2937', fontWeight: '500' }}>{hour.time}</div>
                        <div style={{ 
                          color: hour.activity === 'Very High' ? '#dc2626' : hour.activity === 'High' ? '#f59e0b' : '#6b7280',
                          fontSize: '0.8rem'
                        }}>
                          {hour.activity} Activity
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 style={{ color: '#dc2626', marginBottom: '1rem' }}>🔄 Repeat Customers</h5>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'conic-gradient(#dc2626 0% 65%, #e5e7eb 65% 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        65%
                      </div>
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      of customers return
                    </p>
                    <p style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '500' }}>
                      ↗️ +5% this month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h4 style={{ marginBottom: '1rem' }}>🚀 Recommended Actions</h4>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  📈 Boost Low-Performing Products
                </button>
                <button style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  🎯 Target Peak Hours
                </button>
                <button style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}>
                  📍 Expand to New Markets
                </button>
              </div>
            </div>
          </div>
        );

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