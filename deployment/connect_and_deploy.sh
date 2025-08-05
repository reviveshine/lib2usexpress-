#!/bin/bash

# Complete Connection and Deployment Script for mylibmarketplace.com
# Your specific Hostinger Cloud server credentials

echo "🚀 Connecting to your Hostinger Cloud server for mylibmarketplace.com"
echo "Server: u224660466@31.97.96.196:65002"
echo ""

# Function to run commands on remote server
run_remote() {
    echo "📡 Executing on server: $1"
    ssh -p 65002 u224660466@31.97.96.196 "$1"
}

# Function to upload files
upload_files() {
    echo "📤 Uploading files to server..."
    scp -P 65002 -r ../backend ../frontend ../deployment u224660466@31.97.96.196:/home/u224660466/liberia2usa/
}

echo "🔗 Testing connection to your server..."
if ssh -p 65002 u224660466@31.97.96.196 'echo "✅ Connected successfully to $(hostname)"'; then
    echo ""
    echo "🎯 What would you like to do?"
    echo "1. Connect to server (SSH shell)"
    echo "2. Upload project files"
    echo "3. Run deployment script"
    echo "4. Check backend status"
    echo "5. View backend logs"
    echo "6. Full deployment (upload + deploy)"
    echo ""
    read -p "Choose option (1-6): " choice
    
    case $choice in
        1)
            echo "🖥️ Opening SSH shell to your server..."
            ssh -p 65002 u224660466@31.97.96.196
            ;;
        2)
            upload_files
            ;;
        3)
            echo "🚀 Running deployment script..."
            run_remote "cd /home/u224660466/liberia2usa/deployment && chmod +x quick_deploy_mylibmarketplace.sh && ./quick_deploy_mylibmarketplace.sh"
            ;;
        4)
            echo "📊 Checking backend status..."
            run_remote "cd /home/u224660466/liberia2usa && ./manage.sh status"
            ;;
        5)
            echo "📝 Viewing backend logs..."
            run_remote "cd /home/u224660466/liberia2usa && ./manage.sh logs"
            ;;
        6)
            echo "🎯 Starting full deployment..."
            upload_files
            echo "⏳ Waiting for upload to complete..."
            sleep 3
            run_remote "cd /home/u224660466/liberia2usa/deployment && chmod +x quick_deploy_mylibmarketplace.sh && ./quick_deploy_mylibmarketplace.sh"
            ;;
        *)
            echo "❌ Invalid option. Please run the script again."
            exit 1
            ;;
    esac
else
    echo "❌ Connection failed. Please check:"
    echo "   - Your internet connection"
    echo "   - SSH access is enabled in Hostinger hPanel"
    echo "   - Server credentials are correct"
    echo ""
    echo "📞 Manual connection command:"
    echo "ssh -p 65002 u224660466@31.97.96.196"
fi