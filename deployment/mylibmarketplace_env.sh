#!/bin/bash

# Environment Configuration for mylibmarketplace.com deployment

# HOSTINGER CLOUD SPECIFIC VARIABLES
DOMAIN="mylibmarketplace.com"
HOSTING_USERNAME="u224660466"
SERVER_IP="31.97.96.196"
SSH_PORT="65002"
PROJECT_PATH="/home/$HOSTING_USERNAME/liberia2usa"
PUBLIC_HTML_PATH="/home/$HOSTING_USERNAME/domains/$DOMAIN/public_html"

# DATABASE CONFIGURATION
MONGO_URL="mongodb+srv://liberia2usa:SecurePass123!@lib2usa.xhw79.mongodb.net/liberia2usa?retryWrites=true&w=majority"

# SECURITY
JWT_SECRET="mylibmarketplace_$(openssl rand -hex 16)_2024_secure"

# FRONTEND URL
FRONTEND_URL="https://$DOMAIN"

echo "🏗️ Configuration for mylibmarketplace.com deployment:"
echo "Username: $HOSTING_USERNAME"
echo "Server IP: $SERVER_IP"
echo "SSH Port: $SSH_PORT"
echo "Domain: $DOMAIN"
echo "Project Path: $PROJECT_PATH"
echo "Public HTML: $PUBLIC_HTML_PATH"
echo "Frontend URL: $FRONTEND_URL"

# Export variables for use in other scripts
export DOMAIN HOSTING_USERNAME SERVER_IP SSH_PORT PROJECT_PATH PUBLIC_HTML_PATH MONGO_URL JWT_SECRET FRONTEND_URL