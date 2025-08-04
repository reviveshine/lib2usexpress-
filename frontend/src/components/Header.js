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
      
      {/* Patriotic Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #ffffff 50%, #dc2626 100%)',
        color: 'white',
        padding: '20px 0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(29, 78, 216, 0.3)',
        borderBottom: '3px solid #ffd700'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 20\'%3E%3Cpath d=\'M0 10 Q25 5 50 10 T100 10 V20 H0 Z\' fill=\'%23ffd700\' opacity=\'0.2\'/%3E%3C/svg%3E")',
          backgroundSize: '100px 20px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom'
        }}></div>
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '25px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* USA Flag */}
          <div style={{
            width: '60px',
            height: '40px',
            background: 'linear-gradient(to bottom, #dc2626 0%, #dc2626 33%, #ffffff 33%, #ffffff 66%, #1d4ed8 66%)',
            borderRadius: '8px',
            border: '2px solid #ffd700',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            position: 'relative',
            animation: 'flagWave 3s ease-in-out infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              width: '20px',
              height: '12px',
              background: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px'
            }}>
              ⭐
            </div>
          </div>
          
          {/* Bridge Text */}
          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'block',
              fontSize: '2rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #dc2626, #ffd700, #1d4ed8)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmer 3s ease-in-out infinite',
              letterSpacing: '3px'
            }}>
              BRIDGING NATIONS
            </span>
            <span style={{
              display: 'block',
              fontSize: '1.2rem',
              fontWeight: '600',
              marginTop: '5px',
              textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
              color: '#ffd700'
            }}>
              🌍 LIBERIA ↔ USA 🌍
            </span>
          </div>
          
          {/* Liberia Flag */}
          <div style={{
            width: '60px',
            height: '40px',
            background: 'linear-gradient(to bottom, #dc2626 0%, #dc2626 20%, #ffffff 20%, #ffffff 40%, #dc2626 40%, #dc2626 60%, #ffffff 60%, #ffffff 80%, #dc2626 80%)',
            borderRadius: '8px',
            border: '2px solid #ffd700',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            position: 'relative',
            animation: 'flagWave 3s ease-in-out infinite reverse'
          }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              width: '20px',
              height: '16px',
              background: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px'
            }}>
              ⭐
            </div>
          </div>
          
          {/* Floating Stars */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            fontSize: '1.5rem',
            animation: 'starFloat 4s ease-in-out infinite',
            color: '#ffd700'
          }}>✨</div>
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            fontSize: '1.2rem',
            animation: 'starFloat 5s ease-in-out infinite 0.5s',
            color: '#ffd700'
          }}>⭐</div>
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '80%',
            fontSize: '1rem',
            animation: 'starFloat 3.5s ease-in-out infinite 1s',
            color: '#ffd700'
          }}>💫</div>
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
          {user && user.userType === 'buyer' && <Link to="/orders">Orders</Link>}
          {user ? (
            <>
              {user.userType === 'seller' && (
                <Link to="/dashboard">Dashboard</Link>
              )}
              {user.userType === 'buyer' && (
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
                          backgroundColor: '#ff4444',
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
              )}
              <span style={{ color: 'white' }}>
                {user.firstName} {user.lastName}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn-secondary"
                style={{ cursor: 'pointer' }}
              >
                Logout
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