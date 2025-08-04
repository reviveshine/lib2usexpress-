import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="page">
      <section style={{
        background: `
          linear-gradient(135deg, 
            #3C3B6E 0%, 
            rgba(255, 255, 255, 0.9) 40%, 
            rgba(255, 255, 255, 0.95) 60%, 
            #B22234 100%
          ),
          url('https://images.unsplash.com/photo-1532154078493-c1c3eef2023c')
        `,
        backgroundSize: 'cover, 100% auto',
        backgroundPosition: 'center, center right',
        backgroundBlendMode: 'overlay, normal',
        padding: '8rem 0',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Realistic Liberia Map Background */}
        <div style={{
          position: 'absolute',
          top: '8%',
          right: '-3%',
          width: '550px',
          height: '450px',
          backgroundImage: 'url("https://images.unsplash.com/photo-1709226660708-38e861588890")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          filter: 'sepia(90%) saturate(120%) hue-rotate(25deg) brightness(1.4)',
          animation: 'mapFloatRealistic 25s ease-in-out infinite',
          zIndex: 1
        }}></div>

        {/* Professional overlay pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Cg fill='%23DAA520' opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Ccircle cx='10' cy='10' r='0.5'/%3E%3Ccircle cx='50' cy='10' r='0.7'/%3E%3Ccircle cx='10' cy='50' r='0.6'/%3E%3Ccircle cx='50' cy='50' r='0.8'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          zIndex: 0
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: '900',
              marginBottom: '1.5rem',
              textShadow: '4px 4px 8px rgba(0,0,0,0.4)',
              background: 'linear-gradient(45deg, #B22234 0%, #DAA520 20%, #ffffff 40%, #DAA520 60%, #3C3B6E 80%, #B22234 100%)',
              backgroundSize: '600% 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'textShimmerRealistic 6s ease-in-out infinite',
              fontFamily: 'Georgia, serif',
              letterSpacing: '2px'
            }}>
              Liberia2USA Express
            </h1>
            
            <p style={{
              fontSize: '1.5rem',
              marginBottom: '2.5rem',
              textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
              color: 'white',
              maxWidth: '900px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.5',
              fontWeight: '300'
            }}>
              🌍 Bridging Two Nations Through Authentic Commerce 🌍<br />
              <span style={{ fontSize: '1.2rem', opacity: '0.95' }}>
                Your premier destination for genuine Liberian products delivered across America
              </span>
            </p>
            
            <div style={{ 
              background: 'rgba(218, 165, 32, 0.15)', 
              padding: '2.5rem', 
              borderRadius: '25px', 
              marginBottom: '3.5rem',
              border: '2px solid rgba(218, 165, 32, 0.3)',
              backdropFilter: 'blur(15px)',
              maxWidth: '750px',
              margin: '0 auto 3.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <p style={{ 
                fontSize: '1.4rem', 
                fontWeight: '700', 
                color: '#DAA520',
                textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                marginBottom: '0.8rem'
              }}>
                🤝 Connecting Liberian Heritage with American Opportunity
              </p>
              <p style={{
                fontSize: '1.1rem',
                color: 'white',
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                fontWeight: '400',
                opacity: '0.95'
              }}>
                From traditional crafts to premium coffee beans - experience authentic Liberian excellence delivered to your doorstep with care and cultural pride
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
      
      <section style={{ 
        padding: '5rem 0', 
        background: 'rgba(255, 255, 255, 0.95)',
        position: 'relative'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '4rem', 
            background: 'linear-gradient(45deg, #dc2626, #1d4ed8)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '3rem',
            fontWeight: 'bold'
          }}>
            🌟 Why Choose Liberia2USA Express? 🌟
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '2.5rem',
            marginBottom: '4rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(29, 78, 216, 0.15)',
              textAlign: 'center',
              border: '3px solid rgba(255, 215, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #dc2626, #ffd700, #1d4ed8)'
              }}></div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🇱🇷</div>
              <h3 style={{ 
                color: '#1d4ed8', 
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Authentic Liberian Products
              </h3>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>
                Direct from Liberian artisans and farmers. Every product tells a story of rich cultural heritage and exceptional craftsmanship.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(29, 78, 216, 0.15)',
              textAlign: 'center',
              border: '3px solid rgba(255, 215, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #dc2626, #ffd700, #1d4ed8)'
              }}></div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ 
                color: '#dc2626', 
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Reliable International Shipping
              </h3>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>
                Professional shipping services with real-time tracking. Your Liberian treasures delivered safely to any U.S. address.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '2.5rem',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(29, 78, 216, 0.15)',
              textAlign: 'center',
              border: '3px solid rgba(255, 215, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #dc2626, #ffd700, #1d4ed8)'
              }}></div>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ 
                color: '#1d4ed8', 
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Community & Trust
              </h3>
              <p style={{ color: '#374151', lineHeight: '1.6' }}>
                Built by Liberians for Americans who love Liberian culture. Secure transactions and verified sellers you can trust.
              </p>
            </div>
          </div>
          
          {/* Call to Action Section */}
          <div style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #dc2626 100%)',
            padding: '3rem',
            borderRadius: '25px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 100\'%3E%3Cpath d=\'M0 30 Q50 20 100 30 T200 30 L200 100 L0 100 Z\' fill=\'%23ffd700\' opacity=\'0.1\'/%3E%3C/svg%3E")',
              backgroundSize: '200px 100px',
              backgroundRepeat: 'repeat-x',
              backgroundPosition: 'bottom'
            }}></div>
            
            <h3 style={{ 
              fontSize: '2.5rem', 
              marginBottom: '1rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 1
            }}>
              🌍 Ready to Bridge Two Worlds? 🌍
            </h3>
            <p style={{ 
              fontSize: '1.2rem', 
              marginBottom: '2rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 1
            }}>
              Join thousands connecting Liberian excellence with American opportunity
            </p>
            <Link to="/register" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1d4ed8',
              padding: '1.2rem 3rem',
              borderRadius: '30px',
              textDecoration: 'none',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              border: '3px solid #ffd700',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}>
              🚀 Start Your Journey Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;