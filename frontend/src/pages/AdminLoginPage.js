import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();

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

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Admin Header */}
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
          }}>⚡</div>
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '30px',
            fontSize: '1.2rem',
            animation: 'sparkleMove 3s linear infinite 1s'
          }}>🛡️</div>
          
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            🏛️ Admin Portal 🏛️
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            opacity: '0.9',
            marginBottom: '0'
          }}>
            Liberia2USA Express Administration
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
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}>
                👤 Admin Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@liberia2usa.com"
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

            {/* Password Field */}
            <div className="form-group">
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
                  placeholder="Enter your admin password"
                  className="registration-form-input"
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

            {/* Login Button */}
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
                  Authenticating...
                </span>
              ) : (
                '🚀 Access Admin Dashboard'
              )}
            </button>
          </form>

          {/* Default Credentials Note */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '10px',
            border: '1px solid #0ea5e9'
          }}>
            <p style={{ color: '#0369a1', margin: '0', fontSize: '0.9rem' }}>
              🔑 <strong>Default Login:</strong> admin@liberia2usa.com / Admin@2025!
            </p>
            <p style={{ color: '#7c2d12', margin: '0.5rem 0 0', fontSize: '0.8rem' }}>
              ⚠️ Change password after first login
            </p>
          </div>

          {/* Security Notice */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '8px',
            border: '1px solid #16a34a'
          }}>
            <p style={{ color: '#15803d', margin: '0', fontSize: '0.85rem' }}>
              🔒 Secure admin access with encrypted authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;