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

      {/* Products Grid */}
      <section style={{ padding: '2rem 0' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {products.map((product) => (
                <div
                  key={product._id}
                  style={{
                    background: 'white',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {product.video ? (
                      <video
                        src={product.video}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                        muted
                        loop
                        onMouseEnter={(e) => e.target.play()}
                        onMouseLeave={(e) => e.target.pause()}
                      />
                    ) : (
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#dc2626',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      textTransform: 'capitalize'
                    }}>
                      {product.category}
                    </div>
                    {product.video && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '5px',
                        fontSize: '0.75rem'
                      }}>
                        🎥 Video
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '1.1rem',
                      color: '#1f2937'
                    }}>
                      {product.name}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '0.9rem',
                      margin: '0 0 1rem 0',
                      lineHeight: '1.4'
                    }}>
                      {product.description.substring(0, 80)}...
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 'bold',
                        color: '#dc2626'
                      }}>
                        ${product.price.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        Stock: {product.stock}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Seller: {product.sellerName}</span>
                        {/* Online Status Indicator */}
                        {sellerStatuses[product.sellerId || product.seller_id] && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? '#10b981' // Green for online
                                : '#6b7280' // Gray for offline
                            }} />
                            <span style={{ 
                              fontSize: '0.7rem',
                              color: sellerStatuses[product.sellerId || product.seller_id]?.is_online 
                                ? '#10b981' 
                                : '#6b7280'
                            }}>
                              {sellerStatuses[product.sellerId || product.seller_id]?.is_online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        )}
                      </div>
                      <span>👁️ {product.views} views</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        style={{
                          flex: '1',
                          padding: '0.5rem',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#15803d';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#16a34a';
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
                          padding: '0.5rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#dc2626';
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