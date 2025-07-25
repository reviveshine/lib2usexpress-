import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useShoppingCart } from '../components/ShoppingCart';

const MarketplacePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest'
  });
  const [user, setUser] = useState(null);

  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();

  useEffect(() => {
    loadProducts();
    checkAuthStatus();
  }, [currentPage, filters]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
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

  const handleAddToCart = (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (user.userType !== 'buyer') {
      alert('Only buyers can add items to cart');
      return;
    }

    if (user.id === product.seller_id) {
      alert('You cannot buy your own products!');
      return;
    }

    // Transform product data for cart
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image_urls: product.images,
      seller_id: product.seller_id,
      seller_name: product.sellerName,
      stock: product.stock,
      category: product.category
    };

    addToCart(cartItem);
    alert('Product added to cart!');
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
      <section style={{ padding: '2rem 0', backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Explore Our Marketplace
          </h1>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem' }}>
            Discover products from verified sellers in Liberia
          </p>
          
          {/* Search and Filter Bar */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  flex: '1',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  minWidth: '200px'
                }}
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px'
                }}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home">Home & Garden</option>
                <option value="books">Books</option>
              </select>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px'
                }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <button type="submit" className="btn-primary">
                Search
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
                      <span>Seller: {product.sellerName}</span>
                      <span>👁️ {product.views} views</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {user && user.userType === 'buyer' && (
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
                      )}
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