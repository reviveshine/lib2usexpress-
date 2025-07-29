import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const SellerVerificationPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [counties, setCounties] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    date_of_birth: '',
    nationality: 'Liberian',
    national_id_number: '',
    business_name: '',
    business_type: '',
    business_registration_number: '',
    tax_identification_number: '',
    physical_address: '',
    city: '',
    county: '',
    postal_code: '',
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    mobile_money_number: ''
  });

  const [uploadForm, setUploadForm] = useState({
    document_type: 'national_id',
    document_name: '',
    file: null
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'seller') {
      navigate('/dashboard');
      return;
    }

    fetchVerificationData();
  }, [user, navigate]);

  const fetchVerificationData = async () => {
    try {
      const [profileResponse, statusResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/verification/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/verification/status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      if (profileResponse.ok && statusResponse.ok) {
        const profileData = await profileResponse.json();
        const statusData = await statusResponse.json();
        
        if (profileData.profile) {
          setProfile(profileData.profile);
          setProfileForm({
            full_name: profileData.profile.full_name || '',
            date_of_birth: profileData.profile.date_of_birth || '',
            nationality: profileData.profile.nationality || 'Liberian',
            national_id_number: profileData.profile.national_id_number || '',
            business_name: profileData.profile.business_name || '',
            business_type: profileData.profile.business_type || '',
            business_registration_number: profileData.profile.business_registration_number || '',
            tax_identification_number: profileData.profile.tax_identification_number || '',
            physical_address: profileData.profile.physical_address || '',
            city: profileData.profile.city || '',
            county: profileData.profile.county || '',
            postal_code: profileData.profile.postal_code || '',
            bank_name: profileData.profile.bank_name || '',
            account_holder_name: profileData.profile.account_holder_name || '',
            account_number: profileData.profile.account_number || '',
            mobile_money_number: profileData.profile.mobile_money_number || ''
          });
        }
        
        setDocuments(profileData.documents || []);
        setCounties(profileData.counties || []);
        setVerificationStatus(statusData);
      } else {
        setError('Failed to load verification data');
      }
    } catch (error) {
      setError('Error loading verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/verification/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchVerificationData();
          setActiveTab('documents');
        } else {
          setError(data.message || 'Failed to save profile');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to save profile');
      }
    } catch (error) {
      setError('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      if (file.size > maxSize) {
        setError('File size cannot exceed 10MB');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setError('File must be JPEG, PNG, or PDF');
        return;
      }
      
      setUploadForm({
        ...uploadForm,
        file: file,
        document_name: file.name
      });
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1]; // Remove data:mime;base64, prefix
        
        const uploadData = {
          document_type: uploadForm.document_type,
          document_name: uploadForm.document_name,
          file_content: base64Content,
          file_type: uploadForm.file.type,
          file_size: uploadForm.file.size
        };

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/verification/documents/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(uploadData)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            fetchVerificationData();
            setUploadForm({
              document_type: 'national_id',
              document_name: '',
              file: null
            });
            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
          } else {
            setError(data.message || 'Failed to upload document');
          }
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to upload document');
        }
        
        setLoading(false);
      };
      
      reader.readAsDataURL(uploadForm.file);
    } catch (error) {
      setError('Error uploading document');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'under_review': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'pending': return '⏳';
      case 'under_review': return '🔍';
      default: return '📋';
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Independence Day Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '1rem 0',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '3px solid #ffd700'
      }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            animation: 'textGlow 2s ease-in-out infinite alternate'
          }}>
            🇱🇷 Seller Verification 🏆
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: '0.9',
            marginTop: '0.5rem'
          }}>
            🎉 Verify Your Identity - Build Trust with American Buyers! 🎉
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
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

        {/* Verification Status Card */}
        {verificationStatus && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8" style={{ border: '2px solid #ffd700' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📊 Verification Status</h2>
              <div className="flex items-center gap-2">
                <span style={{ color: getStatusColor(verificationStatus.verification_status) }}>
                  {getStatusIcon(verificationStatus.verification_status)}
                </span>
                <span className="font-medium" style={{ color: getStatusColor(verificationStatus.verification_status) }}>
                  {verificationStatus.verification_status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{verificationStatus.progress_percentage}%</div>
                <div className="text-sm text-blue-800">Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{verificationStatus.approved_count}</div>
                <div className="text-sm text-green-800">Approved Docs</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{verificationStatus.pending_count}</div>
                <div className="text-sm text-orange-800">Pending Review</div>
              </div>
            </div>

            {verificationStatus.verification_notes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Admin Notes:</strong> {verificationStatus.verification_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'profile', label: '👤 Profile Information', disabled: false },
              { id: 'documents', label: '📋 Documents', disabled: !profile },
              { id: 'status', label: '📊 Review Status', disabled: !profile }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Personal & Business Information</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={(e) => setProfileForm({...profileForm, date_of_birth: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <select
                      value={profileForm.nationality}
                      onChange={(e) => setProfileForm({...profileForm, nationality: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Liberian">Liberian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number</label>
                    <input
                      type="text"
                      value={profileForm.national_id_number}
                      onChange={(e) => setProfileForm({...profileForm, national_id_number: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Business Details (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm({...profileForm, business_name: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select
                      value={profileForm.business_type}
                      onChange={(e) => setProfileForm({...profileForm, business_type: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select business type</option>
                      <option value="sole_proprietorship">Sole Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="corporation">Corporation</option>
                      <option value="llc">LLC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                    <input
                      type="text"
                      value={profileForm.business_registration_number}
                      onChange={(e) => setProfileForm({...profileForm, business_registration_number: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID Number</label>
                    <input
                      type="text"
                      value={profileForm.tax_identification_number}
                      onChange={(e) => setProfileForm({...profileForm, tax_identification_number: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Address Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address *</label>
                    <input
                      type="text"
                      value={profileForm.physical_address}
                      onChange={(e) => setProfileForm({...profileForm, physical_address: e.target.value})}
                      required
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        required
                        className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">County *</label>
                      <select
                        value={profileForm.county}
                        onChange={(e) => setProfileForm({...profileForm, county: e.target.value})}
                        required
                        className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select county</option>
                        {counties.map(county => (
                          <option key={county} value={county}>{county}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={profileForm.postal_code}
                        onChange={(e) => setProfileForm({...profileForm, postal_code: e.target.value})}
                        className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Payment Information (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <input
                      type="text"
                      value={profileForm.bank_name}
                      onChange={(e) => setProfileForm({...profileForm, bank_name: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      value={profileForm.account_holder_name}
                      onChange={(e) => setProfileForm({...profileForm, account_holder_name: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={profileForm.account_number}
                      onChange={(e) => setProfileForm({...profileForm, account_number: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Number</label>
                    <input
                      type="text"
                      value={profileForm.mobile_money_number}
                      onChange={(e) => setProfileForm({...profileForm, mobile_money_number: e.target.value})}
                      placeholder="+231 XXX XXXX"
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="registration-submit-btn w-full py-3 px-6 rounded-lg font-medium"
                style={{
                  background: loading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {loading ? '⏳ Saving...' : '💾 Save Profile Information'}
              </button>
            </form>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Form */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Upload Verification Documents</h3>
              
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                    <select
                      value={uploadForm.document_type}
                      onChange={(e) => setUploadForm({...uploadForm, document_type: e.target.value})}
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="national_id">National ID Card</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="business_registration">Business Registration</option>
                      <option value="utility_bill">Utility Bill</option>
                      <option value="bank_statement">Bank Statement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                    <input
                      type="text"
                      value={uploadForm.document_name}
                      onChange={(e) => setUploadForm({...uploadForm, document_name: e.target.value})}
                      placeholder="Enter document name"
                      className="w-full p-3 border-2 border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Choose File *</label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Accepted formats: JPEG, PNG, PDF. Maximum size: 10MB
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !uploadForm.file}
                  className="registration-submit-btn w-full py-3 px-6 rounded-lg font-medium"
                  style={{
                    background: (loading || !uploadForm.file) ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    color: 'white',
                    border: 'none',
                    cursor: (loading || !uploadForm.file) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || !uploadForm.file) ? 'none' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {loading ? '⏳ Uploading...' : '📤 Upload Document'}
                </button>
              </form>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Uploaded Documents</h3>
              
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {doc.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-sm text-gray-600">{doc.document_name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <span style={{ color: getStatusColor(doc.status) }}>
                              {getStatusIcon(doc.status)}
                            </span>
                            <span className="font-medium" style={{ color: getStatusColor(doc.status) }}>
                              {doc.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          {doc.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {doc.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents uploaded yet.</p>
                  <p className="text-sm mt-2">Start by uploading your National ID and a recent utility bill.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && verificationStatus && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Verification Review Status</h3>
            
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Verification Progress</span>
                  <span>{verificationStatus.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-red-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${verificationStatus.progress_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${getStatusColor(verificationStatus.verification_status)}20` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: getStatusColor(verificationStatus.verification_status) }}>
                        {getStatusIcon(verificationStatus.verification_status)}
                      </span>
                      <span className="font-medium" style={{ color: getStatusColor(verificationStatus.verification_status) }}>
                        {verificationStatus.verification_status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {verificationStatus.verification_notes && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Notes:</strong> {verificationStatus.verification_notes}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Document Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>✅ Approved:</span>
                      <span className="font-medium text-green-600">{verificationStatus.approved_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>⏳ Pending:</span>
                      <span className="font-medium text-orange-600">{verificationStatus.pending_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>❌ Rejected:</span>
                      <span className="font-medium text-red-600">{verificationStatus.rejected_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {verificationStatus.required_documents?.map((docType, index) => {
                    const isUploaded = documents.some(doc => doc.document_type === docType);
                    const docStatus = documents.find(doc => doc.document_type === docType)?.status;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 rounded">
                        <span style={{ color: isUploaded ? getStatusColor(docStatus) : '#6b7280' }}>
                          {isUploaded ? getStatusIcon(docStatus) : '📋'}
                        </span>
                        <span className="text-sm">
                          {docType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {verificationStatus.verified_at && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>✅ Verification Completed:</strong> {new Date(verificationStatus.verified_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerVerificationPage;