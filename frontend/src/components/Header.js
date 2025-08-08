import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCart, { useShoppingCart } from './ShoppingCart';
import { useAuth } from '../AuthContext';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = useShoppingCart();
  const { user, logout } = useAuth();

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCartOpen && !event.target.closest('.cart-dropdown-container')) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Liberia Map Background Element */}
      <div className="liberia-map-bg"></div>
      
      {/* Realistic Patriotic Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3C3B6E 0%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.15) 70%, #B22234 100%)',
        color: 'white',
        padding: '25px 0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        borderBottom: '4px solid #DAA520'
      }}>
        {/* Realistic Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60'%3E%3Cpath d='M0 30 Q150 15 300 30 T600 30 T900 30 T1200 30 V60 H0 Z' fill='%23DAA520' opacity='0.12'/%3E%3Cpath d='M0 45 Q200 30 400 45 T800 45 T1200 45 V60 H0 Z' fill='%23C31E39' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize: '1200px 60px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom'
        }}></div>
        
        {/* Subtle Liberia Map Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1709226660708-38e861588890")',
          backgroundSize: '800px auto',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center right',
          opacity: 0.04,
          filter: 'sepia(100%) saturate(200%) hue-rotate(30deg) brightness(1.5)'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Professional USA Flag */}
          <div style={{
            width: '70px',
            height: '45px',
            background: `
              linear-gradient(to bottom, 
                #B22234 0%, #B22234 7.7%, 
                #ffffff 7.7%, #ffffff 15.4%, 
                #B22234 15.4%, #B22234 23.1%, 
                #ffffff 23.1%, #ffffff 30.8%, 
                #B22234 30.8%, #B22234 38.5%, 
                #ffffff 38.5%, #ffffff 46.2%, 
                #B22234 46.2%, #B22234 53.9%, 
                #ffffff 53.9%, #ffffff 100%)
            `,
            borderRadius: '10px',
            border: '3px solid #DAA520',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            position: 'relative',
            animation: 'flagWaveRealistic 4s ease-in-out infinite',
            transform: 'perspective(100px) rotateY(-5deg)'
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              width: '25px',
              height: '18px',
              background: '#3C3B6E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              borderRadius: '2px'
            }}>
              ⭐
            </div>
          </div>
          
          {/* Enhanced Bridge Text */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'block',
              fontSize: '2.5rem',
              fontWeight: '900',
              textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
              background: 'linear-gradient(45deg, #B22234 0%, #DAA520 25%, #ffffff 50%, #DAA520 75%, #3C3B6E 100%)',
              backgroundSize: '400% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmerRealistic 4s ease-in-out infinite',
              letterSpacing: '4px',
              fontFamily: 'Georgia, serif'
            }}>
              BRIDGING NATIONS
            </span>
            <span style={{
              display: 'block',
              fontSize: '1.3rem',
              fontWeight: '600',
              marginTop: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
              color: '#DAA520',
              letterSpacing: '2px'
            }}>
              🌍 LIBERIA ⟷ USA 🌍
            </span>
          </div>
          
          {/* Professional Liberia Flag */}
          <div style={{
            width: '70px',
            height: '45px',
            background: `
              linear-gradient(to bottom, 
                #C31E39 0%, #C31E39 9.09%, 
                #ffffff 9.09%, #ffffff 18.18%, 
                #C31E39 18.18%, #C31E39 27.27%, 
                #ffffff 27.27%, #ffffff 36.36%, 
                #C31E39 36.36%, #C31E39 45.45%, 
                #ffffff 45.45%, #ffffff 54.54%, 
                #C31E39 54.54%, #C31E39 63.63%, 
                #ffffff 63.63%, #ffffff 72.72%, 
                #C31E39 72.72%, #C31E39 81.81%, 
                #ffffff 81.81%, #ffffff 90.90%, 
                #C31E39 90.90%, #C31E39 100%)
            `,
            borderRadius: '10px',
            border: '3px solid #DAA520',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            position: 'relative',
            animation: 'flagWaveRealistic 4s ease-in-out infinite reverse',
            transform: 'perspective(100px) rotateY(5deg)'
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              width: '25px',
              height: '20px',
              background: '#002868',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              borderRadius: '2px'
            }}>
              ⭐
            </div>
          </div>
          
          {/* Professional Floating Stars */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            fontSize: '1.8rem',
            animation: 'starFloatRealistic 5s ease-in-out infinite',
            color: '#DAA520'
          }}>✨</div>
          <div style={{
            position: 'absolute',
            top: '25%',
            right: '12%',
            fontSize: '1.5rem',
            animation: 'starFloatRealistic 6s ease-in-out infinite 0.7s',
            color: '#DAA520'
          }}>⭐</div>
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '85%',
            fontSize: '1.3rem',
            animation: 'starFloatRealistic 4.5s ease-in-out infinite 1.2s',
            color: '#DAA520'
          }}>💫</div>
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '30%',
            fontSize: '1rem',
            animation: 'starFloatRealistic 7s ease-in-out infinite 2s',
            color: '#DAA520'
          }}>🌟</div>
        </div>
      </div>
      
      <header className="header">
      <div className="container">
        <div className="logo">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Liberia2USA Express</h1>
          </Link>
        </div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/shipping">Shipping</Link>
          {user && <Link to="/chat">Messages</Link>}
          {user && <Link to="/orders">Orders</Link>}
          {user ? (
            <>
              {user.userType === 'seller' && (
                <Link to="/dashboard">Seller Dashboard</Link>
              )}
              {user.userType === 'buyer' && (
                <Link to="/buyer-dashboard">Dashboard</Link>
              )}
              {user.userType === 'seller' && (
                <Link to="/add-product">Add Product</Link>
              )}
              <div className="cart-dropdown-container" style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="btn-secondary"
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  🛒 Cart
                  {getTotalItems() > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                
                {/* Cart Dropdown */}
                <ShoppingCart
                  isOpen={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="btn-secondary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
    </>
  );
};

export default Header;