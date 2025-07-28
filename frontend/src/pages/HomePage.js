import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Liberia2USA Express</h1>
          <p>
            🇱🇷 Celebrating Liberian Independence Day! 🇱🇷<br />
            Your trusted platform for international shipping from Liberia to all U.S. states
          </p>
          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '1rem', 
            borderRadius: '10px', 
            marginTop: '1rem',
            border: '2px solid #ffd700' 
          }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ffd700' }}>
              🎉 Special Independence Day Offers Available! 🎉
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/marketplace" className="btn-primary">
              🛍️ Browse Products
            </Link>
            <Link to="/register" className="btn-secondary">
              🚀 Start Selling
            </Link>
          </div>
        </div>
      </section>
      
      <section style={{ padding: '4rem 0', backgroundColor: 'white' }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '3rem', 
            color: '#dc2626',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            🇱🇷 Celebrating Liberian Heritage 🇱🇷
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px',
              border: '3px solid #dc2626',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>🚚 International Shipping</h3>
              <p>Seamless shipping from Liberia to all U.S. states with real-time tracking and multiple carrier options. Supporting Liberian businesses worldwide!</p>
            </div>
            
            <div style={{ 
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px',
              border: '3px solid #dc2626',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>🛡️ Secure Platform</h3>
              <p>End-to-end encrypted chat, secure payments, and verified seller accounts for safe transactions. Your trust is our priority!</p>
            </div>
            
            <div style={{ 
              padding: '2rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px',
              border: '3px solid #dc2626',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>💳 Multiple Payment Options</h3>
              <p>Support for credit cards, PayPal, mobile money, and other convenient payment methods. Making commerce accessible to all!</p>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
              🎊 Happy Independence Day, Liberia! 🎊
            </h3>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
              Today we celebrate the freedom, resilience, and bright future of Liberia. 
              Join us in connecting Liberian entrepreneurs with the world through our platform!
            </p>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/marketplace" className="btn-secondary" style={{ 
                backgroundColor: '#ffd700', 
                color: '#dc2626',
                fontWeight: 'bold',
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}>
                🛍️ Shop Liberian Products Now!
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;