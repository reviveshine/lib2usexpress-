// Complete fixed login function that connects to backend API
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Show loading state
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = '⏳ Signing In...';
  submitButton.disabled = true;
  
  // Use the backend URL (you may need to update this to match your actual backend)
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