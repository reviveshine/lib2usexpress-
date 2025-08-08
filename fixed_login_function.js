// Fixed login function that connects to backend API
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Show loading state
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = '⏳ Signing In...';
  submitButton.disabled = true;
  
  // Make API call to backend
  fetch('https://express-shipping-2.emergent.host/api/auth/login', {
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
      throw new Error('Login failed');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
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
        showEnhancedDashboard();
      } else {
        showPage('marketplace');
      }
    } else {
      throw new Error(data.message || 'Login failed');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('❌ Login failed. Please check your credentials and try again.');
  })
  .finally(() => {
    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  });
}