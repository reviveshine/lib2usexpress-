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