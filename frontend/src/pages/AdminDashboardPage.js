import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext';

const AdminDashboardPage = () => {
  const { admin, logout, hasPermission } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardStats();
  }, [admin, navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        setError('Failed to load dashboard statistics');
      }
    } catch (error) {
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: `2px solid ${color}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        color: 'white',
        padding: '1rem 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '3px solid #ffd700'
      }}>
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              🏛️ Admin Dashboard
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              opacity: '0.9',
              marginTop: '0.25rem'
            }}>
              Welcome, {admin?.firstName} {admin?.lastName} ({admin?.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: '📊 Overview', permission: 'view_analytics' },
              { id: 'users', label: '👥 Users', permission: 'manage_users' },
              { id: 'products', label: '📦 Products', permission: 'manage_products' },
              { id: 'reports', label: '📋 Reports', permission: 'resolve_disputes' },
              { id: 'activities', label: '📜 Activities', permission: 'view_analytics' }
            ].filter(tab => hasPermission(tab.permission)).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.total_users}
                icon="👥"
                color="#dc2626"
                subtitle={`${stats.total_buyers} buyers, ${stats.total_sellers} sellers`}
              />
              <StatCard
                title="Active Products"
                value={stats.active_products}
                icon="📦"
                color="#059669"
                subtitle={`${stats.pending_products} pending approval`}
              />
              <StatCard
                title="Transactions"
                value={stats.total_transactions}
                icon="💳"
                color="#7c3aed"
                subtitle="All time"
              />
              <StatCard
                title="Pending Reports"
                value={stats.pending_reports}
                icon="📋"
                color="#ea580c"
                subtitle={`${stats.resolved_reports} resolved`}
              />
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Revenue This Month"
                value={`$${stats.revenue_this_month.toFixed(2)}`}
                icon="📈"
                color="#16a34a"
                subtitle="Current month earnings"
              />
              <StatCard
                title="Revenue Last Month"
                value={`$${stats.revenue_last_month.toFixed(2)}`}
                icon="📊"
                color="#2563eb"
                subtitle="Previous month comparison"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hasPermission('manage_users') && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="font-medium text-blue-900">Manage Users</div>
                    <div className="text-sm text-blue-600">Verify, suspend, or ban users</div>
                  </button>
                )}
                
                {hasPermission('manage_products') && (
                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-medium text-green-900">Review Products</div>
                    <div className="text-sm text-green-600">Approve or reject listings</div>
                  </button>
                )}
                
                {hasPermission('resolve_disputes') && (
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-medium text-orange-900">Handle Reports</div>
                    <div className="text-sm text-orange-600">Resolve user and product reports</div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && hasPermission('manage_users') && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Management</h3>
            <p className="text-gray-600">User management interface will be loaded here.</p>
            {/* User management component will be added here */}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && hasPermission('manage_products') && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Product Management</h3>
            <p className="text-gray-600">Product management interface will be loaded here.</p>
            {/* Product management component will be added here */}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && hasPermission('resolve_disputes') && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Reports Management</h3>
            <p className="text-gray-600">Reports management interface will be loaded here.</p>
            {/* Reports management component will be added here */}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && hasPermission('view_analytics') && (
          <div className="bg-white rounded-lg shadow-lg p-6" style={{ border: '2px solid #ffd700' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Admin Activities</h3>
            <p className="text-gray-600">Activity logs will be displayed here.</p>
            {/* Activity logs component will be added here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;