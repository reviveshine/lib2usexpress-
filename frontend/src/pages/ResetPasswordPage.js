import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const response = await axios.get(`${API_BASE}/api/auth/verify-reset-token/${token}`);
      
      if (response.data.success) {
        setTokenValid(true);
        setUserEmail(response.data.email);
        console.log('🔐 Reset token verified for:', response.data.email);
      } else {
        setError('Invalid or expired reset token');
      }
    } catch (error) {
      console.error('🔐 Token verification failed:', error);
      
      if (error.response) {
        setError(error.response.data.detail || 'Invalid or expired reset token');
      } else {
        setError('Unable to verify reset token. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      console.log('🔐 Resetting password with token');
      
      const response = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token: token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });

      console.log('🔐 Password reset response:', response.status);
      
      if (response.data.success) {
        setSuccess(true);
        console.log('🔐 Password reset successful');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please log in with your new password.' 
            }
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('🔐 Password reset failed:', error);
      
      if (error.response) {
        setError(error.response.data.detail || 'Failed to reset password');
      } else if (error.request) {
        setError('Network error: Unable to connect to server. Please try again.');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    }
    
    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center" style={{ border: '2px solid #ffd700' }}>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link 
                to="/forgot-password"
                className="inline-block w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                🔄 Request New Reset Link
              </Link>
              <Link 
                to="/login"
                className="inline-block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                🔑 Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          }}>🔐</div>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '30px',
            fontSize: '1.2rem',
            animation: 'sparkleMove 3s linear infinite 1s'
          }}>🔑</div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🇱🇷 New Password 🇺🇸
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
                  Set New Password
                </h2>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  Resetting password for: <strong>{userEmail}</strong>
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
                {/* New Password */}
                <div className="form-group">
                  <label className="form-label" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    🔒 New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your new password"
                      className={`registration-form-input ${
                        formData.new_password.length === 0 ? '' :
                        formData.new_password.length < 6 ? 'password-strength-weak' :
                        formData.new_password.length < 10 ? 'password-strength-medium' : 'password-strength-strong'
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
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#6b7280', 
                    marginTop: '0.5rem',
                    marginBottom: '0'
                  }}>
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    🔒 Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your new password"
                      className={`registration-form-input ${
                        formData.confirm_password.length === 0 ? '' :
                        formData.new_password !== formData.confirm_password ? 'password-strength-weak' : 'password-strength-strong'
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
                      Updating Password...
                    </span>
                  ) : (
                    '🚀 Reset Password'
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
                  Password Updated!
                </h3>
                <p style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '1rem'
                }}>
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
                <p style={{ 
                  fontSize: '0.9rem',
                  color: '#059669'
                }}>
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              <Link 
                to="/login"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}
              >
                🔑 Login Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;