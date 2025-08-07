// Registration update for the custom SPA
function showRegistrationPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div style="max-width: 600px; margin: 2rem auto; padding: 0 1rem;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 2rem; border-radius: 15px 15px 0 0; text-align: center;">
                <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">🚀 Join Bridging Nations 🚀</h1>
                <p>Create Your Liberia2USA Express Account</p>
            </div>
            
            <div style="background: white; padding: 2.5rem; border-radius: 0 0 15px 15px; border: 3px solid #ffd700;">
                <div id="registration-error" style="display: none; background: #fef2f2; color: #dc2626; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <span>⚠️</span> <span id="error-text"></span>
                </div>
                
                <div id="registration-success" style="display: none; background: #f0fdf4; color: #16a34a; padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem;">
                    <span>✅</span> <span id="success-text"></span>
                </div>

                <form id="registration-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label>👤 First Name *</label>
                            <input type="text" id="firstName" required placeholder="Enter your first name"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label>👤 Last Name *</label>
                            <input type="text" id="lastName" required placeholder="Enter your last name"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label>📧 Email Address *</label>
                        <input type="email" id="email" required placeholder="your.email@example.com"
                            style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label>🔒 Password *</label>
                            <input type="password" id="password" required placeholder="Create a strong password"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label>🔒 Confirm Password *</label>
                            <input type="password" id="confirmPassword" required placeholder="Confirm your password"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label>🎯 I want to... *</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                            <label style="padding: 0.875rem; border: 2px solid #dc2626; border-radius: 8px; cursor: pointer; background: #fef2f2;">
                                <input type="radio" name="userType" value="buyer" checked> 🛍️ Buy Products
                            </label>
                            <label style="padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer;">
                                <input type="radio" name="userType" value="seller"> 🏪 Sell Products
                            </label>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label>📍 Location *</label>
                            <input type="text" id="location" required placeholder="e.g., New York, USA"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                            <p style="font-size: 0.85rem; color: #6b7280;">Buyers: USA, Sellers: Liberia</p>
                        </div>
                        <div>
                            <label>📱 Phone (Optional)</label>
                            <input type="tel" id="phone" placeholder="Your phone number"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; box-sizing: border-box;">
                        </div>
                    </div>

                    <button type="submit" id="register-btn"
                        style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">
                        🚀 Create Account & Join the Celebration!
                    </button>
                </form>

                <div style="text-align: center; margin-top: 2rem; padding: 1rem; background-color: #f9fafb; border-radius: 10px;">
                    <p style="margin: 0;">
                        Already have an account? 
                        <a href="#" onclick="showPage('login')" style="color: #dc2626; text-decoration: none; font-weight: bold;">🔑 Login here</a>
                    </p>
                </div>
            </div>
        </div>
    `;

    // Initialize form functionality
    initializeRegistrationForm();
}

function initializeRegistrationForm() {
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', handleRegistrationSubmit);
    }
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    const errorDiv = document.getElementById('registration-error');
    const successDiv = document.getElementById('registration-success');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');
    const submitButton = document.getElementById('register-btn');
    
    // Hide messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Show loading
    submitButton.textContent = '⏳ Creating Account...';
    submitButton.disabled = true;
    
    // Collect data
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        userType: document.querySelector('input[name="userType"]:checked').value,
        location: document.getElementById('location').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    
    // Validation
    if (formData.password !== document.getElementById('confirmPassword').value) {
        errorText.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        submitButton.textContent = '🚀 Create Account & Join the Celebration!';
        submitButton.disabled = false;
        return;
    }
    
    try {
        const response = await fetch('https://libtousa.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            successText.textContent = '🎉 Welcome ' + data.user.firstName + '! Account created successfully!';
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                if (data.user.userType === 'seller') {
                    showPage('dashboard');
                } else {
                    showPage('marketplace');
                }
            }, 2000);
        } else {
            errorText.textContent = data.message || 'Registration failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        errorText.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
    
    submitButton.textContent = '🚀 Create Account & Join the Celebration!';
    submitButton.disabled = false;
}