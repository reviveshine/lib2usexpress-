import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SellerAnalytics = () => {
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
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/seller/analytics?period=${period}`,
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
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
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
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <p>Loading analytics...</p>
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
          📊 Seller Analytics
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
        {/* Revenue Card */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Revenue</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold' }}>
                {formatCurrency(analytics.overview.total_revenue)}
              </h3>
              {analytics.trends.revenue_trend && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  opacity: 0.9
                }}>
                  <span>{getTrendIcon(analytics.trends.revenue_trend.direction)}</span>
                  <span>
                    {analytics.trends.revenue_trend.percentage}% vs last {period}
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.8 }}>💰</div>
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

        {/* Products Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #dc2626',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Active Products</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                {analytics.overview.active_products}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                of {analytics.overview.total_products} total
              </p>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.7 }}>🏪</div>
          </div>
        </div>

        {/* Views Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #dc2626',
          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Product Views</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                {analytics.overview.product_views.toLocaleString()}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                {analytics.overview.new_inquiries} new inquiries
              </p>
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.7 }}>👁️</div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      {analytics.top_products && analytics.top_products.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            marginBottom: '1rem',
            color: '#dc2626',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            🏆 Top Performing Products
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '2px solid #dc2626',
            overflow: 'hidden'
          }}>
            {analytics.top_products.map((product, index) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index < analytics.top_products.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  #{index + 1}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: '#111827', fontSize: '1rem' }}>
                    {product.name}
                  </h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>
                    {product.quantity_sold} sold • {formatCurrency(product.revenue)} revenue
                  </p>
                </div>
                
                <div style={{ fontSize: '1.5rem' }}>🌟</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          🚀 Quick Actions
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
            onClick={() => window.location.href = '#add-product'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>➕</div>
            Add New Product
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
            onClick={() => window.location.href = '#manage-products'}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦</div>
            Manage Products
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
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;