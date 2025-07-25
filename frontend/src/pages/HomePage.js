import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Liberia2USA Express</h1>
          <p>
            Your trusted platform for international shipping from Liberia to all U.S. states
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/marketplace" className="btn-primary">
              Browse Products
            </Link>
            <Link to="/register" className="btn-secondary">
              Start Selling
            </Link>
          </div>
        </div>
      </section>
      
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>🚚 International Shipping</h3>
              <p>Seamless shipping from Liberia to all U.S. states with real-time tracking and multiple carrier options.</p>
            </div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>📱 Secure Platform</h3>
              <p>End-to-end encrypted chat, secure payments, and verified seller accounts for safe transactions.</p>
            </div>
            <div style={{ padding: '2rem' }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>💳 Multiple Payment Options</h3>
              <p>Support for credit cards, PayPal, mobile money, and other convenient payment methods.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;