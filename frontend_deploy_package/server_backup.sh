#!/bin/bash
# Run this on your Hostinger server BEFORE uploading new files
cd ~/domains/libtousa.com/public_html/
cp -r static static_backup_$(date +%Y%m%d_%H%M%S)
cp index.html index.html.backup_$(date +%Y%m%d_%H%M%S)
cp asset-manifest.json asset-manifest.json.backup_$(date +%Y%m%d_%H%M%S)
echo "Backup completed!"
