import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, formData);

      if (response.data.success) {
        // Use AuthContext login method instead of manual localStorage
        login(response.data.user, response.data.token);
        
        // Role-based redirection
        const userType = response.data.user.userType;
        console.log('🔐 Login successful for userType:', userType);
        
        if (userType === 'seller') {
          console.log('🏪 Redirecting seller to dashboard');
          navigate('/dashboard');
        } else {
          console.log('🛍️ Redirecting buyer to marketplace');
          navigate('/marketplace');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '300px',
        height: '200px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 300 200\'%3E%3Cpath d=\'M50 80 Q100 40 150 60 L200 70 Q250 80 270 120 L260 160 Q240 180 200 185 L150 188 Q100 185 70 160 L50 130 Q45 105 50 80 Z\' fill=\'%23ffd700\' opacity=\'0.15\'/%3E%3Ctext x=\'150\' y=\'140\' font-family=\'Arial\' font-size=\'12\' fill=\'%23ffd700\' text-anchor=\'middle\' opacity=\'0.6\'%3ELiberia%3C/text%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.6,
        animation: 'mapFloat 25s ease-in-out infinite'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: '450px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(29, 78, 216, 0.2)',
          backdropFilter: 'blur(20px)',
          border: '3px solid rgba(255, 215, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Professional Patriotic Header Stripe */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #B22234, #DAA520, #3C3B6E)'
          }}></div>

          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{
              background: 'linear-gradient(45deg, #B22234, #3C3B6E, #DAA520)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '3rem',
              fontWeight: '900',
              marginBottom: '0.8rem',
              fontFamily: 'Georgia, serif'
            }}>
              Welcome Back! 🇺🇸
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '1.2rem',
              fontWeight: '400'
            }}>
              Sign in to your Liberia2USA Express account
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '600'
              }}>
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid rgba(218, 165, 32, 0.3)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ffd700';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '600'
              }}>
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ffd700';
                  e.target.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    color: '#1d4ed8', 
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                  onMouseLeave={(e) => e.target.style.color = '#1d4ed8'}
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(60, 59, 110, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(60, 59, 110, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(60, 59, 110, 0.3)';
                }
              }}
            >
              {loading ? '🔄 Signing In...' : '🚀 Sign In to Your Account'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '2px solid rgba(255, 215, 0, 0.2)'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              New to Liberia2USA Express?
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#1d4ed8',
                textDecoration: 'none',
                borderRadius: '25px',
                fontWeight: '600',
                border: '2px solid #DAA520',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#DAA520';
                e.target.style.color = '#1d4ed8';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.color = '#1d4ed8';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              🌟 Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;