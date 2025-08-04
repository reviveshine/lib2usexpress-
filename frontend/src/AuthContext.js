import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setAuthContext } from './utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState(null);

  // Get API base URL
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    checkAuthStatus();
    
    // Cleanup interval on unmount
    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Set up token refresh if we have a refresh token
        if (refreshToken) {
          setupTokenRefresh(refreshToken);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearAuthData();
      }
    }
    setLoading(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('cart');
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      setTokenRefreshInterval(null);
    }
  };

  const setupTokenRefresh = (refreshToken) => {
    // Clear any existing interval
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
    }
    
    // Refresh token every 6 hours (access token expires in 7 days, but refresh proactively)
    const refreshIntervalMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    
    const interval = setInterval(async () => {
      await refreshAccessToken(refreshToken);
    }, refreshIntervalMs);
    
    setTokenRefreshInterval(interval);
  };

  const refreshAccessToken = async (currentRefreshToken = null) => {
    try {
      const refreshToken = currentRefreshToken || localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.warn('No refresh token available');
        logout();
        return null;
      }

      const response = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refresh_token: refreshToken
      });

      if (response.data.success) {
        const { access_token, refresh_token: new_refresh_token } = response.data;
        
        // Update tokens in localStorage
        localStorage.setItem('auth_token', access_token);
        if (new_refresh_token) {
          localStorage.setItem('refresh_token', new_refresh_token);
          setupTokenRefresh(new_refresh_token);
        }
        
        console.log('🔄 Token refreshed successfully');
        return access_token;
      } else {
        throw new Error('Token refresh failed');
      }
      
    } catch (error) {
      console.error('🔄 Token refresh error:', error);
      
      if (error.response?.status === 401) {
        console.warn('🔄 Refresh token expired, logging out');
        logout();
      }
      
      return null;
    }
  };

  const login = (userData, token, refreshToken = null) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      setupTokenRefresh(refreshToken);
    }
    
    setUser(userData);
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    checkAuthStatus,
    refreshAccessToken
  };

  // Set auth context reference for axios interceptor
  useEffect(() => {
    setAuthContext(value);
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };