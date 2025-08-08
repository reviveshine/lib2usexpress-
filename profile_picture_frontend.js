// Profile Picture Upload Frontend Implementation
// This will be integrated into the main JavaScript file

// Global variables for profile picture functionality
let currentProfilePicture = null;
let uploadInProgress = false;

// Function to get user's current profile picture
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

// Function to upload profile picture
async function uploadProfilePicture(file) {
  if (uploadInProgress) {
    alert('⏳ Upload already in progress...');
    return;
  }
  
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
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
    
    // Show upload progress
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
      
      // Update UI
      updateProfilePictureUI(data.profile_picture_url);
      
      alert(`🎉 Profile picture uploaded successfully!`);
      
      // Close modal if open
      closeProfileModal();
      
      // Refresh dashboard to show new picture
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

// Function to update upload progress
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

// Function to update profile picture in UI
function updateProfilePictureUI(imageUrl) {
  // Update avatar in navigation
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) {
    navAvatar.src = `${backendUrl}${imageUrl}`;
    navAvatar.style.display = 'block';
  }
  
  // Update profile picture in dashboard
  const dashboardAvatar = document.getElementById('dashboard-avatar');
  if (dashboardAvatar) {
    dashboardAvatar.src = `${backendUrl}${imageUrl}`;
    dashboardAvatar.style.display = 'block';
  }
  
  // Hide default icons
  const defaultIcons = document.querySelectorAll('.default-avatar-icon');
  defaultIcons.forEach(icon => {
    icon.style.display = 'none';
  });
}

// Function to show profile management modal
function showProfileModal() {
  const user = checkAuth();
  if (!user) {
    alert('❌ Please login first');
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px; background: white; border-radius: 15px; padding: 2rem; margin: 2rem auto; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <button onclick="closeProfileModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">✕</button>
      
      <h2 style="text-align: center; margin-bottom: 2rem; color: #2d3748;">👤 Manage Profile</h2>
      
      <!-- Current Profile Picture -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 4px solid #e2e8f0; background: #f7fafc; display: flex; align-items: center; justify-content: center;">
          ${currentProfilePicture ? 
            `<img id="modal-avatar" src="${backendUrl}${currentProfilePicture}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Picture">` :
            `<span style="font-size: 3rem; color: #a0aec0;">👤</span>`
          }
        </div>
        <p style="margin-top: 1rem; color: #718096;">
          ${user.firstName} ${user.lastName}
        </p>
        <p style="color: #a0aec0; font-size: 0.9rem;">
          ID: ${user.specialID || 'N/A'}
        </p>
      </div>
      
      <!-- Upload Section -->
      <div style="border: 2px dashed #e2e8f0; border-radius: 10px; padding: 2rem; text-align: center; margin-bottom: 1rem;">
        <input type="file" id="profile-picture-input" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
        <div onclick="document.getElementById('profile-picture-input').click()" style="cursor: pointer;">
          <div style="font-size: 2rem; margin-bottom: 1rem;">📸</div>
          <p style="margin-bottom: 0.5rem; color: #2d3748; font-weight: bold;">Click to upload new picture</p>
          <p style="color: #718096; font-size: 0.9rem;">JPG, PNG, GIF or WebP • Max 5MB</p>
        </div>
      </div>
      
      <!-- Upload Progress -->
      <div id="upload-progress" style="display: none; margin-bottom: 1rem;">
        <div style="background: #f1f5f9; border-radius: 10px; height: 8px; overflow: hidden;">
          <div id="upload-progress-bar" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
        </div>
        <p id="upload-progress-text" style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem; color: #718096;"></p>
      </div>
      
      <!-- Action Buttons -->
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
  
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  document.body.appendChild(modal);
  
  // Load current profile picture
  loadCurrentProfilePicture();
}

// Function to close profile modal
function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.remove();
  }
}

// Function to handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      const modalAvatar = document.getElementById('modal-avatar');
      if (modalAvatar) {
        modalAvatar.src = e.target.result;
      } else {
        // Create preview if doesn't exist
        const avatarContainer = document.querySelector('#profile-modal .modal-content > div:nth-child(2) > div');
        if (avatarContainer) {
          avatarContainer.innerHTML = `<img id="modal-avatar" src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile Picture Preview">`;
        }
      }
    };
    reader.readAsDataURL(file);
    
    // Show progress section
    const progressSection = document.getElementById('upload-progress');
    if (progressSection) {
      progressSection.style.display = 'block';
    }
    
    // Start upload
    uploadProfilePicture(file);
  }
}

// Function to remove profile picture
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
      
      // Update UI
      removeProfilePictureFromUI();
      
      // Close modal
      closeProfileModal();
      
      // Refresh dashboard
      showPage('dashboard');
      
    } else {
      throw new Error(data.message || 'Failed to remove picture');
    }
    
  } catch (error) {
    console.error('Error removing profile picture:', error);
    alert(`❌ Failed to remove picture: ${error.message}`);
  }
}

// Function to remove profile picture from UI
function removeProfilePictureFromUI() {
  // Remove from navigation
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) {
    navAvatar.style.display = 'none';
  }
  
  // Remove from dashboard
  const dashboardAvatar = document.getElementById('dashboard-avatar');
  if (dashboardAvatar) {
    dashboardAvatar.style.display = 'none';
  }
  
  // Show default icons
  const defaultIcons = document.querySelectorAll('.default-avatar-icon');
  defaultIcons.forEach(icon => {
    icon.style.display = 'block';
  });
}

// Function to load current profile picture
async function loadCurrentProfilePicture() {
  const pictureUrl = await getUserProfilePicture();
  if (pictureUrl) {
    currentProfilePicture = pictureUrl;
    updateProfilePictureUI(pictureUrl);
  }
}

// Initialize profile picture on page load
document.addEventListener('DOMContentLoaded', function() {
  if (checkAuth()) {
    loadCurrentProfilePicture();
  }
});

// Make functions globally available
window.showProfileModal = showProfileModal;
window.closeProfileModal = closeProfileModal;
window.handleFileSelect = handleFileSelect;
window.removeProfilePicture = removeProfilePicture;