import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
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
    <div className="page">
      <div className="registration-form-container container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
        {/* Independence Day Header */}
        <div className="registration-header" style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '15px 15px 0 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            fontSize: '2rem',
            animation: 'sparkleMove 3s linear infinite'
          }}>✨</div>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '30px',
            fontSize: '1.5rem',
            animation: 'sparkleMove 3s linear infinite 1s'
          }}>⭐</div>
          
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🇱🇷 Join Liberia2USA Express 🇱🇷
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: '0.9',
            marginBottom: '0'
          }}>
            🎉 Celebrating Independence Day - Connect Liberian Heritage to American Markets! 🎉
          </p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '2.5rem',
          borderRadius: '0 0 15px 15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '3px solid #ffd700'
        }}>
          {error && (
            <div className="error-message" style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fed7d7 100%)',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              border: '2px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span style={{ fontWeight: '500' }}>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Name Fields */}
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  👤 First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your first name"
                  className="registration-form-input"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  👤 Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your last name"
                  className="registration-form-input"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Account Type */}
            <div className="form-group">
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                🏷️ Account Type *
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="registration-form-input"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                <option value="buyer">🛍️ Buyer (USA) - Shop Liberian Products</option>
                <option value="seller">🏪 Seller (Liberia) - Sell to USA Market</option>
              </select>
            </div>
            
            {/* Email */}
            <div className="form-group">
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                📧 Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="registration-form-input"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                📱 Phone Number <span style={{ color: '#6b7280', fontWeight: '400' }}>(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={formData.userType === 'seller' ? '+231 XXX XXXX' : '+1 XXX XXX XXXX'}
                className="registration-form-input"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                📍 Location * 
                <span style={{ 
                  color: formData.userType === 'seller' ? '#dc2626' : '#2563eb',
                  fontWeight: '500',
                  fontSize: '0.85rem'
                }}>
                  {formData.userType === 'seller' ? '(Must be in Liberia 🇱🇷)' : '(Must be in USA 🇺🇸)'}
                </span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={formData.userType === 'seller' ? 'e.g., Monrovia, Liberia' : 'e.g., New York, USA'}
                required
                className="registration-form-input"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Password Fields */}
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  🔒 Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 6 characters"
                    className={`registration-form-input ${
                      formData.password.length === 0 ? '' :
                      formData.password.length < 6 ? 'password-strength-weak' :
                      formData.password.length < 10 ? 'password-strength-medium' : 'password-strength-strong'
                    }`}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      paddingRight: '3rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
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
                <label className="form-label" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}>
                  🔒 Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Repeat password"
                    className={`registration-form-input ${
                      formData.confirmPassword.length === 0 ? '' :
                      formData.password !== formData.confirmPassword ? 'password-strength-weak' : 'password-strength-strong'
                    }`}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      paddingRight: '3rem',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
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
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="registration-submit-btn"
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Creating Your Account...
                </span>
              ) : (
                '🚀 Create Account & Join the Celebration!'
              )}
            </button>
          </form>
          
          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
            <p style={{ color: '#6b7280', margin: '0', fontSize: '1rem' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#dc2626', 
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.color = '#dc2626'}
              >
                🔑 Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;