/*! Liberia2USA Express - Bridging Nations - WITH PROFILE PICTURES */
(function() {
  'use strict';

  let currentPage = 'home';
  let currentProfilePicture = null;
  let uploadInProgress = false;
  
  // Backend URL
  const backendUrl = 'https://1cf5d37c-b2de-41de-b25f-6ce6b0986561.preview.emergentagent.com';

  function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      return JSON.parse(user);
    }
    return null;
  }

  // Generate special user ID
  function generateSpecialID(userType, firstName, lastName) {
    const timestamp = Date.now().toString();
    const prefix = userType === 'seller' ? 'LIB-' : 'USA-';
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return prefix + initials + '-' + timestamp.slice(-6) + '-' + random;
  }

  // Profile Picture Functions
  async function getUserProfilePicture() {
    try {
      const response = await fetch(`${backendUrl}/api/profile/picture-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      if (data.success && data.has_picture) {
        return data.profile_picture_url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  }

  async function uploadProfilePicture(file) {
    if (uploadInProgress) {
      alert('⏳ Upload already in progress...');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      alert('❌ File too large. Maximum size is 5MB.');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('❌ Invalid file type. Please use JPG, PNG, GIF, or WebP.');
      return;
    }
    
    uploadInProgress = true;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      updateUploadProgress(0, '⏳ Starting upload...');
      
      const response = await fetch(`${backendUrl}/api/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        currentProfilePicture = data.profile_picture_url;
        updateUploadProgress(100, '✅ Upload complete!');
        updateProfilePictureUI(data.profile_picture_url);
        alert(`🎉 Profile picture uploaded successfully!`);
        closeProfileModal();
        showPage('dashboard');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      updateUploadProgress(0, '❌ Upload failed');
      alert(`❌ Upload failed: ${error.message}`);
    } finally {
      uploadInProgress = false;
    }
  }

  function updateUploadProgress(percent, message) {
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-progress-text');
    
    if (progressBar) {
      progressBar.style.width = percent + '%';
    }
    
    if (progressText) {
      progressText.textContent = message;
    }
  }

  function updateProfilePictureUI(imageUrl) {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
      navAvatar.src = `${backendUrl}${imageUrl}`;
      navAvatar.style.display = 'inline-block';
    }
    
    const dashboardAvatar = document.getElementById('dashboard-avatar');
    if (dashboardAvatar) {
      dashboardAvatar.src = `${backendUrl}${imageUrl}`;
      dashboardAvatar.style.display = 'block';
    }
    
    const defaultIcons = document.querySelectorAll('.default-avatar-icon');
    defaultIcons.forEach(icon => {
      icon.style.display = 'none';
    });
  }

  function showProfileModal() {
    const user = checkAuth();
    if (!user) {
      alert('❌ Please login first');
      return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="max-width: 500px; background: white; border-radius: 15px; padding: 2rem; margin: 2rem auto; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <button onclick="closeProfileModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
        
        <h2 style="text-align: center; margin-bottom: 2rem; color: #2d3748;">👤 Manage Profile</h2>
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 4px solid #e2e8f0; background: #f7fafc; display: flex; align-items: center; justify-content: center;">
            ${currentProfilePicture ? 
              `<img id="modal-avatar" src="${backendUrl}${currentProfilePicture}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Picture">` :
              `<span class="default-avatar-icon" style="font-size: 3rem; color: #a0aec0;">👤</span>`
            }
          </div>
          <p style="margin-top: 1rem; color: #718096;">
            ${user.firstName} ${user.lastName}
          </p>
          <p style="color: #a0aec0; font-size: 0.9rem;">
            ID: ${user.specialID || 'N/A'}
          </p>
        </div>
        
        <div style="border: 2px dashed #e2e8f0; border-radius: 10px; padding: 2rem; text-align: center; margin-bottom: 1rem;">
          <input type="file" id="profile-picture-input" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
          <div onclick="document.getElementById('profile-picture-input').click()" style="cursor: pointer;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📸</div>
            <p style="margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">Click to upload new picture</p>
            <p style="color: #718096; font-size: 0.9rem;">JPG, PNG, GIF or WebP • Max 5MB</p>
          </div>
        </div>
        
        <div id="upload-progress" style="display: none; margin-bottom: 1rem;">
          <div style="background: #f1f5f9; border-radius: 10px; height: 8px; overflow: hidden;">
            <div id="upload-progress-bar" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
          </div>
          <p id="upload-progress-text" style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem; color: #718096;"></p>
        </div>
        
        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
          ${currentProfilePicture ? 
            `<button onclick="removeProfilePicture()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
              🗑️ Remove Picture
            </button>` : ''
          }
          <button onclick="closeProfileModal()" style="background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
      modal.remove();
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const modalAvatar = document.getElementById('modal-avatar');
        if (modalAvatar) {
          modalAvatar.src = e.target.result;
        } else {
          const avatarContainer = document.querySelector('#profile-modal .default-avatar-icon').parentElement;
          if (avatarContainer) {
            avatarContainer.innerHTML = `<img id="modal-avatar" src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Picture Preview">`;
          }
        }
      };
      reader.readAsDataURL(file);
      
      const progressSection = document.getElementById('upload-progress');
      if (progressSection) {
        progressSection.style.display = 'block';
      }
      
      uploadProfilePicture(file);
    }
  }

  async function removeProfilePicture() {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/upload/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        currentProfilePicture = null;
        alert('✅ Profile picture removed successfully!');
        removeProfilePictureFromUI();
        closeProfileModal();
        showPage('dashboard');
      } else {
        throw new Error(data.message || 'Failed to remove picture');
      }
      
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert(`❌ Failed to remove picture: ${error.message}`);
    }
  }

  function removeProfilePictureFromUI() {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
      navAvatar.style.display = 'none';
    }
    
    const dashboardAvatar = document.getElementById('dashboard-avatar');
    if (dashboardAvatar) {
      dashboardAvatar.style.display = 'none';
    }
    
    const defaultIcons = document.querySelectorAll('.default-avatar-icon');
    defaultIcons.forEach(icon => {
      icon.style.display = 'block';
    });
  }

  async function loadCurrentProfilePicture() {
    const pictureUrl = await getUserProfilePicture();
    if (pictureUrl) {
      currentProfilePicture = pictureUrl;
      updateProfilePictureUI(pictureUrl);
    }
  }

  function showPage(pageName) {
    currentPage = pageName;
    const root = document.getElementById('root');
    if (!root) return;

    if (pageName === 'home') {
      showHomePage();
    } else if (pageName === 'login') {
      showLoginPage();
    } else if (pageName === 'register') {
      showRegisterPage();
    } else if (pageName === 'marketplace') {
      showMarketplacePage();
    } else if (pageName === 'shipping') {
      showShippingPage();
    } else if (pageName === 'dashboard') {
      showDashboard();
    }
  }

  function showHomePage() {
    const root = document.getElementById('root');
    const user = checkAuth();
    
    root.innerHTML = `
      <div class="App">
        <nav class="nav">
          <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
              🇱🇷 Liberia2USA Express 🇺🇸
            </button>
            <div class="nav-links" style="display: flex; align-items: center; gap: 1rem;">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
              <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
              <button onclick="showPage('shipping')" class="nav-link" style="background:none;border:none;cursor:pointer;">Shipping</button>
              ${user ? 
                `<button onclick="showPage('dashboard')" class="nav-link" style="background:none;border:none;cursor:pointer;">Dashboard</button>
                 <img id="nav-avatar" style="width: 32px; height: 32px; border-radius: 50%; margin: 0 0.5rem; display: none;" alt="Avatar">
                 <span class="default-avatar-icon" style="font-size: 1.5rem;">👤</span>
                 <button onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;">Logout</button>` :
                `<button onclick="showPage('login')" class="nav-link" style="background:none;border:none;cursor:pointer;">Login</button>
                 <button onclick="showPage('register')" class="nav-link" style="background:none;border:none;cursor:pointer;">Register</button>`
              }
            </div>
          </div>
        </nav>

        <div class="hero-section" style="padding: 6rem 0; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div class="container">
            <h1 style="font-size: 3.5rem; font-weight: bold; color: white; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
              🇱🇷 Liberia2USA Express 🇺🇸
            </h1>
            <p style="font-size: 1.5rem; color: white; margin-bottom: 2rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
              🌍 Bridging Two Nations Through Authentic Commerce 🌍
            </p>
            ${user ? 
              `<div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem;">
                <img id="hero-avatar" style="width: 48px; height: 48px; border-radius: 50%; display: none;" alt="Avatar">
                <span class="default-avatar-icon" style="font-size: 2rem;">👤</span>
                <p style="font-size: 1.2rem; color: white; margin: 0; opacity: 0.9;">
                  Welcome back, ${user.firstName}! 👋
                </p>
              </div>` : ''
            }
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="showPage('marketplace')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                🏪 Shop Marketplace
              </button>
              <button onclick="showPage('shipping')" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                📦 Calculate Shipping
              </button>
              ${!user ? 
                `<button onclick="showPage('register')" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                  🚀 Join Now
                </button>` : ''
              }
            </div>
          </div>
        </div>

        <section style="padding: 4rem 0; background-color: #f8fafc;">
          <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <h2 style="text-align: center; font-size: 2.5rem; color: #2d3748; margin-bottom: 3rem;">
              ☀️ Why Choose Liberia2USA Express?
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
              <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🚚</div>
                <h3 style="color: #dc2626; margin-bottom: 1rem;">Fast & Reliable Shipping</h3>
                <p style="color: #718096;">Express delivery from Liberia to USA with tracking.</p>
              </div>
              <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
                <h3 style="color: #dc2626; margin-bottom: 1rem;">Secure Transactions</h3>
                <p style="color: #718096;">Protected payments and verified sellers.</p>
              </div>
              <div style="text-align: center; padding: 2rem; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🌍</div>
                <h3 style="color: #dc2626; margin-bottom: 1rem;">Cultural Bridge</h3>
                <p style="color: #718096;">Connecting Liberian artisans with American consumers.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    if (user) {
      loadCurrentProfilePicture();
    }
  }

  function showLoginPage() {
    const root = document.getElementById('root');
    
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const demoUserInfo = registeredUsers.length > 0 ? 
      `<div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
        <p style="margin: 0; color: #0369a1; font-size: 0.9rem;">
          💡 <strong>Demo Users Available:</strong> ${registeredUsers.length} registered account${registeredUsers.length > 1 ? 's' : ''} found.
          <br>Try logging in with a registered email, or <button onclick="showPage('register')" style="color: #0369a1; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 0.9rem;">create a new account</button>.
        </p>
      </div>` : 
      `<div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
        <p style="margin: 0; color: #92400e; font-size: 0.9rem;">
          ℹ️ <strong>No accounts found.</strong> Please <button onclick="showPage('register')" style="color: #92400e; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 0.9rem;">register first</button> to create an account.
        </p>
      </div>`;
    
    root.innerHTML = `
      <div class="App">
        <nav class="nav">
          <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
              🇱🇷 Liberia2USA Express 🇺🇸
            </button>
            <div class="nav-links">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">← Back to Home</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh; display: flex; align-items: center; justify-content: center;">
          <div class="container" style="max-width: 400px;">
            <div class="card">
              <h2 style="text-align: center; margin-bottom: 2rem; color: #3c3b6e;">🔑 Login</h2>
              
              ${demoUserInfo}
              
              <form onsubmit="handleLogin(event)">
                <div style="margin-bottom: 1rem;">
                  <label>Email</label>
                  <input type="email" id="login-email" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 1rem;">
                  <label>Password</label>
                  <input type="password" id="login-password" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box;">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 1rem;">🚀 Sign In</button>
              </form>
              <p style="text-align: center; margin-top: 1rem;">
                Don't have an account? <button onclick="showPage('register')" style="color: #dc2626; font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Register here</button>
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // IMPROVED LOGIN FUNCTION WITH DEMO FALLBACK
  function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '⏳ Signing In...';
    submitButton.disabled = true;
    
    function tryDemoLogin() {
      console.log('Trying demo login from localStorage...');
      
      const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const user = registeredUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('auth_token', 'demo_token_' + user.specialID);
        localStorage.setItem('user', JSON.stringify(user));
        
        let welcomeMessage = `🎉 Welcome back, ${user.firstName}!`;
        if (user.specialID) {
          welcomeMessage += `\n🆔 Your ID: ${user.specialID}`;
        }
        
        alert(welcomeMessage);
        
        if (user.userType === 'seller') {
          showPage('dashboard');
        } else {
          showPage('marketplace');
        }
        return true;
      }
      return false;
    }
    
    fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        if (tryDemoLogin()) {
          return;
        }
        throw new Error('Invalid email or password');
      }
      return response.json();
    })
    .then(data => {
      if (data && data.success && data.user && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        let welcomeMessage = `🎉 Welcome back, ${data.user.firstName}!`;
        if (data.user.specialID) {
          welcomeMessage += `\n🆔 Your ID: ${data.user.specialID}`;
        }
        
        alert(welcomeMessage);
        
        if (data.user.userType === 'seller') {
          showPage('dashboard');
        } else {
          showPage('marketplace');
        }
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid email or password' && !tryDemoLogin()) {
        let errorMessage = '❌ Login failed. ';
        
        const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        if (registeredUsers.length === 0) {
          errorMessage += 'No accounts found. Please register first.';
        } else {
          errorMessage += 'Please check your credentials and try again.';
          errorMessage += `\n\n💡 Tip: Try registering a new account if you don't have one.`;
        }
        
        alert(errorMessage);
      }
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    });
  }

  function showRegisterPage() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="App">
        <nav class="nav">
          <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
              🇱🇷 Liberia2USA Express 🇺🇸
            </button>
            <div class="nav-links">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">← Back to Home</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh;">
          <div class="container" style="max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 2rem; border-radius: 15px 15px 0 0; text-align: center;">
              <h1>🚀 Join Bridging Nations 🚀</h1>
              <p>Create Your Liberia2USA Express Account</p>
            </div>
            
            <div style="background: white; padding: 2rem; border-radius: 0 0 15px 15px; border: 3px solid #ffd700;">
              <div id="registration-error" style="display: none; background: #fef2f2; color: #dc2626; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                <span>⚠️</span> <span id="error-text"></span>
              </div>
              
              <form onsubmit="handleRegistrationSubmit(event)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">👤 First Name *</label>
                    <input type="text" id="firstName" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">👤 Last Name *</label>
                    <input type="text" id="lastName" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                  </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">📧 Email *</label>
                  <input type="email" id="email" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">🔒 Password *</label>
                    <input type="password" id="password" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                  </div>
                  <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">🔒 Confirm Password *</label>
                    <input type="password" id="confirmPassword" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                  </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label style="display: block; margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">📍 Location *</label>
                  <input type="text" id="location" placeholder="e.g., New York, USA" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;">
                  <small style="color: #718096;">Buyers must be in USA, Sellers in Liberia</small>
                </div>
                
                <div style="margin-bottom: 2rem; text-align: center;">
                  <label style="margin-right: 2rem;">
                    <input type="radio" name="userType" value="buyer" checked style="margin-right: 0.5rem;">
                    🛍️ Buyer
                  </label>
                  <label>
                    <input type="radio" name="userType" value="seller" style="margin-right: 0.5rem;">
                    🏪 Seller
                  </label>
                </div>
                
                <button type="submit" id="register-btn" style="width: 100%; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-size: 1.1rem; cursor: pointer; font-weight: bold;">
                  🚀 Create Account
                </button>
              </form>
              
              <p style="text-align: center; margin-top: 1rem;">
                🔒 <button onclick="showPage('login')" style="color: #dc2626; font-weight: bold; background: none; border: none; cursor: pointer; text-decoration: underline;">Back to Login</button>
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    const errorDiv = document.getElementById('registration-error');
    const errorText = document.getElementById('error-text');
    const submitButton = document.getElementById('register-btn');
    
    if (errorDiv) errorDiv.style.display = 'none';
    
    const originalText = submitButton.textContent;
    submitButton.textContent = '⏳ Creating Account...';
    submitButton.disabled = true;
    
    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
      userType: document.querySelector('input[name="userType"]:checked').value,
      location: document.getElementById('location').value.trim()
    };
    
    const specialID = generateSpecialID(formData.userType, formData.firstName, formData.lastName);
    
    if (formData.password !== formData.confirmPassword) {
      if (errorDiv && errorText) {
        errorText.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
      }
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      return;
    }
    
    const userData = {
      ...formData,
      specialID: specialID,
      memberSince: new Date().toISOString().split('T')[0]
    };
    
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    users.push(userData);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'demo_token_' + specialID);
    
    alert(`🎉 Account created successfully!\n\n🆔 Your Special ID: ${specialID}\n\nWelcome to Bridging Nations, ${formData.firstName}!\n\n💡 You can now login with:\nEmail: ${formData.email}\nPassword: ${formData.password}`);
    
    if (formData.userType === 'seller') {
      showPage('dashboard');
    } else {
      showPage('marketplace');
    }
    
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }

  function showMarketplacePage() {
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
              <button onclick="showPage('shipping')" class="nav-link" style="background:none;border:none;cursor:pointer;">Shipping</button>
              <button onclick="showPage('login')" class="nav-link" style="background:none;border:none;cursor:pointer;">Login</button>
              <button onclick="showPage('register')" class="nav-link" style="background:none;border:none;cursor:pointer;">Register</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh;">
          <div class="container">
            <h1 style="text-align: center; margin-bottom: 3rem; color: #2d3748;">🏪 Marketplace</h1>
            <p style="text-align: center; color: #718096; margin-bottom: 3rem;">
              Discover authentic Liberian products shipped directly to the USA
            </p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
              <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎨</div>
                <h3 style="color: #2d3748; margin-bottom: 1rem;">Traditional Crafts</h3>
                <p style="color: #718096; margin-bottom: 1rem;">Handmade items from Liberian artisans</p>
                <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                  View Products
                </button>
              </div>
              
              <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">👗</div>
                <h3 style="color: #2d3748; margin-bottom: 1rem;">Fashion & Textiles</h3>
                <p style="color: #718096; margin-bottom: 1rem;">Traditional clothing and fabrics</p>
                <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                  View Products
                </button>
              </div>
              
              <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🌶️</div>
                <h3 style="color: #2d3748; margin-bottom: 1rem;">Food & Spices</h3>
                <p style="color: #718096; margin-bottom: 1rem;">Authentic Liberian ingredients</p>
                <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                  View Products
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function showShippingPage() {
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
              <button onclick="showPage('shipping')" class="nav-link" style="background:none;border:none;cursor:pointer;">Shipping</button>
              <button onclick="showPage('login')" class="nav-link" style="background:none;border:none;cursor:pointer;">Login</button>
              <button onclick="showPage('register')" class="nav-link" style="background:none;border:none;cursor:pointer;">Register</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh;">
          <div class="container">
            <h1 style="text-align: center; margin-bottom: 3rem; color: #2d3748;">📦 Shipping Calculator</h1>
            <p style="text-align: center; color: #718096; margin-bottom: 3rem;">
              Calculate shipping costs from Liberia to the USA
            </p>
            
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 3rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
              <h3 style="color: #2d3748; margin-bottom: 2rem;">Package Details</h3>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #2d3748;">Weight (kg)</label>
                <input type="number" placeholder="Enter weight" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box;">
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #2d3748;">Destination State</label>
                <select style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box;">
                  <option>Select State</option>
                  <option>California</option>
                  <option>New York</option>
                  <option>Texas</option>
                  <option>Florida</option>
                </select>
              </div>
              
              <button style="width: 100%; background: #dc2626; color: white; border: none; padding: 1rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">
                Calculate Shipping Cost
              </button>
              
              <div style="margin-top: 2rem; padding: 1rem; background: #f7fafc; border-radius: 0.5rem;">
                <h4 style="color: #2d3748; margin-bottom: 0.5rem;">Estimated Cost</h4>
                <p style="color: #718096;">Enter package details to see shipping estimates</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function showDashboard() {
    const root = document.getElementById('root');
    const user = checkAuth();
    
    if (!user) {
      showPage('login');
      return;
    }
    
    root.innerHTML = `
      <div class="App">
        <nav class="nav">
          <div class="container" style="display: flex; justify-content: space-between; align-items: center;">
            <button onclick="showPage('home')" style="background:none;border:none;cursor: pointer; font-size: 1.2rem; font-weight: bold; color: #fff;">
              🇱🇷 Liberia2USA Express 🇺🇸
            </button>
            <div class="nav-links" style="display: flex; align-items: center; gap: 1rem;">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
              <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
              <button onclick="showPage('dashboard')" class="nav-link" style="background:none;border:none;cursor:pointer;">Dashboard</button>
              <img id="nav-avatar" style="width: 32px; height: 32px; border-radius: 50%; margin: 0 0.5rem; display: none;" alt="Avatar">
              <span class="default-avatar-icon" style="font-size: 1.5rem;">👤</span>
              <button onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;">Logout</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh;">
          <div class="container">
            <div style="text-align: center; margin-bottom: 3rem;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                <img id="dashboard-avatar" style="width: 60px; height: 60px; border-radius: 50%; display: none;" alt="Profile Avatar">
                <span class="default-avatar-icon" style="font-size: 3rem;">👤</span>
                <div>
                  <h1 style="color: #2d3748; margin: 0;">🎯 Dashboard</h1>
                  <p style="color: #718096; margin: 0.5rem 0;">Welcome back, ${user.firstName}! ${user.specialID ? `Your ID: ${user.specialID}` : ''}</p>
                </div>
              </div>
            </div>
            
            ${user.userType === 'seller' ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">My Products</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Manage your product listings</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    View Products
                  </button>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">Sales Analytics</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Track your performance</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    View Analytics
                  </button>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">Profile</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Update your information & photo</p>
                  <button onclick="showProfileModal()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    📸 Manage Profile
                  </button>
                </div>
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">My Orders</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Track your purchases</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    View Orders
                  </button>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">❤️</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">Wishlist</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Your saved items</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    View Wishlist
                  </button>
                </div>
                
                <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;">
                  <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">Profile</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Update your information & photo</p>
                  <button onclick="showProfileModal()" style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    📸 Manage Profile
                  </button>
                </div>
              </div>
            `}
          </div>
        </section>
      </div>
    `;

    // Load current profile picture
    loadCurrentProfilePicture();
  }

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    currentProfilePicture = null;
    alert('👋 Logged out successfully!');
    showPage('home');
  }

  // Global functions
  window.showPage = showPage;
  window.handleLogin = handleLogin;
  window.handleRegistrationSubmit = handleRegistrationSubmit;
  window.logout = logout;
  window.generateSpecialID = generateSpecialID;
  window.showProfileModal = showProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.handleFileSelect = handleFileSelect;
  window.removeProfilePicture = removeProfilePicture;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Liberia2USA Express loaded - WITH PROFILE PICTURES');
    showPage('home');
    
    // Load profile picture if user is logged in
    if (checkAuth()) {
      loadCurrentProfilePicture();
    }
  });

})();