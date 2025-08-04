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
              gap: '2rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginTop: '1rem'
            }}>
              <Link to="/marketplace" style={{
                background: 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
                color: 'white',
                padding: '1.2rem 3rem',
                borderRadius: '35px',
                textDecoration: 'none',
                fontSize: '1.3rem',
                fontWeight: '700',
                boxShadow: '0 10px 30px rgba(60, 59, 110, 0.3)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '3px solid #DAA520',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px) scale(1.02)';
                e.target.style.boxShadow = '0 15px 40px rgba(60, 59, 110, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(60, 59, 110, 0.3)';
              }}>
                🛍️ Explore Marketplace
              </Link>
              <Link to="/register" style={{
                background: 'rgba(255, 255, 255, 0.98)',
                color: '#3C3B6E',
                padding: '1.2rem 3rem',
                borderRadius: '35px',
                textDecoration: 'none',
                fontSize: '1.3rem',
                fontWeight: '700',
                border: '3px solid #DAA520',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 10px 30px rgba(218, 165, 32, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.color = '#3C3B6E';
                e.target.style.transform = 'translateY(-5px) scale(1.02)';
                e.target.style.boxShadow = '0 15px 40px rgba(218, 165, 32, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.98)';
                e.target.style.color = '#3C3B6E';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(218, 165, 32, 0.25)';
              }}>
                🚀 Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section style={{ 
        padding: '6rem 0', 
        background: 'rgba(255, 255, 255, 0.98)',
        position: 'relative',
        borderTop: '4px solid #DAA520'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '5rem', 
            background: 'linear-gradient(45deg, #B22234, #3C3B6E, #DAA520)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '3.5rem',
            fontWeight: '900',
            fontFamily: 'Georgia, serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🌟 Why Choose Liberia2USA Express? 🌟
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '3rem',
            marginBottom: '5rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              border: '3px solid rgba(218, 165, 32, 0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.08)';
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #B22234, #DAA520, #3C3B6E)'
              }}></div>
              <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🇱🇷</div>
              <h3 style={{ 
                color: '#3C3B6E', 
                marginBottom: '1.5rem',
                fontSize: '1.7rem',
                fontWeight: '700'
              }}>
                Authentic Liberian Heritage
              </h3>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.7',
                fontSize: '1.1rem'
              }}>
                Direct from skilled Liberian artisans, farmers, and craftspeople. Every product carries the authentic spirit of Liberian culture, tradition, and exceptional craftsmanship passed down through generations.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              border: '3px solid rgba(218, 165, 32, 0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.08)';
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #B22234, #DAA520, #3C3B6E)'
              }}></div>
              <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🚚</div>
              <h3 style={{ 
                color: '#B22234', 
                marginBottom: '1.5rem',
                fontSize: '1.7rem',
                fontWeight: '700'
              }}>
                Professional International Shipping
              </h3>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.7',
                fontSize: '1.1rem'
              }}>
                Secure, reliable shipping services with comprehensive tracking and insurance. Your precious Liberian treasures are delivered safely to any U.S. address with professional care and attention.
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              padding: '3rem',
              borderRadius: '25px',
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.08)',
              textAlign: 'center',
              border: '3px solid rgba(218, 165, 32, 0.2)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 25px 70px rgba(0, 0, 0, 0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.08)';
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(90deg, #B22234, #DAA520, #3C3B6E)'
              }}></div>
              <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>🤝</div>
              <h3 style={{ 
                color: '#3C3B6E', 
                marginBottom: '1.5rem',
                fontSize: '1.7rem',
                fontWeight: '700'
              }}>
                Trust & Cultural Connection
              </h3>
              <p style={{ 
                color: '#374151', 
                lineHeight: '1.7',
                fontSize: '1.1rem'
              }}>
                Built by Liberians for Americans who appreciate authentic African culture. Secure transactions, verified sellers, and a community that celebrates the rich heritage connecting our two great nations.
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