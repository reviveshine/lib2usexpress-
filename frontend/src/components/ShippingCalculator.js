import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShippingCalculator = ({ product, onShippingCalculated }) => {
  const [shippingData, setShippingData] = useState({
    destination_state: '',
    weight: product?.weight || 1.0,
    length: product?.dimensions?.length || 10,
    width: product?.dimensions?.width || 10,
    height: product?.dimensions?.height || 10,
    value: product?.price || 100
  });
  
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState([]);
  const [error, setError] = useState('');
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const loadStates = React.useCallback(async () => {
    setStatesLoading(true);
    try {
      console.log('Loading states from:', `${API_BASE}/api/shipping/zones`);
      const response = await axios.get(`${API_BASE}/api/shipping/zones`);
      console.log('States API response:', response.data);
      
      if (response.data.success && response.data.destination_zones && response.data.destination_zones.states) {
        setStates(response.data.destination_zones.states);
        console.log('States loaded successfully:', response.data.destination_zones.states.length, 'states');
      } else {
        console.error('Invalid response format:', response.data);
        setError('Failed to load destination states');
      }
    } catch (error) {
      console.error('Failed to load states:', error);
      setError('Failed to load destination states. Please try again.');
    } finally {
      setStatesLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadStates();
  }, [loadStates]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const calculateShipping = async () => {
    if (!shippingData.destination_state) {
      setError('Please select a destination state');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/shipping/estimate`,
        {
          origin_city: 'Monrovia',
          destination_state: shippingData.destination_state,
          weight: parseFloat(shippingData.weight),
          length: parseFloat(shippingData.length),
          width: parseFloat(shippingData.width), 
          height: parseFloat(shippingData.height),
          value: parseFloat(shippingData.value)
        }
      );
      
      if (response.data.success) {
        setEstimates(response.data.estimates);
        if (onShippingCalculated) {
          onShippingCalculated(response.data.estimates);
        }
      } else {
        setError('Failed to calculate shipping rates');
      }
    } catch (error) {
      console.error('Shipping calculation error:', error);
      setError(error.response?.data?.detail || 'Failed to calculate shipping rates');
    }
    
    setLoading(false);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>
        🚚 International Shipping Calculator
      </h3>
      
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Calculate shipping costs from Liberia to any U.S. state with real-time rates from multiple carriers.
      </p>
      
      {/* Shipping Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Destination State *
          </label>
          <select
            name="destination_state"
            value={shippingData.destination_state}
            onChange={handleInputChange}
            required
            disabled={statesLoading}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem',
              backgroundColor: statesLoading ? '#f3f4f6' : 'white',
              cursor: statesLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">
              {statesLoading ? 'Loading states...' : 'Select State'}
            </option>
            {!statesLoading && states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            name="weight"
            value={shippingData.weight}
            onChange={handleInputChange}
            min="0.1"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Length (cm)
          </label>
          <input
            type="number"
            name="length"
            value={shippingData.length}
            onChange={handleInputChange}
            min="1"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Width (cm)
          </label>
          <input
            type="number"
            name="width"
            value={shippingData.width}
            onChange={handleInputChange}
            min="1"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Height (cm)
          </label>
          <input
            type="number"
            name="height"
            value={shippingData.height}
            onChange={handleInputChange}
            min="1"
            step="0.1"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
            Value (USD)
          </label>
          <input
            type="number"
            name="value"
            value={shippingData.value}
            onChange={handleInputChange}
            min="1"
            step="0.01"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>
      
      {/* Calculate Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={calculateShipping}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Calculating...' : '📊 Calculate Shipping Rates'}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fef2f2',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #fecaca',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      {/* Shipping Estimates */}
      {estimates.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '1rem', color: '#1f2937' }}>
            Shipping Options
          </h4>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {estimates.map((estimate, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ color: '#1f2937', fontSize: '1rem' }}>
                      {estimate.service}
                    </strong>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      {estimate.carrier}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>
                      {formatCurrency(estimate.total_cost)}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                      {estimate.transit_days} business days
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  <div>Shipping: {formatCurrency(estimate.shipping_cost)}</div>
                  <div>Customs: {formatCurrency(estimate.customs_duties)}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: '#fef3c7', 
            borderRadius: '5px',
            fontSize: '0.8rem',
            color: '#92400e',
            border: '1px solid #fbbf24'
          }}>
            ⚠️ <strong>Disclaimer:</strong> These are estimates only. Final costs may vary based on actual package contents and customs assessment.
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;