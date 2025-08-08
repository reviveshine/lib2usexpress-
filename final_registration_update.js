// Final Registration Form Update for Live Site
// This code should be integrated into the main JavaScript file

// Update the showPage function to handle register page properly
function updateShowPageForRegistration() {
    // Find and update the register case in the showPage function
    const originalShowPage = window.showPage;
    
    window.showPage = function(page) {
        if (page === 'register') {
            showRegistrationPage();
        } else {
            // Call original showPage for other pages
            originalShowPage(page);
        }
    };
}

function showRegistrationPage() {
    const content = document.getElementById('content');
    if (!content) return;
    
    content.innerHTML = `
        <div style="max-width: 600px; margin: 2rem auto; padding: 0 1rem;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 2rem; border-radius: 15px 15px 0 0; text-align: center; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; left: 20px; font-size: 1.5rem;">🇱🇷</div>
                <div style="position: absolute; top: 15px; right: 30px; font-size: 1.2rem;">🇺🇸</div>
                <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">🚀 Join Bridging Nations 🚀</h1>
                <p style="font-size: 1rem; opacity: 0.9; margin-bottom: 0;">Create Your Liberia2USA Express Account</p>
            </div>
            
            <!-- Registration Form -->
            <div style="background: white; padding: 2.5rem; border-radius: 0 0 15px 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 3px solid #ffd700;">
                <div id="registration-error" style="display: none; background: linear-gradient(135deg, #fef2f2 0%, #fed7d7 100%); color: #dc2626; padding: 1rem; border-radius: 10px; border: 2px solid #fecaca; margin-bottom: 1.5rem; align-items: center;">
                    <span style="font-size: 1.2rem;">⚠️</span>
                    <span id="error-text" style="font-weight: 500; margin-left: 0.5rem;"></span>
                </div>
                
                <div id="registration-success" style="display: none; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); color: #16a34a; padding: 1rem; border-radius: 10px; border: 2px solid #86efac; margin-bottom: 1.5rem; align-items: center;">
                    <span style="font-size: 1.2rem;">✅</span>
                    <span id="success-text" style="font-weight: 500; margin-left: 0.5rem;"></span>
                </div>

                <form id="registration-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- Name Fields -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">👤 First Name *</label>
                            <input type="text" id="firstName" name="firstName" required placeholder="Enter your first name"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">👤 Last Name *</label>
                            <input type="text" id="lastName" name="lastName" required placeholder="Enter your last name"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                        </div>
                    </div>

                    <!-- Email -->
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">📧 Email Address *</label>
                        <input type="email" id="email" name="email" required placeholder="your.email@example.com"
                            style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                    </div>

                    <!-- Password Fields -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">🔒 Password *</label>
                            <input type="password" id="password" name="password" required placeholder="Create a strong password"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">🔒 Confirm Password *</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                        </div>
                    </div>

                    <!-- User Type -->
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">🎯 I want to... *</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                            <label id="buyer-option" style="display: flex; align-items: center; padding: 0.875rem; border: 2px solid #dc2626; border-radius: 8px; cursor: pointer; transition: all 0.3s; background: #fef2f2;">
                                <input type="radio" name="userType" value="buyer" checked style="margin-right: 0.5rem;">
                                <div>
                                    <div style="font-weight: 600; color: #2563eb;">🛍️ Buy Products</div>
                                    <div style="font-size: 0.85rem; color: #6b7280;">Shop from Liberian sellers</div>
                                </div>
                            </label>
                            <label id="seller-option" style="display: flex; align-items: center; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: all 0.3s; background: white;">
                                <input type="radio" name="userType" value="seller" style="margin-right: 0.5rem;">
                                <div>
                                    <div style="font-weight: 600; color: #dc2626;">🏪 Sell Products</div>
                                    <div style="font-size: 0.85rem; color: #6b7280;">List products from Liberia</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Location and Phone -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">📍 Location *</label>
                            <input type="text" id="location" name="location" required placeholder="e.g., New York, USA"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                            <p id="location-hint" style="font-size: 0.85rem; color: #6b7280; margin-top: 0.5rem; margin-bottom: 0;">Buyers must be in USA, Sellers must be in Liberia</p>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600; font-size: 0.95rem;">📱 Phone (Optional)</label>
                            <input type="tel" id="phone" name="phone" placeholder="Your phone number"
                                style="width: 100%; padding: 0.875rem; border: 2px solid #d1d5db; border-radius: 8px; font-size: 1rem; transition: all 0.3s; outline: none; box-sizing: border-box;">
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" id="register-btn"
                        style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                        🚀 Create Account & Join the Celebration!
                    </button>
                </form>

                <!-- Login Link -->
                <div style="text-align: center; margin-top: 2rem; padding: 1rem; background-color: #f9fafb; border-radius: 10px;">
                    <p style="color: #6b7280; margin: 0; font-size: 1rem;">
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
    console.log('🔐 Initializing registration form...');
    
    // User type selection
    const buyerOption = document.getElementById('buyer-option');
    const sellerOption = document.getElementById('seller-option');
    const locationInput = document.getElementById('location');
    const locationHint = document.getElementById('location-hint');

    if (buyerOption && sellerOption) {
        buyerOption.addEventListener('click', () => {
            buyerOption.style.borderColor = '#dc2626';
            buyerOption.style.backgroundColor = '#fef2f2';
            sellerOption.style.borderColor = '#d1d5db';
            sellerOption.style.backgroundColor = 'white';
            
            if (locationHint) locationHint.textContent = 'Buyers must be located in USA (e.g., "New York, USA")';
            if (locationInput) locationInput.placeholder = 'e.g., New York, USA';
        });

        sellerOption.addEventListener('click', () => {
            sellerOption.style.borderColor = '#dc2626';
            sellerOption.style.backgroundColor = '#fef2f2';
            buyerOption.style.borderColor = '#d1d5db';
            buyerOption.style.backgroundColor = 'white';
            
            if (locationHint) locationHint.textContent = 'Sellers must be located in Liberia (e.g., "Monrovia, Liberia")';
            if (locationInput) locationInput.placeholder = 'e.g., Monrovia, Liberia';
        });
    }

    // Form submission
    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', handleRegistrationSubmit);
    }
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    console.log('🔐 Registration form submitted');
    
    const errorDiv = document.getElementById('registration-error');
    const successDiv = document.getElementById('registration-success');
    const errorText = document.getElementById('error-text');
    const successText = document.getElementById('success-text');
    const submitButton = document.getElementById('register-btn');
    
    // Hide previous messages
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    
    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = '⏳ Creating Account...';
    submitButton.disabled = true;
    submitButton.style.background = 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
    submitButton.style.cursor = 'not-allowed';
    
    // Collect form data
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        userType: document.querySelector('input[name="userType"]:checked').value,
        location: document.getElementById('location').value.trim(),
        phone: document.getElementById('phone').value.trim()
    };
    
    console.log('🔐 Form data collected:', { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });
    
    // Client-side validation
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors.length > 0) {
        showRegistrationError(validationErrors[0]);
        resetSubmitButton(submitButton, originalButtonText);
        return;
    }
    
    try {
        // Use the backend URL from testing
        const API_BASE = 'https://1cf5d37c-b2de-41de-b25f-6ce6b0986561.preview.emergentagent.com';
        const { confirmPassword, ...registrationData } = formData;
        
        console.log('🔐 Sending registration request to:', API_BASE + '/api/auth/register');
        
        const response = await fetch(API_BASE + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData)
        });
        
        console.log('🔐 Registration response status:', response.status);
        
        const data = await response.json();
        console.log('🔐 Registration response data:', data);
        
        if (response.ok && data.success) {
            console.log('🔐 Registration successful!');
            
            // Store auth data
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Show success message
            showRegistrationSuccess('🎉 Welcome to Liberia2USA Express, ' + data.user.firstName + '! Account created successfully!');
            
            // Redirect based on user type
            setTimeout(() => {
                if (data.user.userType === 'seller') {
                    console.log('🏪 Redirecting seller to dashboard');
                    showPage('dashboard');
                } else {
                    console.log('🛍️ Redirecting buyer to marketplace');
                    showPage('marketplace');
                }
            }, 2000);
            
        } else {
            console.error('🔐 Registration failed:', data);
            const errorMessage = data.message || data.detail || 'Registration failed. Please try again.';
            showRegistrationError(errorMessage);
        }
        
    } catch (error) {
        console.error('🔐 Registration request failed:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showRegistrationError('Network error: Unable to connect to server. Please check your internet connection.');
        } else {
            showRegistrationError('Registration failed. Please try again.');
        }
    } finally {
        resetSubmitButton(submitButton, originalButtonText);
    }
}

// Validation functions
function validateRegistrationForm(formData) {
    const errors = [];
    
    // Name validation
    if (formData.firstName.length < 2) {
        errors.push('First name must be at least 2 characters long');
    }
    if (formData.lastName.length < 2) {
        errors.push('Last name must be at least 2 characters long');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Password validation
    if (formData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    // Location validation based on user type
    const location = formData.location.toLowerCase().trim();
    
    if (formData.userType === 'seller' && !location.includes('liberia')) {
        errors.push('Sellers must be located in Liberia (e.g., "Monrovia, Liberia")');
    }
    
    if (formData.userType === 'buyer' && !(location.includes('usa') || location.includes('united states') || location.includes('america'))) {
        errors.push('Buyers must be located in the USA (e.g., "New York, USA" or "California, United States")');
    }
    
    // Phone validation (optional but if provided should be valid)
    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
        errors.push('Please enter a valid phone number (at least 10 digits)');
    }
    
    return errors;
}

function showRegistrationError(message) {
    const errorDiv = document.getElementById('registration-error');
    const errorText = document.getElementById('error-text');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'flex';
        
        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function showRegistrationSuccess(message) {
    const successDiv = document.getElementById('registration-success');
    const successText = document.getElementById('success-text');
    if (successDiv && successText) {
        successText.textContent = message;
        successDiv.style.display = 'flex';
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function resetSubmitButton(button, originalText) {
    button.textContent = originalText;
    button.disabled = false;
    button.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    button.style.cursor = 'pointer';
}

// Initialize when the page loads
console.log('🔐 Registration functionality loaded and ready!');

// Update the existing showPage function when this script loads
updateShowPageForRegistration();