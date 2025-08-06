# Liberia2USA Express - "Bridging Nations" Theme Deployment Guide

## Overview
This guide will help you deploy the updated "Bridging Nations" homepage design to your Hostinger server at https://libtousa.com.

## Current Status
✅ Local HomePage.js has been updated with "Bridging Nations" theme
✅ Frontend environment configured for production (https://libtousa.com)
✅ Frontend build completed successfully
⏳ Need to upload new build files to Hostinger server

## Deployment Steps

### Step 1: Connect to your Hostinger server via SSH
```bash
ssh u224660466@libtousa.com
```

### Step 2: Backup current frontend files (recommended)
```bash
cd ~/domains/libtousa.com/public_html/
cp -r static static_backup_$(date +%Y%m%d_%H%M%S)
cp index.html index.html.backup_$(date +%Y%m%d_%H%M%S)
cp asset-manifest.json asset-manifest.json.backup_$(date +%Y%m%d_%H%M%S)
```

### Step 3: Download and upload new build files

#### Option A: Direct file transfer (if you have local access)
Upload the entire contents of `/app/frontend/build/` to `~/domains/libtousa.com/public_html/`

#### Option B: Using wget/curl from the server
```bash
# You'll need to make the build files available via a temporary URL or file transfer service
```

### Step 4: Verify file permissions
```bash
cd ~/domains/libtousa.com/public_html/
chmod 644 index.html asset-manifest.json
chmod -R 755 static/
```

### Step 5: Test the deployment
1. Open https://libtousa.com in your browser
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R) to clear cache
3. Verify the new "Bridging Nations" theme is displaying

## Key Files to Transfer
- `index.html` - Main React app entry point
- `static/` - All CSS, JS, and asset files
- `asset-manifest.json` - Build manifest

## Expected Changes
After successful deployment, you should see:
- Professional "Bridging Nations" header instead of "Independence Day"
- Map background with professional overlay
- Updated messaging: "Connecting Liberian Heritage with American Opportunity"
- Clean, professional design with patriotic color scheme
- Enhanced feature cards

## Troubleshooting
- If changes don't appear, clear browser cache completely
- Check file permissions (644 for files, 755 for directories)
- Ensure .htaccess file is still present and configured correctly
- Backend server should remain untouched and continue running

## Files Generated
The build created the following files in `/app/frontend/build/`:
- index.html (920 bytes)
- asset-manifest.json (369 bytes)
- static/css/main.f0482726.css (3.16 kB gzipped)
- static/js/main.c9b9126d.js (107.54 kB gzipped)

## Next Steps
1. Upload the files to your server
2. Verify the deployment
3. Test all functionality (login, marketplace, etc.)