import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001',
});

// Store auth context reference (will be set when auth context is available)
let authContextRef = null;

export const setAuthContext = (authContext) => {
  authContextRef = authContext;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh the token
      if (authContextRef && authContextRef.refreshAccessToken) {
        try {
          console.log('🔄 Attempting to refresh expired token');
          
          const newToken = await authContextRef.refreshAccessToken();
          
          if (newToken) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('🔄 Token refresh failed:', refreshError);
          
          // Refresh failed, redirect to login
          if (authContextRef && authContextRef.logout) {
            authContextRef.logout();
          }
          
          // Redirect to login page
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;