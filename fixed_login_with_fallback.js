// IMPROVED LOGIN FUNCTION WITH DEMO FALLBACK
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
  const backendUrl = 'https://9e2f71ee-c51a-4355-9095-21aac0960698.preview.emergentagent.com';
  
  // Function to try demo login from localStorage
  function tryDemoLogin() {
    console.log('Trying demo login from localStorage...');
    
    const registeredUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Demo login success
      localStorage.setItem('auth_token', 'demo_token_' + user.specialID);
      localStorage.setItem('user', JSON.stringify(user));
      
      let welcomeMessage = `🎉 Welcome back, ${user.firstName}!`;
      if (user.specialID) {
        welcomeMessage += `\n🆔 Your ID: ${user.specialID}`;
      }
      
      alert(welcomeMessage);
      
      // Redirect based on user type
      if (user.userType === 'seller') {
        showPage('dashboard');
      } else {
        showPage('marketplace');
      }
      return true;
    }
    return false;
  }
  
  // Try backend API first
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
      // Backend login failed, try demo login
      if (tryDemoLogin()) {
        return; // Demo login successful
      }
      // Both backend and demo failed
      throw new Error('Invalid email or password');
    }
    return response.json();
  })
  .then(data => {
    if (data && data.success && data.user && data.token) {
      // Backend login success
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    
    // If backend failed, try demo login as fallback
    if (!tryDemoLogin()) {
      // Show helpful error message
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
    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}