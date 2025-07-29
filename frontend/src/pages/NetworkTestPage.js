import React, { useState } from 'react';

const NetworkTestPage = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testNetworkConnection = async () => {
    setLoading(true);
    setTestResult('Testing network connection...');
    
    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      console.log('Testing API_BASE:', API_BASE);
      
      // Test health endpoint
      const healthResponse = await fetch(`${API_BASE}/health`);
      const healthData = await healthResponse.json();
      
      setTestResult(`✅ Connection successful!
API Base: ${API_BASE}
Status: ${healthData.status}
Message: ${healthData.message}
Database Connected: ${healthData.database_connected}`);
      
    } catch (error) {
      console.error('Network test failed:', error);
      setTestResult(`❌ Connection failed:
Error: ${error.message}
API Base: ${process.env.REACT_APP_BACKEND_URL}
Please check the browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔍 Network Connection Test</h1>
      <p>This page helps test the connection between frontend and backend.</p>
      
      <button 
        onClick={testNetworkConnection}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Testing...' : '🚀 Test Network Connection'}
      </button>
      
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        minHeight: '100px',
        whiteSpace: 'pre-line',
        fontFamily: 'monospace'
      }}>
        {testResult || 'Click the button above to test network connection'}
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
        <p><strong>Current Configuration:</strong></p>
        <p>API Base URL: {process.env.REACT_APP_BACKEND_URL}</p>
        <p>Test URL: {process.env.REACT_APP_BACKEND_URL}/health</p>
      </div>
    </div>
  );
};

export default NetworkTestPage;