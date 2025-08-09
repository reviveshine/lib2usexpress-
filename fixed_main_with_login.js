/*! Liberia2USA Express - Bridging Nations - WITH FIXED LOGIN */
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

  // FIXED LOGIN FUNCTION WITH BACKEND API INTEGRATION
  function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '⏳ Signing In...';
    submitButton.disabled = true;
    
    // Backend API endpoint
    const backendUrl = 'https://c70051fd-5d81-4932-80e9-45f66884f42e.preview.emergentagent.com';
    
    // Make API call to backend
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
        return response.json().then(err => Promise.reject(err));
      }
      return response.json();
    })
    .then(data => {
      if (data.success && data.user && data.token) {
        // Store authentication data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Success message with special ID if available
        let welcomeMessage = `🎉 Welcome back, ${data.user.firstName}!`;
        if (data.user.specialID) {
          welcomeMessage += `\n🆔 Your ID: ${data.user.specialID}`;
        }
        
        alert(welcomeMessage);
        
        // Redirect based on user type
        if (data.user.userType === 'seller') {
          showPage('dashboard');
        } else {
          showPage('marketplace');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      let errorMessage = '❌ Login failed. Please check your credentials and try again.';
      
      if (error.message) {
        errorMessage = `❌ ${error.message}`;
      }
      
      alert(errorMessage);
    })
    .finally(() => {
      // Reset button state
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
    
    // Store user data with special ID
    const userData = {
      ...formData,
      specialID: specialID,
      memberSince: new Date().toISOString().split('T')[0]
    };
    
    // Store in localStorage (demo mode)
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
    users.push(userData);
    localStorage.setItem('registered_users', JSON.stringify(users));
    
    // Auto-login after registration
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth_token', 'demo_token_' + specialID);
    
    // Success message with special ID
    alert(`🎉 Account created successfully!\n\n🆔 Your Special ID: ${specialID}\n\nWelcome to Bridging Nations, ${formData.firstName}!`);
    
    // Redirect based on user type
    if (formData.userType === 'seller') {
      showPage('dashboard');
    } else {
      showPage('marketplace');
    }
    
    // Reset form
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
            <div class="nav-links">
              <button onclick="showPage('home')" class="nav-link" style="background:none;border:none;cursor:pointer;">Home</button>
              <button onclick="showPage('marketplace')" class="nav-link" style="background:none;border:none;cursor:pointer;">Marketplace</button>
              <button onclick="showPage('dashboard')" class="nav-link" style="background:none;border:none;cursor:pointer;">Dashboard</button>
              <button onclick="logout()" class="nav-link" style="background:none;border:none;cursor:pointer;">Logout</button>
            </div>
          </div>
        </nav>

        <section class="page" style="padding: 4rem 0; min-height: 80vh;">
          <div class="container">
            <div style="text-align: center; margin-bottom: 3rem;">
              <h1 style="color: #2d3748; margin-bottom: 1rem;">🎯 Dashboard</h1>
              <p style="color: #718096;">Welcome back, ${user.firstName}! ${user.specialID ? `Your ID: ${user.specialID}` : ''}</p>
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
                  <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                  <h3 style="color: #2d3748; margin-bottom: 1rem;">Messages</h3>
                  <p style="color: #718096; margin-bottom: 1rem;">Chat with customers</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    View Messages
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
                  <p style="color: #718096; margin-bottom: 1rem;">Update your information</p>
                  <button style="background: #dc2626; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 25px; cursor: pointer;">
                    Edit Profile
                  </button>
                </div>
              </div>
            `}
          </div>
        </section>
      </div>
    `;
  }

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    alert('👋 Logged out successfully!');
    showPage('home');
  }

  // Global functions
  window.showPage = showPage;
  window.handleLogin = handleLogin;
  window.handleRegistrationSubmit = handleRegistrationSubmit;
  window.logout = logout;
  window.generateSpecialID = generateSpecialID;

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Liberia2USA Express loaded - WITH FIXED LOGIN');
    showPage('home');
  });

})();