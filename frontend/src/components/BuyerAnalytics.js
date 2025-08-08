import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuyerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/buyer/analytics?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAnalytics(response.data.analytics);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return '#ef4444'; // Red for increased spending
      case 'down': return '#10b981'; // Green for decreased spending
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛍️</div>
          <p>Loading your shopping analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p>{error}</p>
        <button
          onClick={fetchAnalytics}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Period Selector */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <h2 style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          🛍️ Shopping Analytics
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: period === p ? '#dc2626' : '#f3f4f6',
                color: period === p ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: period === p ? 'bold' : 'normal',
                textTransform: 'capitalize'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Total Spent Card */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Spent</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>
                {formatCurrency(analytics.overview.total_spent)}
              </h3>
              {analytics.trends.spending_trend && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  opacity: 0.9
                }}>
                  <span>{getTrendIcon(analytics.trends.spending_trend.direction)}</span>
                  <span>
                    {analytics.trends.spending_trend.percentage}% vs last {period}
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.8 }}>💳</div>
          </div>
        </div>

        {/* Orders Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #dc2626',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Total Orders</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                {analytics.overview.total_orders}
              </h3>
              {analytics.trends.orders_trend && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  color: getTrendColor(analytics.trends.orders_trend.direction)
                }}>
                  <span>{getTrendIcon(analytics.trends.orders_trend.direction)}</span>
                  <span>
                    {analytics.trends.orders_trend.percentage}% vs last {period}
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.7 }}>📦</div>
          </div>
        </div>

        {/* Average Order Value Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #dc2626',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Avg Order Value</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                {formatCurrency(analytics.overview.avg_order_value)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                {analytics.overview.total_items} items purchased
              </p>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.7 }}>📊</div>
          </div>
        </div>

        {/* Savings Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #10b981',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Total Savings</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>
                {formatCurrency(analytics.overview.total_savings)}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                Shipping: {formatCurrency(analytics.overview.shipping_costs)}
              </p>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.7 }}>💰</div>
          </div>
        </div>
      </div>

      {/* Favorite Categories */}
      {analytics.favorite_categories && analytics.favorite_categories.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            ❤️ Favorite Categories
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #dc2626',
            padding: '1rem'
          }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {analytics.favorite_categories.map(([category, count], index) => (
                <div
                  key={category}
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#fef2f2',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                  </div>
                  <h4 style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {category}
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.8rem' }}>
                    {count} items
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Purchases */}
      {analytics.recent_purchases && analytics.recent_purchases.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            🕐 Recent Purchases
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #dc2626',
            overflow: 'hidden'
          }}>
            {analytics.recent_purchases.map((purchase, index) => (
              <div
                key={purchase.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderBottom: index < analytics.recent_purchases.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>
                    Order #{purchase.id.slice(-8)}
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>
                    {purchase.items_count} items • {new Date(purchase.date).toLocaleDateString()}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, color: '#dc2626', fontWeight: 'bold', fontSize: '1rem' }}>
                    {formatCurrency(purchase.amount)}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: purchase.status === 'completed' ? '#dcfce7' : '#fef3c7',
                    color: purchase.status === 'completed' ? '#166534' : '#92400e',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {purchase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1.2rem' }}>
            {analytics.overview.pending_orders}
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Pending Orders
          </p>
        </div>

        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
          <h4 style={{ margin: 0, color: '#dc2626', fontSize: '1.2rem' }}>
            {analytics.overview.cancelled_orders}
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Cancelled Orders
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: '#fef2f2',
        border: '2px solid #fecaca',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ 
          marginTop: 0,
          marginBottom: '1rem',
          color: '#dc2626',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          🛒 Quick Actions
        </h3>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button
            style={{
              padding: '1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textAlign: 'left'
            }}
            onClick={() => window.location.href = '#marketplace'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛍️</div>
            Browse Marketplace
          </button>
          
          <button
            style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textAlign: 'left'
            }}
            onClick={() => window.location.href = '#orders'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
            View All Orders
          </button>
          
          <button
            style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              color: '#dc2626',
              border: '2px solid #dc2626',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textAlign: 'left'
            }}
            onClick={() => window.location.href = '#shipping'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🚚</div>
            Calculate Shipping
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerAnalytics;