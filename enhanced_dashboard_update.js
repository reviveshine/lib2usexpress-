// Enhanced Dashboard Update with Profile Pictures and Special ID Generation
// This will replace the existing showDashboardPage and add profile management

// Generate special user ID
function generateSpecialID(userType, firstName, lastName) {
  const timestamp = Date.now().toString();
  const prefix = userType === 'seller' ? 'LIB-' : 'USA-';
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return prefix + initials + '-' + timestamp.slice(-6) + '-' + random;
}

// Enhanced Registration Submit with Profile Picture and Special ID
function enhancedRegistrationSubmit(event) {
  event.preventDefault();
  
  const errorDiv = document.getElementById('registration-error');
  const errorText = document.getElementById('error-text');
  const submitButton = document.getElementById('register-btn');
  
  // Hide previous errors
  if (errorDiv) errorDiv.style.display = 'none';
  
  // Show loading
  const originalText = submitButton.textContent;
  submitButton.textContent = '⏳ Creating Account...';
  submitButton.disabled = true;
  
  // Collect form data
  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    userType: document.querySelector('input[name="userType"]:checked').value,
    location: document.getElementById('location').value.trim()
  };
  
  // Generate special ID
  const specialID = generateSpecialID(formData.userType, formData.firstName, formData.lastName);
  
  // Simple validation
  if (formData.password !== formData.confirmPassword) {
    if (errorDiv && errorText) {
      errorText.textContent = 'Passwords do not match';
      errorDiv.style.display = 'block';
    }
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    return;
  }
  
  if (formData.firstName && formData.lastName && formData.email) {
    // Store user data with special ID
    const userData = {
      ...formData,
      specialID: specialID,
      profilePicture: null, // Will be uploaded later
      memberSince: new Date().toISOString().split('T')[0],
      verificationStatus: formData.userType === 'seller' ? 'pending' : 'verified'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'demo_token_' + specialID);
    
    // Simulate successful registration
    setTimeout(() => {
      alert('🎉 Registration successful! Welcome to Liberia2USA Express, ' + formData.firstName + '!\nYour ID: ' + specialID);
      showEnhancedDashboard();
    }, 1000);
  } else {
    if (errorDiv && errorText) {
      errorText.textContent = 'Please fill in all required fields';
      errorDiv.style.display = 'block';
    }
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// Enhanced Dashboard based on user type
function showEnhancedDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const root = document.getElementById('root');
  
  if (user.userType === 'seller') {
    showSellerDashboard(user);
  } else {
    showBuyerDashboard(user);
  }
}

// Seller Dashboard
function showSellerDashboard(user) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="App">
      <nav class="nav">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
          <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
            🇱🇷 Liberia2USA Express 🇺🇸
          </button>
          <div class="nav-links">
            <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
            <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
            <button onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;">Logout</button>
          </div>
        </div>
      </nav>

      <section class="page" style="padding: 2rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 2rem;">
          <!-- User Profile Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 2rem;">
              <div style="position: relative;">
                <img id="profile-picture" src="${user.profilePicture || 'https://via.placeholder.com/150x150/dc2626/ffffff?text=' + user.firstName.charAt(0) + user.lastName.charAt(0)}" 
                     style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; object-fit: cover;">
                <button onclick="uploadProfilePicture()" style="position: absolute; bottom: 5px; right: 5px; background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 0.8rem;">📷</button>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 2.5rem;">🏪 ${user.firstName} ${user.lastName}</h1>
                <p style="margin: 0.5rem 0; font-size: 1.2rem; opacity: 0.9;">Seller Account</p>
                <p style="margin: 0; font-size: 1rem; opacity: 0.8;">ID: ${user.specialID}</p>
                <p style="margin: 0; font-size: 1rem; opacity: 0.8;">Member since: ${user.memberSince}</p>
                <div style="margin-top: 1rem;">
                  <span style="background: ${user.verificationStatus === 'verified' ? '#16a34a' : '#f59e0b'}; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">
                    ${user.verificationStatus === 'verified' ? '✅ Verified Seller' : '⏳ Verification Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dashboard Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- Quick Stats -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">📊 Quick Stats</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Products Listed:</span>
                <strong>0</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Orders Received:</span>
                <strong>0</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Total Sales:</span>
                <strong>$0.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Rating:</span>
                <strong>⭐ New Seller</strong>
              </div>
            </div>

            <!-- Add Product -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">➕ Add New Product</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">List your authentic Liberian products</p>
              <button onclick="showAddProductForm()" style="width: 100%; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                🏷️ Add Product
              </button>
            </div>

            <!-- Manage Products -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">📦 My Products</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Manage your product listings</p>
              <button onclick="showMyProducts()" style="width: 100%; background: #6b7280; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                📋 View Products
              </button>
            </div>

            <!-- Orders Management -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">📋 Orders</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Track incoming orders</p>
              <button onclick="showSellerOrders()" style="width: 100%; background: #16a34a; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                📊 View Orders
              </button>
            </div>

            <!-- Profile Settings -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">⚙️ Settings</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Manage your seller profile</p>
              <button onclick="showSellerSettings()" style="width: 100%; background: #f59e0b; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                🔧 Edit Profile
              </button>
            </div>

            <!-- Help Center -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #dc2626; margin-bottom: 1rem;">❓ Help Center</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Get support and guidance</p>
              <button onclick="showSellerHelp()" style="width: 100%; background: #8b5cf6; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                💬 Get Help
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <input type="file" id="profile-upload" accept="image/*" style="display: none;" onchange="handleProfilePictureUpload(event)">
  `;
}

// Buyer Dashboard
function showBuyerDashboard(user) {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div class="App">
      <nav class="nav">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
          <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
            🇱🇷 Liberia2USA Express 🇺🇸
          </button>
          <div class="nav-links">
            <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
            <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
            <button onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;">Logout</button>
          </div>
        </div>
      </nav>

      <section class="page" style="padding: 2rem 0;">
        <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 2rem;">
          <!-- User Profile Header -->
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 2rem;">
              <div style="position: relative;">
                <img id="profile-picture" src="${user.profilePicture || 'https://via.placeholder.com/150x150/2563eb/ffffff?text=' + user.firstName.charAt(0) + user.lastName.charAt(0)}" 
                     style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; object-fit: cover;">
                <button onclick="uploadProfilePicture()" style="position: absolute; bottom: 5px; right: 5px; background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 0.8rem;">📷</button>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 2.5rem;">🛍️ ${user.firstName} ${user.lastName}</h1>
                <p style="margin: 0.5rem 0; font-size: 1.2rem; opacity: 0.9;">Buyer Account</p>
                <p style="margin: 0; font-size: 1rem; opacity: 0.8;">ID: ${user.specialID}</p>
                <p style="margin: 0; font-size: 1rem; opacity: 0.8;">Member since: ${user.memberSince}</p>
                <div style="margin-top: 1rem;">
                  <span style="background: #16a34a; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">
                    ✅ Verified Buyer
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dashboard Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
            <!-- Quick Stats -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">📊 Quick Stats</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Orders Placed:</span>
                <strong>0</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Total Spent:</span>
                <strong>$0.00</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span>Wishlist Items:</span>
                <strong>0</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Member Status:</span>
                <strong>⭐ New Member</strong>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">📦 Recent Orders</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Track your purchases</p>
              <button onclick="showBuyerOrders()" style="width: 100%; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                📋 View Orders
              </button>
            </div>

            <!-- Wishlist -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">❤️ Wishlist</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Your saved products</p>
              <button onclick="showWishlist()" style="width: 100%; background: #dc2626; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                💝 View Wishlist
              </button>
            </div>

            <!-- Browse Products -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">🛒 Shop Now</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Discover authentic Liberian products</p>
              <button onclick="showPage('marketplace')" style="width: 100%; background: #16a34a; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                🏪 Browse Marketplace
              </button>
            </div>

            <!-- Profile Settings -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">⚙️ Settings</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Manage your account</p>
              <button onclick="showBuyerSettings()" style="width: 100%; background: #f59e0b; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                🔧 Edit Profile
              </button>
            </div>

            <!-- Support -->
            <div class="dashboard-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="color: #2563eb; margin-bottom: 1rem;">💬 Support</h3>
              <p style="color: #6b7280; margin-bottom: 1.5rem;">Get help and support</p>
              <button onclick="showBuyerSupport()" style="width: 100%; background: #8b5cf6; color: white; border: none; padding: 1rem; border-radius: 10px; font-weight: bold; cursor: pointer;">
                🎧 Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    <input type="file" id="profile-upload" accept="image/*" style="display: none;" onchange="handleProfilePictureUpload(event)">
  `;
}

