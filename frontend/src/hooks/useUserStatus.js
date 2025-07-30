import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export const useUserStatus = () => {
  const { user } = useAuth();
  const heartbeatIntervalRef = useRef(null);
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const updateUserStatus = async (status) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await axios.post(
        `${API_BASE}/api/user/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const sendHeartbeat = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      await axios.post(
        `${API_BASE}/api/user/heartbeat`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Set user as online when they log in
      updateUserStatus('online');

      // Start heartbeat interval (every 2 minutes)
      heartbeatIntervalRef.current = setInterval(sendHeartbeat, 2 * 60 * 1000);

      // Set up event listeners for page visibility
      const handleVisibilityChange = () => {
        if (document.hidden) {
          updateUserStatus('away');
        } else {
          updateUserStatus('online');
          // Send immediate heartbeat when page becomes visible
          sendHeartbeat();
        }
      };

      const handleBeforeUnload = () => {
        updateUserStatus('offline');
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        // Clean up
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        // Set user as offline when component unmounts
        updateUserStatus('offline');
      };
    }
  }, [user]);

  return {
    updateUserStatus,
    sendHeartbeat
  };
};