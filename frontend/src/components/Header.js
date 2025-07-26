import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCart, { useShoppingCart } from './ShoppingCart';
import { useAuth } from '../AuthContext';

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { getTotalItems } = useShoppingCart();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
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
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    onClick={() => setIsCartOpen(true)}
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
  );
};

export default Header;