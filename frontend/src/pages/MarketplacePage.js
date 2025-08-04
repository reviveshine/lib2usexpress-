import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useShoppingCart } from '../components/ShoppingCart';
import { useAuth } from '../AuthContext';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sellerStatuses, setSellerStatuses] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest'
  });

  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters]);

  useEffect(() => {
    // Load seller statuses when products change
    if (products.length > 0) {
      loadSellerStatuses();
    }
  }, [products]);

  const loadSellerStatuses = async () => {
    try {
      const sellerIds = [...new Set(products.map(p => p.sellerId || p.seller_id))].filter(Boolean);
      
      if (sellerIds.length > 0) {
        const response = await axios.get(
          `${API_BASE}/api/user/status/bulk/${sellerIds.join(',')}`
        );
        
        if (response.data.success) {
          setSellerStatuses(response.data.statuses);
        }
      }
    } catch (error) {
      console.error('Error loading seller statuses:', error);
    }
  };


  const contactSeller = async (product) => {
    if (!user) {
      alert('Please login to contact sellers');
      navigate('/login');
      return;
    }

    if (user.id === product.seller_id) {
      alert('You cannot contact yourself!');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_BASE}/api/chat/create`,
        {
          recipient_id: product.seller_id,
          product_id: product.id,
          initial_message: `Hi! I'm interested in your product: ${product.name}`
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleAddToCart = async (product) => {
    // Allow both logged in and guest users to add to cart
    try {
      const cartItem = {
        id: product._id || product.id,
        name: product.title || product.name,
        price: product.price,
        quantity: 1,
        image: product.images ? product.images[0] : 'https://via.placeholder.com/150x150?text=Product',
        sellerId: product.sellerId || product.seller_id,
        sellerName: product.sellerName || product.seller_name || 'Unknown Seller'
      };

      addToCart(cartItem);
      
      // Show success message
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
      `;
      notification.textContent = `✅ ${cartItem.name} added to cart!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
    } catch (error) {
      console.error('🛒 Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...filters
      };

      // Connect to FastAPI backend
      const response = await axios.get(`${API_BASE}/api/products`, { params });
      
      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Show mock data for development
      setProducts([
        {
          _id: '1',
          name: 'Sample Product 1',
          description: 'This is a sample product from Liberia',
          price: 25.99,
          category: 'electronics',
          images: ['https://via.placeholder.com/300x300?text=Product+1'],
          sellerName: 'John Doe',
          stock: 10,
          views: 45
        },
        {
          _id: '2',
          name: 'Sample Product 2',
          description: 'Another sample product for international shipping',
          price: 15.50,
          category: 'fashion',
          images: ['https://via.placeholder.com/300x300?text=Product+2'],
          sellerName: 'Jane Smith',
          stock: 5,
          views: 23
        }
      ]);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  return (
    <div className="page">
      <section style={{ 
        padding: '3rem 0', 
        background: 'rgba(255, 255, 255, 0.98)',
        borderBottom: '3px solid #DAA520' 
      }}>
        <div className="container">
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            background: 'linear-gradient(45deg, #B22234, #3C3B6E, #DAA520)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '3rem',
            fontWeight: '900',
            fontFamily: 'Georgia, serif'
          }}>
            🌍 Discover Authentic Liberian Products 🌍
          </h1>
          <p style={{ 
            textAlign: 'center', 
            color: '#374151', 
            marginBottom: '2.5rem',
            fontSize: '1.2rem',
            fontWeight: '400'
          }}>
            Explore handcrafted treasures from verified Liberian sellers
          </p>
          
          {/* Professional Search and Filter Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
            marginBottom: '3rem',
            border: '2px solid rgba(218, 165, 32, 0.15)',
            backdropFilter: 'blur(20px)'
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="🔍 Search for authentic Liberian products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  flex: '1',
                  padding: '1rem 1.5rem',
                  border: '2px solid rgba(218, 165, 32, 0.2)',
                  borderRadius: '15px',
                  minWidth: '250px',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.95)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#DAA520';
                  e.target.style.boxShadow = '0 0 20px rgba(218, 165, 32, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(218, 165, 32, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  padding: '1rem 1.5rem',
                  border: '2px solid rgba(218, 165, 32, 0.2)',
                  borderRadius: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1rem'
                }}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion & Textiles</option>
                <option value="home">Home & Garden</option>
                <option value="food">Food & Beverages</option>
                <option value="art">Arts & Crafts</option>
              </select>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                style={{
                  padding: '1rem 1.5rem',
                  border: '2px solid rgba(218, 165, 32, 0.2)',
                  borderRadius: '15px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '1rem'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '15px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 6px 20px rgba(60, 59, 110, 0.25)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 30px rgba(60, 59, 110, 0.35)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(60, 59, 110, 0.25)';
              }}>
                🔍 Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Professional Products Grid */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                border: '5px solid rgba(60, 59, 110, 0.1)',
                borderTop: '5px solid #DAA520',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite',
                margin: '0 auto 2rem',
                filter: 'drop-shadow(0 2px 4px rgba(218, 165, 32, 0.2))'
              }}></div>
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#6b7280',
                fontWeight: '500' 
              }}>
                Loading authentic Liberian products...
              </p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🔍</div>
              <p style={{ 
                fontSize: '1.3rem', 
                color: '#6b7280',
                fontWeight: '500' 
              }}>
                No products found matching your search criteria.
              </p>
              <p style={{ 
                fontSize: '1rem', 
                color: '#9ca3af',
                marginTop: '1rem'
              }}>
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2.5rem'
            }}>
              {products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    borderRadius: '25px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: '1px solid rgba(218, 165, 32, 0.15)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.borderColor = '#DAA520';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(218, 165, 32, 0.15)';
                  }}
                >
                  {/* Professional Top Border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #B22234, #DAA520, #3C3B6E)',
                    opacity: 0.8
                  }}></div>

                  <div style={{ position: 'relative' }}>
                    {product.video ? (
                      <video
                        src={product.video}
                        style={{
                          width: '100%',
                          height: '220px',
                          objectFit: 'cover'
                        }}
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                    ) : (
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/320x220?text=Authentic+Liberian+Product'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '220px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    
                    {/* Enhanced Category Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'rgba(178, 34, 52, 0.95)',
                      color: 'white',
                      padding: '0.4rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(178, 34, 52, 0.3)'
                    }}>
                      {product.category}
                    </div>
                    
                    {/* Enhanced Video Badge */}
                    {product.video && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '15px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)'
                      }}>
                        🎥 Video Preview
                      </div>
                    )}
                  </div>
                  {/* Enhanced Product Content */}
                  <div style={{ padding: '1.8rem' }}>
                    <h3 style={{ 
                      margin: '0 0 1rem 0', 
                      fontSize: '1.3rem',
                      color: '#1f2937',
                      fontWeight: '700',
                      lineHeight: '1.3'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '1rem',
                      margin: '0 0 1.5rem 0',
                      lineHeight: '1.6'
                    }}>
                      {product.description.substring(0, 100)}...
                    </p>
                    
                    {/* Price and Stock Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid rgba(218, 165, 32, 0.1)'
                    }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '800',
                        color: '#B22234',
                        fontFamily: 'Georgia, serif'
                      }}>
                        ${product.price.toFixed(2)}
                      </div>
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontWeight: '600'
                      }}>
                        📦 Stock: {product.stock}
                      </div>
                    </div>
                    
                    {/* Seller and Status Section */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      color: '#6b7280',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ fontWeight: '600' }}>👤 {product.sellerName}</span>
                        {/* Enhanced Online Status Indicator */}
                        {sellerStatuses[product.sellerId || product.seller_id] && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            background: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                              ? 'rgba(16, 185, 129, 0.1)' 
                              : 'rgba(107, 114, 128, 0.1)',
                            border: `1px solid ${sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : 'rgba(107, 114, 128, 0.15)'}`
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? '#10b981' 
                                : '#9ca3af',
                              boxShadow: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? '0 0 8px rgba(16, 185, 129, 0.6)' 
                                : 'none',
                              animation: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? 'pulse 2s infinite' 
                                : 'none'
                            }} />
                            <span style={{ 
                              fontSize: '0.8rem',
                              color: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? '#059669' 
                                : '#6b7280',
                              fontWeight: '600'
                            }}>
                              {sellerStatuses[product.sellerId || product.seller_id]?.is_online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        )}
                      </div>
                      <span style={{ 
                        color: '#9ca3af',
                        fontSize: '0.8rem'
                      }}>
                        👁️ {product.views} views
                      </span>
                    </div>
                    
                    {/* Professional Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        style={{
                          flex: '1',
                          padding: '0.8rem 1rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#059669';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#10b981';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.25)';
                        }}
                      >
                        🛒 Add to Cart
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          contactSeller(product);
                        }}
                        style={{
                          flex: '1',
                          padding: '0.8rem 1rem',
                          backgroundColor: '#3C3B6E',
                          color: 'white',
                          border: 'none',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 15px rgba(60, 59, 110, 0.25)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#B22234';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(178, 34, 52, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#3C3B6E';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(60, 59, 110, 0.25)';
                        }}
                      >
                        💬 Contact Seller
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketplacePage;