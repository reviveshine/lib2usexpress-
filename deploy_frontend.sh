#!/bin/bash

# Liberia2USA Express Frontend Deployment Script
# This script prepares the deployment package for the "Bridging Nations" theme

echo "🚀 Preparing Liberia2USA Express Frontend Deployment..."
echo "📦 Theme: Bridging Nations Professional Design"

# Create deployment directory
DEPLOY_DIR="/app/frontend_deploy_package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy build files
echo "📄 Copying build files..."
cp -r /app/frontend/build/* $DEPLOY_DIR/

# Create deployment instructions
cat > $DEPLOY_DIR/UPLOAD_INSTRUCTIONS.txt << 'EOF'
=== Liberia2USA Express - Frontend Deployment Instructions ===

1. Upload ALL files in this directory to: ~/domains/libtousa.com/public_html/

2. Make sure to replace:
   - index.html
   - asset-manifest.json
   - static/ directory (entire folder)

3. Keep the existing .htaccess file (DO NOT delete it!)

4. Set proper permissions on server:
   chmod 644 index.html asset-manifest.json
   chmod -R 755 static/

5. Clear browser cache and visit https://libtousa.com

Expected result: Professional "Bridging Nations" theme should be live!
EOF

# Create backup script for server
cat > $DEPLOY_DIR/server_backup.sh << 'EOF'
#!/bin/bash
# Run this on your Hostinger server BEFORE uploading new files
cd ~/domains/libtousa.com/public_html/
cp -r static static_backup_$(date +%Y%m%d_%H%M%S)
cp index.html index.html.backup_$(date +%Y%m%d_%H%M%S)
cp asset-manifest.json asset-manifest.json.backup_$(date +%Y%m%d_%H%M%S)
echo "Backup completed!"
EOF

chmod +x $DEPLOY_DIR/server_backup.sh

# Show deployment package contents
echo ""
echo "✅ Deployment package created in: $DEPLOY_DIR"
echo "📊 Package contents:"
ls -la $DEPLOY_DIR/

echo ""
echo "🎯 File sizes:"
du -h $DEPLOY_DIR/*

echo ""
echo "🌟 Deployment package ready!"
echo "📂 Location: $DEPLOY_DIR"
echo "🔧 Upload all files in this directory to your Hostinger server"
echo "🌐 Target: ~/domains/libtousa.com/public_html/"
echo ""
echo "After upload, visit https://libtousa.com to see the new 'Bridging Nations' theme!"