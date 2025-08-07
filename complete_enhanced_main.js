/*! Liberia2USA Express - Bridging Nations - Enhanced with Profile Pictures and Special IDs */
(function() {
  'use strict';

  let currentPage = 'home';

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
      showEnhancedDashboard();
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
            <div class="nav-links">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
              <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
              <button onclick="showPage('shipping')" class="nav-link" style="background:none;border:none;cursor:pointer;">Shipping</button>
              ${user ? 
                `<button onclick="showPage('dashboard')" class="nav-link" style="background:none;border:none;cursor:pointer;">Dashboard</button>
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
              `<p style="font-size: 1.2rem; color: white; margin-bottom: 2rem; opacity: 0.9;">
                Welcome back, ${user.firstName}! 👋
              </p>` : ''
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
            <div style="text-align: center; margin-bottom: 3rem;">
              <h2 style="font-size: 2.5rem; font-weight: bold; color: #2d3748; margin-bottom: 1rem;">
                ☀️ Why Choose Liberia2USA Express?
              </h2>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
              <div class="feature-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🚚</div>
                <h3 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Fast & Reliable Shipping</h3>
                <p style="color: #6b7280;">Express delivery from Liberia to USA with tracking.</p>
                <button onclick="showPage('shipping')" style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 1rem; cursor: pointer;">Learn More</button>
              </div>
              
              <div class="feature-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <h3 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Secure Transactions</h3>
                <p style="color: #6b7280;">Protected payments and verified sellers.</p>
                <button style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 1rem; cursor: pointer;">View Security</button>
              </div>
              
              <div class="feature-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🌍</div>
                <h3 style="color: #dc2626; font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Cultural Bridge</h3>
                <p style="color: #6b7280;">Connecting Liberian artisans with American consumers.</p>
                <button style="background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 1rem; cursor: pointer;">Explore Culture</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function showLoginPage() {
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

        <section class="page" style="padding: 4rem 0; min-height: 80vh; display: flex; align-items: center; justify-content: center;">
          <div class="container" style="max-width: 400px;">
            <div class="card">
              <h2 style="text-align: center; margin-bottom: 2rem; color: #3c3b6e;">🔑 Login</h2>
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
              
              <form id="registration-form" onsubmit="handleRegistrationSubmit(event)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <label>👤 First Name *</label><br>
                    <input type="text" id="firstName" required style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                  </div>
                  <div>
                    <label>👤 Last Name *</label><br>
                    <input type="text" id="lastName" required style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                  </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label>📧 Email *</label><br>
                  <input type="email" id="email" required style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div>
                    <label>🔒 Password *</label><br>
                    <input type="password" id="password" required style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                  </div>
                  <div>
                    <label>🔒 Confirm Password *</label><br>
                    <input type="password" id="confirmPassword" required style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                  </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label>📍 Location *</label><br>
                  <input type="text" id="location" required placeholder="e.g., New York, USA" style="width: 100%; padding: 10px; box-sizing: border-box; border: 2px solid #d1d5db; border-radius: 8px;">
                  <small>Buyers must be in USA, Sellers in Liberia</small>
                </div>
                
                <div style="margin-bottom: 1rem;">
                  <label><input type="radio" name="userType" value="buyer" checked> 🛍️ Buyer</label><br>
                  <label><input type="radio" name="userType" value="seller"> 🏪 Seller</label>
                </div>
                
                <button type="submit" id="register-btn" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold;">
                  🚀 Create Account
                </button>
              </form>
              
              <p style="text-align: center; margin-top: 20px;">
                <a href="#" onclick="showPage('login')" style="color: #dc2626; text-decoration: none; font-weight: bold;">🔑 Back to Login</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    `;
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
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">← Back to Home</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0;">
          <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
            <h1 style="text-align: center; margin-bottom: 3rem; color: #2d3748;">🏪 Marketplace</h1>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
              <div class="category-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
                <h3>Traditional Crafts</h3>
                <p>Handmade items from Liberian artisans</p>
              </div>
              <div class="category-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👗</div>
                <h3>Fashion & Textiles</h3>
                <p>Traditional clothing and fabrics</p>
              </div>
              <div class="category-card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🌶️</div>
                <h3>Food & Spices</h3>
                <p>Authentic Liberian ingredients</p>
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
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">← Back to Home</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0;">
          <div class="container" style="max-width: 600px; margin: 0 auto;">
            <h1 style="text-align: center; margin-bottom: 3rem; color: #2d3748;">📦 Shipping Calculator</h1>
            <div class="card" style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <form>
                <div style="margin-bottom: 1rem;">
                  <label>Package Weight (lbs)</label>
                  <input type="number" placeholder="Enter weight" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 1rem;">
                  <label>Dimensions (L x W x H inches)</label>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
                    <input type="number" placeholder="Length" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                    <input type="number" placeholder="Width" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                    <input type="number" placeholder="Height" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                  </div>
                </div>
                <div style="margin-bottom: 1rem;">
                  <label>Destination State</label>
                  <select style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                    <option>Select State</option>
                    <option>California</option>
                    <option>New York</option>
                    <option>Texas</option>
                    <option>Florida</option>
                  </select>
                </div>
                <button type="button" onclick="alert('Estimated shipping: $25.99')" style="width: 100%; padding: 1rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                  Calculate Shipping
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // Enhanced Dashboard based on user type
  function showEnhancedDashboard() {
    const user = checkAuth();
    if (!user) {
      showPage('login');
      return;
    }
    
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
        <input type="file" id="profile-upload" accept="image/*" style="display: none;" onchange="handleProfilePictureUpload(event)">
      </div>
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
        <input type="file" id="profile-upload" accept="image/*" style="display: none;" onchange="handleProfilePictureUpload(event)">
      </div>
    `;
  }

  // Login handler
  function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Demo login - check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('auth_token', 'demo_token_' + user.specialID);
      alert('🎉 Welcome back, ' + user.firstName + '!');
      showEnhancedDashboard();
    } else {
      alert('❌ Account not found. Please register first.');
    }
  }

  // Enhanced Registration Submit with Profile Picture and Special ID
  function handleRegistrationSubmit(event) {
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
        profilePicture: null,
        memberSince: new Date().toISOString().split('T')[0],
        verificationStatus: formData.userType === 'seller' ? 'pending' : 'verified'
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth_token', 'demo_token_' + specialID);
      
      // Also store in registered users list for login
      const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
      users.push(userData);
      localStorage.setItem('registered_users', JSON.stringify(users));
      
      // Simulate successful registration
      setTimeout(() => {
        alert('🎉 Registration successful! Welcome to Liberia2USA Express, ' + formData.firstName + '!\n\nYour Special ID: ' + specialID);
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
    alert('🏷️ Add Product feature coming in Phase 3!\n\nYou\'ll be able to:\n• Upload product photos\n• Set prices and descriptions\n• Manage inventory\n• Track sales');
  }

  function showMyProducts() {
    alert('📦 My Products feature coming in Phase 3!\n\nView and manage your:\n• Listed products\n• Product performance\n• Inventory levels\n• Edit listings');
  }

  function showSellerOrders() {
    alert('📋 Seller Orders feature coming in Phase 3!\n\nManage:\n• Incoming orders\n• Order status updates\n• Customer communications\n• Shipping tracking');
  }

  function showSellerSettings() {
    alert('⚙️ Seller Settings feature coming in Phase 3!\n\nCustomize:\n• Business information\n• Payment methods\n• Shipping preferences\n• Verification documents');
  }

  function showSellerHelp() {
    alert('❓ Seller Help Center feature coming in Phase 3!\n\nGet help with:\n• Listing products\n• Managing orders\n• Payment issues\n• Shipping guidelines');
  }

  function showBuyerOrders() {
    alert('📦 Order History feature coming in Phase 3!\n\nTrack:\n• Purchase history\n• Order status\n• Shipping updates\n• Return/exchange requests');
  }

  function showWishlist() {
    alert('❤️ Wishlist feature coming in Phase 3!\n\nManage:\n• Saved products\n• Price drop alerts\n• Reorder favorites\n• Share with friends');
  }

  function showBuyerSettings() {
    alert('⚙️ Buyer Settings feature coming in Phase 3!\n\nUpdate:\n• Personal information\n• Shipping addresses\n• Payment methods\n• Notification preferences');
  }

  function showBuyerSupport() {
    alert('💬 Support Center feature coming in Phase 3!\n\nGet help with:\n• Order issues\n• Payment problems\n• Product questions\n• Account support');
  }

  // Global functions
  window.showPage = showPage;
  window.handleLogin = handleLogin;
  window.handleRegistrationSubmit = handleRegistrationSubmit;
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
  window.generateSpecialID = generateSpecialID;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Liberia2USA Express loaded - Enhanced Dashboards with Profile Pictures');
    showPage('home');
  });

})();