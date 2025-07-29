import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      console.log('🔐 Sending password reset request for:', email);
      
      const response = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });

      console.log('🔐 Password reset response:', response.status);
      
      if (response.data.success) {
        setSuccess(true);
        setEmail(''); // Clear the form
        console.log('🔐 Password reset email sent successfully');
      } else {
        setError('Failed to send password reset email');
      }
    } catch (error) {
      console.error('🔐 Password reset request failed:', error);
      
      if (error.response) {
        setError(error.response.data.detail || 'Failed to send password reset email');
      } else if (error.request) {
        setError('Network error: Unable to connect to server. Please try again.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Independence Day Header */}
        <div style={{
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
            fontSize: '1.5rem',
            animation: 'sparkleMove 3s linear infinite'
          }}>🔑</div>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '30px',
            fontSize: '1.2rem',
            animation: 'sparkleMove 3s linear infinite 1s'
          }}>🔒</div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🇱🇷 Reset Password 🇺🇸
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            opacity: '0.9',
            marginBottom: '0'
          }}>
            Liberia2USA Express Account Recovery
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '2.5rem',
          borderRadius: '0 0 15px 15px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          border: '3px solid #ffd700'
        }}>
          {!success ? (
            <>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  color: '#374151',
                  marginBottom: '1rem'
                }}>
                  Forgot Your Password?
                </h2>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <div className="error-message mb-6" style={{
                  background: 'linear-gradient(135deg, #fef2f2 0%, #fed7d7 100%)',
                  color: '#dc2626',
                  padding: '1rem',
                  borderRadius: '10px',
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your registered email address"
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
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#6b7280', 
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    We'll send a password reset link to this email
                  </p>
                </div>

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
                      Sending Reset Link...
                    </span>
                  ) : (
                    '🚀 Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                color: '#16a34a',
                padding: '2rem',
                borderRadius: '10px',
                border: '2px solid #86efac',
                marginBottom: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#16a34a'
                }}>
                  Reset Link Sent!
                </h3>
                <p style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '0'
                }}>
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem'
              }}>
                <p style={{ 
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <strong>💡 Didn't receive the email?</strong>
                </p>
                <ul style={{ 
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  marginLeft: '1rem',
                  lineHeight: '1.4'
                }}>
                  <li>Check your spam/junk folder</li>
                  <li>Wait a few minutes for delivery</li>
                  <li>Make sure you entered the correct email</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                🔄 Send Another Reset Link
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '10px'
          }}>
            <p style={{ color: '#6b7280', margin: '0', fontSize: '1rem' }}>
              Remember your password?{' '}
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
                🔑 Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;