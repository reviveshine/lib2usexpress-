import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShippingCalculator from '../components/ShippingCalculator';

const ShippingPage = () => {
  const [carriers, setCarriers] = useState([]);
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  useEffect(() => {
    loadShippingInfo();
  }, []);
  
  const loadShippingInfo = async () => {
    try {
      const [carriersResponse, zonesResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/shipping/carriers`),
        axios.get(`${API_BASE}/api/shipping/zones`)
      ]);
      
      if (carriersResponse.data.success) {
        setCarriers(Object.entries(carriersResponse.data.carriers));
      }
      
      if (zonesResponse.data.success) {
        setZones(zonesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load shipping information:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p>Loading shipping information...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1f2937' }}>
            International Shipping Information
          </h1>
          <p style={{ textAlign: 'center', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            Learn about our shipping services from Liberia to the United States. 
            Get real-time rates and calculate total costs including customs duties.
          </p>
        </div>
        
        {/* Shipping Calculator */}
        <ShippingCalculator />
        
        {/* Supported Routes */}
        {zones && (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
              🌍 Supported Shipping Routes
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#dc2626', marginBottom: '1rem' }}>From: {zones.origin_zones.country}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {zones.origin_zones.major_cities.map((city) => (
                    <span
                      key={city}
                      style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #fecaca'
                      }}
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ color: '#dc2626', marginBottom: '1rem' }}>To: {zones.destination_zones.country}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  All 50 states plus Washington D.C. ({zones.destination_zones.states.length} destinations)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                  {zones.destination_zones.states.slice(0, 10).map((state) => (
                    <span
                      key={state.code}
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '0.15rem 0.3rem',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      {state.code}
                    </span>
                  ))}
                  <span style={{ color: '#6b7280', fontSize: '0.7rem', alignSelf: 'center' }}>
                    +{zones.destination_zones.states.length - 10} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Available Carriers */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            📦 Shipping Carriers
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {carriers.map(([carrierId, carrier]) => (
              <div
                key={carrierId}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f9fafb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
                      {carrier.name}
                    </h4>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {carrier.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                      <span>📍 {carrier.coverage}</span>
                      <span>📱 Tracking: {carrier.tracking ? 'Yes' : 'No'}</span>
                      <span>🛡️ Insurance: {carrier.insurance === true ? 'Included' : carrier.insurance}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 style={{ color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    Services:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {carrier.services.map((service) => (
                      <div
                        key={service.code}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: '#6b7280'
                        }}
                      >
                        <span>{service.name}</span>
                        <span>{service.transit_days} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shipping Information */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
            📋 Important Shipping Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>
                🏷️ Customs & Duties
              </h4>
              <ul style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '1rem' }}>
                <li>All shipments are subject to U.S. customs inspection</li>
                <li>Duties and taxes are estimated (typically 5-8% of value)</li>
                <li>Recipients are responsible for customs charges</li>
                <li>Proper documentation is required for all shipments</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>
                📦 Packaging Requirements
              </h4>
              <ul style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '1rem' }}>
                <li>Items must be securely packaged for international shipping</li>
                <li>Fragile items require special handling surcharges</li>
                <li>Maximum package dimensions vary by carrier</li>
                <li>Weight limits apply (typically 30kg per package)</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>
                🚫 Prohibited Items
              </h4>
              <ul style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '1rem' }}>
                <li>Hazardous materials and chemicals</li>
                <li>Perishable food items</li>
                <li>Live animals or plants</li>
                <li>Firearms and weapons</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ color: '#dc2626', marginBottom: '0.5rem', fontSize: '1rem' }}>
                ⏱️ Transit Times
              </h4>
              <ul style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.6', paddingLeft: '1rem' }}>
                <li>Express services: 1-3 business days</li>
                <li>Standard services: 3-6 business days</li>
                <li>Economy services: 5-10 business days</li>
                <li>Delays may occur due to customs processing</li>
              </ul>
            </div>
          </div>
          
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ color: '#1e40af', fontSize: '0.9rem', margin: 0 }}>
              💡 <strong>Tip:</strong> For the most accurate shipping rates and delivery times, 
              use our shipping calculator above with your specific package dimensions and destination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;