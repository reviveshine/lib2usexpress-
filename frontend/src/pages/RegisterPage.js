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
      console.error('🔐 Registration request failed:', error);
      
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
        setError('Network error: Please check your internet connection and try again');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
            Create Your Account
          </h2>
          
          {error && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '5px',
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Account Type
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              >
                <option value="buyer">Buyer (USA)</option>
                <option value="seller">Seller (Liberia)</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Location {formData.userType === 'seller' ? '(Must be in Liberia)' : '(Must be in USA)'}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={formData.userType === 'seller' ? 'e.g., Monrovia, Liberia' : 'e.g., New York, USA'}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: loading ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#dc2626', textDecoration: 'none' }}>
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;