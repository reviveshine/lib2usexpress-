import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    limit: 10,
    skip: 0,
    total: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.skip, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        skip: pagination.skip.toString()
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/products/management?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
        setError('');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/dashboard/products/${productId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update local state
        setProducts(prev =>
          prev.map(product =>
            product.id === productId
              ? { ...product, status: newStatus }
              : product
          )
        );
        alert('Product status updated successfully!');
      }
    } catch (err) {
      console.error('Error updating product status:', err);
      alert('Failed to update product status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'out_of_stock': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⏸️';
      case 'out_of_stock': return '❌';
      default: return '❓';
    }
  };

  const getStockStatusColor = (stockStatus) => {
    return stockStatus === 'low' ? '#ef4444' : '#10b981';
  };

  const nextPage = () => {
    if (pagination.skip + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        skip: prev.skip + prev.limit
      }));
    }
  };

  const prevPage = () => {
    if (pagination.skip > 0) {
      setPagination(prev => ({
        ...prev,
        skip: Math.max(0, prev.skip - prev.limit)
      }));
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && products.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
          <p>Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          📦 Product Management
        </h2>
        
        <button
          onClick={() => window.location.href = '#add-product'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>➕</span>
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#374151',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Status Filter:
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            color: '#374151',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Category Filter:
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <button
            onClick={fetchProducts}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>No Products Found</h3>
          <p style={{ margin: 0 }}>
            {Object.values(filters).some(f => f) 
              ? 'No products match your current filters.' 
              : 'Start by adding your first product!'
            }
          </p>
          <button
            onClick={() => window.location.href = '#add-product'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          {products.map((product, index) => (
            <div
              key={product.id}
              style={{
                padding: '1.5rem',
                borderBottom: index < products.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              {/* Product Image */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                border: '2px solid #e5e7eb'
              }}>
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url || product.images[0]}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  display: product.images && product.images.length > 0 ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%'
                }}>
                  📷
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 style={{ 
                  margin: 0, 
                  marginBottom: '0.5rem', 
                  color: '#111827', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  {product.name}
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: '#dc2626' 
                  }}>
                    {formatCurrency(product.price)}
                  </span>
                  
                  <span style={{ 
                    color: '#6b7280', 
                    fontSize: '0.9rem' 
                  }}>
                    Category: {product.category || 'Uncategorized'}
                  </span>
                  
                  <span style={{ 
                    color: getStockStatusColor(product.stock_status),
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Stock: {product.stock || 0} {product.stock_status === 'low' ? '⚠️' : '✅'}
                  </span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  <span>💰 Revenue: {formatCurrency(product.total_revenue || 0)}</span>
                  <span>📦 Sold: {product.total_sold || 0}</span>
                  <span>👁️ Views: {product.views || 0}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: getStatusColor(product.status) + '20',
                  color: getStatusColor(product.status),
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: `2px solid ${getStatusColor(product.status)}`
                }}>
                  {getStatusIcon(product.status)}
                  {product.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <select
                  value={product.status}
                  onChange={(e) => updateProductStatus(product.id, e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>

                <button
                  onClick={() => window.location.href = `#edit-product/${product.id}`}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === 1 ? '#f3f4f6' : '#dc2626',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ⬅️ Previous
          </button>

          <span style={{ color: '#374151', fontWeight: '500' }}>
            Page {currentPage} of {totalPages} ({pagination.total} products)
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#dc2626',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next ➡️
          </button>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ffffff40',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Loading...
        </div>
      )}
    </div>
  );
};

export default ProductManagement;