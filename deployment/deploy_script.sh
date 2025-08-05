#!/bin/bash

# Complete Deployment Script for Liberia2USA Express on Hostinger
# Run this script after uploading your files to the server

set -e  # Exit on any error

echo "🚀 Starting deployment of Liberia2USA Express..."

# Variables (CHANGE THESE)
DOMAIN="yourdomain.com"
USERNAME="yourusername"
PROJECT_DIR="/home/$USERNAME/liberia2usa"

echo "📁 Setting up project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

echo "🐍 Setting up Python backend..."
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "⚛️ Building React frontend..."
cd ../frontend

# Install Node.js dependencies (if Node.js is installed)
if command -v npm &> /dev/null; then
    npm install
    npm run build
    echo "✅ React app built successfully"
else
    echo "⚠️ Node.js not found. You'll need to build the React app locally and upload the build folder."
fi

echo "🔒 Setting up environment variables..."
cd ../backend

# Create production .env file
cat > .env << EOL
MONGO_URL=mongodb+srv://liberia2usa:SecurePass123!@lib2usa.xhw79.mongodb.net/liberia2usa?retryWrites=true&w=majority
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://$DOMAIN
EOL

echo "🔧 Setting up systemd service..."
# Copy service file to systemd (requires sudo)
sudo cp ../deployment/systemd_backend.service /etc/systemd/system/liberia2usa-backend.service

# Update service file with correct paths
sudo sed -i "s/yourusername/$USERNAME/g" /etc/systemd/system/liberia2usa-backend.service
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/systemd/system/liberia2usa-backend.service

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable liberia2usa-backend.service
sudo systemctl start liberia2usa-backend.service

echo "🌐 Setting up Nginx..."
# Copy Nginx config (requires sudo)
sudo cp ../deployment/nginx.conf /etc/nginx/sites-available/liberia2usa
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/liberia2usa
sudo sed -i "s/yourusername/$USERNAME/g" /etc/nginx/sites-available/liberia2usa

# Enable the site
sudo ln -sf /etc/nginx/sites-available/liberia2usa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "🔐 Setting up SSL certificate..."
# Install Certbot for free SSL
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

echo "🧪 Testing the deployment..."
sleep 5
curl -f http://localhost:8001/api/health || echo "⚠️ Backend health check failed"
curl -f https://$DOMAIN/api/health || echo "⚠️ Public API health check failed"

echo "✅ Deployment completed!"
echo "🌍 Your site should be live at: https://$DOMAIN"
echo "📊 Backend API: https://$DOMAIN/api"
echo "🔧 Check backend logs: sudo journalctl -u liberia2usa-backend.service -f"
echo "📋 Check Nginx logs: sudo tail -f /var/log/nginx/error.log"