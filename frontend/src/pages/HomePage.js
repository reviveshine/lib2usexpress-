import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page">
      <section style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, rgba(255, 255, 255, 0.9) 50%, #dc2626 100%)',
        padding: '6rem 0',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Background Map */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '500px',
          height: '400px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 500 400\'%3E%3Cpath d=\'M80 100 Q150 50 220 80 L280 90 Q350 110 380 160 L370 240 Q340 300 280 320 L220 330 Q150 320 100 280 L80 220 Q70 160 80 100 Z\' fill=\'%23ffd700\' opacity=\'0.2\' stroke=\'%23ffd700\' stroke-width=\'2\'/%3E%3Ccircle cx=\'180\' cy=\'200\' r=\'4\' fill=\'%23ffd700\'/%3E%3Ctext x=\'220\' y=\'250\' font-family=\'Arial\' font-size=\'20\' fill=\'%23ffd700\' text-anchor=\'middle\' opacity=\'0.7\'%3ELiberia%3C/text%3E%3C/svg%3E")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          animation: 'mapFloat 20s ease-in-out infinite'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #dc2626, #ffd700, #1d4ed8, #ffffff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmer 4s ease-in-out infinite',
              backgroundSize: '400% 400%'
            }}>
              Liberia2USA Express
            </h1>
            
            <p style={{
              fontSize: '1.4rem',
              marginBottom: '2rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              color: 'white',
              maxWidth: '800px',
              margin: '0 auto 2rem'
            }}>
              🌍 Bridging Two Nations Through Commerce 🌍<br />
              Your premier platform for authentic Liberian products delivered across America
            </p>
            
            <div style={{ 
              background: 'rgba(255, 215, 0, 0.2)', 
              padding: '2rem', 
              borderRadius: '20px', 
              marginBottom: '3rem',
              border: '2px solid rgba(255, 215, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              <p style={{ 
                fontSize: '1.3rem', 
                fontWeight: 'bold', 
                color: '#ffd700',
                textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                marginBottom: '0.5rem'
              }}>
                🤝 Connecting Liberian Sellers with American Buyers
              </p>
              <p style={{
                fontSize: '1rem',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}>
                From traditional crafts to premium coffee - bringing Liberian excellence to your doorstep
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap'
            }}>
              <Link to="/marketplace" style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #dc2626 100%)',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(29, 78, 216, 0.4)',
                transition: 'all 0.3s ease',
                border: '2px solid #ffd700',
                position: 'relative',
                overflow: 'hidden'
              }}>
                🛍️ Explore Marketplace
              </Link>
              <Link to="/register" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#1d4ed8',
                padding: '1rem 2.5rem',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                border: '2px solid #ffd700',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
              }}>
                🚀 Become a Seller
              </Link>
            </div>
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