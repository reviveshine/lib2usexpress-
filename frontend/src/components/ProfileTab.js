import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const ProfileTab = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [newAddress, setNewAddress] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    country: user?.userType === 'seller' ? 'Liberia' : 'United States',
    postal_code: ''
  });

  const [newShippingAddress, setNewShippingAddress] = useState({
    recipient_name: '',
    street: '',
    city: '',
    state: '',
    country: 'United States',
    postal_code: '',
    phone: ''
  });

  const [newWallet, setNewWallet] = useState({
    provider: 'MTN',
    phone_number: '',
    account_name: ''
  });

  const [newIdentityDoc, setNewIdentityDoc] = useState({
    document_type: 'national_id',
    document_number: '',
    issuing_authority: '',
    expiry_date: '',
    document_image: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicture(reader.result);
        setShowProfilePictureModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfilePicture = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/picture`,
        { profile_picture: newProfilePicture },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowProfilePictureModal(false);
        setNewProfilePicture('');
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/picture`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/address`,
        newAddress,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowAddressModal(false);
        setNewAddress({
          type: 'home',
          street: '',
          city: '',
          state: '',
          country: user?.userType === 'seller' ? 'Liberia' : 'United States',
          postal_code: ''
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleAddShippingAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/shipping-address`,
        newShippingAddress,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setNewShippingAddress({
          recipient_name: '',
          street: '',
          city: '',
          state: '',
          country: 'United States',
          postal_code: '',
          phone: ''
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding shipping address:', error);
    }
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/mobile-wallet`,
        newWallet,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowWalletModal(false);
        setNewWallet({
          provider: 'MTN',
          phone_number: '',
          account_name: ''
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewIdentityDoc({
          ...newIdentityDoc,
          document_image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIdentityDoc = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/identity-document`,
        newIdentityDoc,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setShowIdentityModal(false);
        setNewIdentityDoc({
          document_type: 'national_id',
          document_number: '',
          issuing_authority: '',
          expiry_date: '',
          document_image: ''
        });
        fetchProfile();
      }
    } catch (error) {
      console.error('Error adding identity document:', error);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/address/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchProfile();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const deleteWallet = async (walletId) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile/profile/mobile-wallet/${walletId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchProfile();
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #dc2626',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const renderOverviewSection = () => (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        {/* Profile Picture Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '4px solid white',
            overflow: 'hidden',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            position: 'relative'
          }}>
            {profile?.profile_picture ? (
              <img 
                src={profile.profile_picture}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span style={{
                fontSize: '3rem',
                color: '#6b7280'
              }}>
                👤
              </span>
            )}
            
            {/* Upload/Edit Button */}
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              backgroundColor: '#dc2626',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid white'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
              <span style={{ color: 'white', fontSize: '0.8rem' }}>📷</span>
            </label>
          </div>

          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{ fontSize: '1.2rem', opacity: '0.9' }}>
              🆔 System ID: {profile?.system_user_id}
            </p>
            <p style={{ fontSize: '1rem', opacity: '0.8' }}>
              {user.userType === 'seller' ? '🏪 Seller Account' : '🛍️ Buyer Account'} • {user.location}
            </p>
            {profile?.profile_picture && (
              <button
                onClick={handleRemoveProfilePicture}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                Remove Picture
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #ffd700'
        }}>
          <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>🏠 Addresses</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {profile?.addresses?.length || 0}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Saved addresses</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #ffd700'
        }}>
          <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>📱 Wallets</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {profile?.mobile_money_wallets?.length || 0}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Mobile money accounts</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          border: '2px solid #ffd700'
        }}>
          <h4 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>🔒 Verification</h4>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {profile?.verification_level || 'Basic'}
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Verification level</p>
        </div>
      </div>
    </div>
  );

  const renderAddressesSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#1f2937' }}>🏠 My Addresses</h3>
        <button
          onClick={() => setShowAddressModal(true)}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ➕ Add Address
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {profile?.addresses?.map((address) => (
          <div key={address.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: address.is_default ? '2px solid #ffd700' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: '#1f2937', textTransform: 'capitalize' }}>
                  {address.type} Address {address.is_default && '(Default)'}
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{address.street}</p>
                <p style={{ color: '#6b7280' }}>
                  {address.city}, {address.state} {address.postal_code}, {address.country}
                </p>
              </div>
              <button
                onClick={() => deleteAddress(address.id)}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )) || (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p>No addresses added yet. Add your first address!</p>
          </div>
        )}
      </div>

      {user?.userType === 'buyer' && (
        <>
          <h3 style={{ color: '#1f2937', marginTop: '2rem', marginBottom: '1rem' }}>📦 Shipping Addresses</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {profile?.shipping_addresses?.map((address) => (
              <div key={address.id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: address.is_default ? '2px solid #ffd700' : '1px solid #e5e7eb'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>
                  {address.recipient_name} {address.is_default && '(Default)'}
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{address.street}</p>
                <p style={{ color: '#6b7280' }}>
                  {address.city}, {address.state} {address.postal_code}, {address.country}
                </p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>📞 {address.phone}</p>
              </div>
            )) || (
              <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <p>No shipping addresses added yet.</p>
                <form onSubmit={handleAddShippingAddress} style={{ marginTop: '1rem' }}>
                  <h4>Add Shipping Address</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Recipient Name"
                      value={newShippingAddress.recipient_name}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, recipient_name: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={newShippingAddress.street}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, street: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newShippingAddress.city}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, city: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newShippingAddress.state}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, state: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={newShippingAddress.postal_code}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, postal_code: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={newShippingAddress.phone}
                      onChange={(e) => setNewShippingAddress({...newShippingAddress, phone: e.target.value})}
                      required
                      style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    Add Shipping Address
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderWalletsSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#1f2937' }}>📱 Mobile Money Wallets</h3>
        <button
          onClick={() => setShowWalletModal(true)}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ➕ Add Wallet
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {profile?.mobile_money_wallets?.map((wallet) => (
          <div key={wallet.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: wallet.is_default ? '2px solid #ffd700' : '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>
                  {wallet.provider} {wallet.is_default && '(Default)'}
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>📞 {wallet.phone_number}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>👤 {wallet.account_name}</p>
                <p style={{ 
                  color: wallet.is_verified ? '#10b981' : '#f59e0b', 
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {wallet.is_verified ? '✅ Verified' : '⏳ Pending Verification'}
                </p>
              </div>
              <button
                onClick={() => deleteWallet(wallet.id)}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )) || (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p>No mobile money wallets added yet. Add your first wallet!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderIdentitySection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ color: '#1f2937' }}>🔒 Identity Verification</h3>
        <button
          onClick={() => setShowIdentityModal(true)}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ➕ Add Document
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {profile?.identity_documents?.map((doc) => (
          <div key={doc.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: '#1f2937', textTransform: 'capitalize' }}>
                  {doc.document_type.replace('_', ' ')}
                </h4>
                <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>📄 {doc.document_number}</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>🏛️ {doc.issuing_authority}</p>
                {doc.expiry_date && (
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>⏰ Expires: {new Date(doc.expiry_date).toLocaleDateString()}</p>
                )}
                <p style={{ 
                  color: doc.verification_status === 'verified' ? '#10b981' : 
                        doc.verification_status === 'rejected' ? '#ef4444' : '#f59e0b',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  marginTop: '0.5rem'
                }}>
                  {doc.verification_status === 'verified' ? '✅ Verified' : 
                   doc.verification_status === 'rejected' ? '❌ Rejected' : '⏳ Pending Review'}
                </p>
              </div>
              {doc.document_image && (
                <img
                  src={doc.document_image}
                  alt="Document"
                  style={{
                    width: '60px',
                    height: '40px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db'
                  }}
                />
              )}
            </div>
          </div>
        )) || (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p>No identity documents uploaded yet. Upload your documents for verification!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'addresses':
        return renderAddressesSection();
      case 'wallets':
        return renderWalletsSection();
      case 'identity':
        return renderIdentitySection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div>
      {/* Profile Navigation */}
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: '👤 Overview' },
            { id: 'addresses', label: '🏠 Addresses' },
            { id: 'wallets', label: '📱 Wallets' },
            { id: 'identity', label: '🔒 Identity' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '0.75rem 1rem',
                background: activeSection === section.id ? '#fef2f2' : 'transparent',
                color: activeSection === section.id ? '#dc2626' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontWeight: activeSection === section.id ? 'bold' : 'normal'
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Content */}
      {renderContent()}

      {/* Address Modal */}
      {showAddressModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <h3>Add New Address</h3>
            <form onSubmit={handleAddAddress}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Address Type</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Street Address</label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label>State/Region</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label>Country</label>
                  <select
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  >
                    <option value="Liberia">Liberia</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
                <div>
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={newAddress.postal_code}
                    onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3>Add Mobile Money Wallet</h3>
            <form onSubmit={handleAddWallet}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Provider</label>
                <select
                  value={newWallet.provider}
                  onChange={(e) => setNewWallet({...newWallet, provider: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Orange">Orange Money</option>
                  <option value="Lonestar">Lonestar Cell MTN</option>
                  <option value="Vodafone">Vodafone Cash</option>
                  <option value="Airtel">Airtel Money</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newWallet.phone_number}
                  onChange={(e) => setNewWallet({...newWallet, phone_number: e.target.value})}
                  required
                  placeholder="+231XXXXXXXX"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Account Name</label>
                <input
                  type="text"
                  value={newWallet.account_name}
                  onChange={(e) => setNewWallet({...newWallet, account_name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Add Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Identity Document Modal */}
      {showIdentityModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80%',
            overflow: 'auto'
          }}>
            <h3>Add Identity Document</h3>
            <form onSubmit={handleAddIdentityDoc}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Document Type</label>
                <select
                  value={newIdentityDoc.document_type}
                  onChange={(e) => setNewIdentityDoc({...newIdentityDoc, document_type: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Document Number</label>
                <input
                  type="text"
                  value={newIdentityDoc.document_number}
                  onChange={(e) => setNewIdentityDoc({...newIdentityDoc, document_number: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Issuing Authority</label>
                <input
                  type="text"
                  value={newIdentityDoc.issuing_authority}
                  onChange={(e) => setNewIdentityDoc({...newIdentityDoc, issuing_authority: e.target.value})}
                  required
                  placeholder="e.g., Government of Liberia"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={newIdentityDoc.expiry_date}
                  onChange={(e) => setNewIdentityDoc({...newIdentityDoc, expiry_date: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label>Document Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                {newIdentityDoc.document_image && (
                  <img
                    src={newIdentityDoc.document_image}
                    alt="Preview"
                    style={{
                      width: '100px',
                      height: '60px',
                      objectFit: 'cover',
                      marginTop: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowIdentityModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile Picture Modal */}
      {showProfilePictureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Update Profile Picture</h3>
            
            {newProfilePicture && (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 1rem',
                border: '2px solid #dc2626'
              }}>
                <img
                  src={newProfilePicture}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}

            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Do you want to update your profile picture?
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setNewProfilePicture('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfilePicture}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Update Picture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;