// Profile Picture Upload
function uploadProfilePicture() {
  document.getElementById('profile-upload').click();
}

function handleProfilePictureUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const profilePic = document.getElementById('profile-picture');
      profilePic.src = e.target.result;
      
      // Save to user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.profilePicture = e.target.result;
      localStorage.setItem('user', JSON.stringify(user));
      
      alert('✅ Profile picture updated successfully!');
    };
    reader.readAsDataURL(file);
  }
}

// Logout function
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token');
  alert('👋 Logged out successfully!');
  showPage('home');
}

// Placeholder functions for dashboard features
function showAddProductForm() {
  alert('🏷️ Add Product feature coming soon!\n\nYou\'ll be able to:\n• Upload product photos\n• Set prices and descriptions\n• Manage inventory\n• Track sales');
}

function showMyProducts() {
  alert('📦 My Products feature coming soon!\n\nView and manage your:\n• Listed products\n• Product performance\n• Inventory levels\n• Edit listings');
}

function showSellerOrders() {
  alert('📋 Seller Orders feature coming soon!\n\nManage:\n• Incoming orders\n• Order status updates\n• Customer communications\n• Shipping tracking');
}

function showSellerSettings() {
  alert('⚙️ Seller Settings feature coming soon!\n\nCustomize:\n• Business information\n• Payment methods\n• Shipping preferences\n• Verification documents');
}

function showSellerHelp() {
  alert('❓ Seller Help Center feature coming soon!\n\nGet help with:\n• Listing products\n• Managing orders\n• Payment issues\n• Shipping guidelines');
}

function showBuyerOrders() {
  alert('📦 Order History feature coming soon!\n\nTrack:\n• Purchase history\n• Order status\n• Shipping updates\n• Return/exchange requests');
}

function showWishlist() {
  alert('❤️ Wishlist feature coming soon!\n\nManage:\n• Saved products\n• Price drop alerts\n• Reorder favorites\n• Share with friends');
}

function showBuyerSettings() {
  alert('⚙️ Buyer Settings feature coming soon!\n\nUpdate:\n• Personal information\n• Shipping addresses\n• Payment methods\n• Notification preferences');
}

function showBuyerSupport() {
  alert('💬 Support Center feature coming soon!\n\nGet help with:\n• Order issues\n• Payment problems\n• Product questions\n• Account support');
}

// Export functions
window.generateSpecialID = generateSpecialID;
window.enhancedRegistrationSubmit = enhancedRegistrationSubmit;
window.showEnhancedDashboard = showEnhancedDashboard;
window.showSellerDashboard = showSellerDashboard;
window.showBuyerDashboard = showBuyerDashboard;
window.uploadProfilePicture = uploadProfilePicture;
window.handleProfilePictureUpload = handleProfilePictureUpload;
window.logout = logout;
window.showAddProductForm = showAddProductForm;
window.showMyProducts = showMyProducts;
window.showSellerOrders = showSellerOrders;
window.showSellerSettings = showSellerSettings;
window.showSellerHelp = showSellerHelp;
window.showBuyerOrders = showBuyerOrders;
window.showWishlist = showWishlist;
window.showBuyerSettings = showBuyerSettings;
window.showBuyerSupport = showBuyerSupport;