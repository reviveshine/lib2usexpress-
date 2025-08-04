import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    location: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Enhanced client-side validation
    const errors = [];
    
    // Name validation
    if (formData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    if (formData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }
    
    // Email validation (basic pattern check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    // Location validation based on user type
    const location = formData.location.toLowerCase().trim();
    
    if (formData.userType === 'seller' && !location.includes('liberia')) {
      errors.push('Sellers must be located in Liberia (e.g., "Monrovia, Liberia")');
    }

    if (formData.userType === 'buyer' && !(location.includes('usa') || location.includes('united states') || location.includes('america'))) {
      errors.push('Buyers must be located in the USA (e.g., "New York, USA" or "California, United States")');
    }
    
    // Phone validation (optional but if provided should be valid)
    if (formData.phone && formData.phone.length < 10) {
      errors.push('Please enter a valid phone number (at least 10 digits)');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]); // Show first error
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const { confirmPassword, ...registrationData } = formData;
      
      console.log('🔐 Attempting registration with data:', {
        ...registrationData,
        password: '[HIDDEN]'
      });
      console.log('🔐 Using API_BASE:', API_BASE);
      
      const response = await axios.post(`${API_BASE}/api/auth/register`, registrationData);

      console.log('🔐 Registration response:', response.status);
      
      if (response.data.success) {
        // Use AuthContext login method instead of manual localStorage
        login(response.data.user, response.data.token);
        
        // Role-based redirection with success message
        const userType = response.data.user.userType;
        console.log('🔐 Registration successful for userType:', userType);
        
        // Show success message briefly
        setError('');
        
        if (userType === 'seller') {
          console.log('🏪 Redirecting seller to dashboard');
          navigate('/dashboard', { 
            state: { 
              message: `🎉 Welcome to Liberia2USA Express, ${response.data.user.firstName}! Happy Independence Day! 🇱🇷` 
            }
          });
        } else {
          console.log('🛍️ Redirecting buyer to marketplace');
          navigate('/marketplace', { 
            state: { 
              message: `🎉 Welcome to Liberia2USA Express, ${response.data.user.firstName}! Start shopping! 🛍️` 
            }
          });
        }
      } else {
        const errorMessage = response.data.message || 'Registration failed';
        console.error('🔐 Registration error:', response.data);
        setError(errorMessage);
      }
    } catch (error) {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      console.error('🔐 Registration request failed:', error);
      console.error('🔐 Error details:', {
        message: error.message,
        code: error.code,
        request: !!error.request,
        response: !!error.response,
        responseStatus: error.response?.status,
        responseData: error.response?.data
      });
      
      if (error.response) {
        if (error.response.status === 422) {
          const validationErrors = error.response.data.detail;
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            const firstError = validationErrors[0];
            setError(`${firstError.msg.replace('Value error, ', '')}`);
          } else {
            setError('Please check your input fields and try again');
          }
        } else if (error.response.status === 409) {
          setError('An account with this email already exists. Please try logging in instead.');
        } else {
          setError(error.response.data.message || error.response.data.detail || 'Registration failed');
        }
      } else if (error.request) {
        // More detailed network error message
        console.error('🔐 Network request details:', error.request);
        setError(`Network error: Unable to connect to server at ${API_BASE}. Please check that the backend is running.`);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      {/* Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '250px',
        height: '180px',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 250 180\'%3E%3Cpath d=\'M40 70 Q80 30 120 50 L160 60 Q200 70 220 110 L210 140 Q190 160 160 165 L120 168 Q80 165 60 140 L40 115 Q35 90 40 70 Z\' fill=\'%23ffd700\' opacity=\'0.12\'/%3E%3Ctext x=\'120\' y=\'120\' font-family=\'Arial\' font-size=\'10\' fill=\'%23ffd700\' text-anchor=\'middle\' opacity=\'0.5\'%3ELiberia%3C/text%3E%3C/svg%3E")',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        opacity: 0.8,
        animation: 'mapFloat 30s ease-in-out infinite'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          maxWidth: '550px',
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
              fontSize: '3.2rem',
              fontWeight: '900',
              marginBottom: '0.8rem',
              fontFamily: 'Georgia, serif'
            }}>
              Join Our Community! 🇱🇷🇺🇸
            </h2>
            <p style={{
              color: '#6b7280',
              fontSize: '1.3rem',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              🌟 <span style={{color: '#DAA520', fontWeight: 'bold'}}>Bridge Two Nations</span> 🌟<br />
              Create your Liberia2USA Express account today
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  👤 First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
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
                    e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  👤 Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
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
                    e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

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
                  e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  🏪 Account Type
                </label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
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
                    e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="buyer">🛍️ Buyer (USA)</option>
                  <option value="seller">🏪 Seller (Liberia)</option>
                </select>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  📞 Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
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
                    e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontWeight: '600'
              }}>
                📍 Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder={formData.userType === 'seller' ? 'City, Liberia' : 'City, State, USA'}
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
                  e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  🔒 Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      paddingRight: '3rem',
                      border: '2px solid rgba(218, 165, 32, 0.3)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ffd700';
                      e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  🔒 Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      paddingRight: '3rem',
                      border: '2px solid rgba(218, 165, 32, 0.3)',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ffd700';
                      e.target.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(218, 165, 32, 0.3)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.2rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3C3B6E 0%, #B22234 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(60, 59, 110, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '2rem'
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
              {loading ? '🔄 Creating Account...' : '🚀 Create Account & Join the Journey!'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '2rem',
            borderTop: '2px solid rgba(255, 215, 0, 0.2)'
          }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Already have an account?
            </p>
            <Link
              to="/login"
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
              🔑 Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;