# Complete Deployment Guide for mylibmarketplace.com
## Repository: git@github.com:reviveshine/lib2usexpress-.git

## Your Server Details
- **SSH**: `ssh -p 65002 u224660466@31.97.96.196`
- **Domain**: mylibmarketplace.com
- **Repository**: git@github.com:reviveshine/lib2usexpress-.git

---

## STEP 1: Connect to Your Hostinger Server

```bash
ssh -p 65002 u224660466@31.97.96.196
```

## STEP 2: Install Required Software

Once connected, run:
```bash
# Update system
sudo apt update

# Install essential packages
sudo apt install -y git python3 python3-pip python3-venv nodejs npm curl

# Check versions
python3 --version
node --version
git --version
```

## STEP 3: Clone Your Repository

```bash
# Navigate to home directory
cd /home/u224660466

# Clone your repository (will try HTTPS first, then SSH)
git clone https://github.com/reviveshine/lib2usexpress-.git liberia2usa

# OR if you have SSH keys set up:
# git clone git@github.com:reviveshine/lib2usexpress-.git liberia2usa

# Enter the project directory
cd liberia2usa
```

## STEP 4: Create and Run Deployment Script

Create the deployment script directly on the server:

```bash
# Create deployment directory if it doesn't exist
mkdir -p deployment
cd deployment

# Create the deployment script
cat > quick_deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying mylibmarketplace.com..."

# Set variables
PROJECT_PATH="/home/u224660466/liberia2usa"
PUBLIC_HTML_PATH="/home/u224660466/domains/mylibmarketplace.com/public_html"
DOMAIN="mylibmarketplace.com"

# Ensure public_html directory exists
mkdir -p "$PUBLIC_HTML_PATH"

echo "🐍 Setting up Python backend..."
cd "$PROJECT_PATH/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "⚛️ Building React frontend..."
cd "$PROJECT_PATH/frontend"

# Install Node.js dependencies
npm install

# Create production environment file
echo "REACT_APP_BACKEND_URL=https://$DOMAIN" > .env.production

# Build React app
npm run build

# Copy to public_html
cp -r build/* "$PUBLIC_HTML_PATH/"

echo "🔐 Setting up backend environment..."
cd "$PROJECT_PATH/backend"

# Create .env file
cat > .env << ENVEOF
MONGO_URL=mongodb+srv://liberia2usa:SecurePass123!@lib2usa.xhw79.mongodb.net/liberia2usa?retryWrites=true&w=majority
JWT_SECRET=mylibmarketplace_super_secure_$(openssl rand -hex 16)_2024
FRONTEND_URL=https://$DOMAIN
ENVEOF

echo "🎛️ Creating management script..."
cat > "$PROJECT_PATH/manage.sh" << 'MGMT'
#!/bin/bash
BACKEND_DIR="/home/u224660466/liberia2usa/backend"
PID_FILE="$BACKEND_DIR/backend.pid"
LOG_FILE="$BACKEND_DIR/backend.log"

case "$1" in
    start)
        echo "Starting mylibmarketplace backend..."
        cd "$BACKEND_DIR"
        source venv/bin/activate
        nohup uvicorn server:app --host 0.0.0.0 --port 8001 > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "✅ Backend started with PID $(cat $PID_FILE)"
        echo "🌐 API will be available at: https://mylibmarketplace.com/api/health"
        ;;
    stop)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                rm "$PID_FILE"
                echo "✅ Backend stopped"
            else
                echo "Backend was not running"
                rm "$PID_FILE"
            fi
        else
            echo "Backend is not running"
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 "$PID" 2>/dev/null; then
                echo "✅ Backend is running (PID: $PID)"
                echo "🌐 Site: https://mylibmarketplace.com"
                echo "🔧 API: https://mylibmarketplace.com/api/health"
            else
                echo "❌ Backend is not running (stale PID file)"
                rm "$PID_FILE"
            fi
        else
            echo "❌ Backend is not running"
        fi
        ;;
    logs)
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "Log file not found"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
MGMT

chmod +x "$PROJECT_PATH/manage.sh"

echo "🚀 Starting backend service..."
cd "$PROJECT_PATH"
./manage.sh start

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🧪 Testing deployment..."
./manage.sh status

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Your application is ready:"
echo "🌐 Website: https://mylibmarketplace.com"
echo "🔧 API Health: https://mylibmarketplace.com/api/health"
echo ""
echo "🛠️ Management commands:"
echo "   ./manage.sh start    # Start backend"
echo "   ./manage.sh stop     # Stop backend"  
echo "   ./manage.sh restart  # Restart backend"
echo "   ./manage.sh status   # Check status"
echo "   ./manage.sh logs     # View logs"
echo ""
echo "📝 Next steps:"
echo "1. 🔐 Enable SSL in Hostinger hPanel (SSL section)"
echo "2. 🌐 Visit https://mylibmarketplace.com to test"
echo "3. 📊 Monitor with: ./manage.sh status"
EOF

# Make script executable
chmod +x quick_deploy.sh

# Run deployment
./quick_deploy.sh
```

## STEP 5: Enable SSL Certificate

1. **Login to Hostinger hPanel**
2. Go to **SSL** section
3. Find **mylibmarketplace.com**  
4. Click **Enable SSL Certificate** (Free)
5. Wait 5-30 minutes for activation

## STEP 6: Test Your Deployment

```bash
# Check backend status
cd /home/u224660466/liberia2usa
./manage.sh status

# Test API locally
curl http://localhost:8001/api/health

# Test public API (after SSL is enabled)
curl https://mylibmarketplace.com/api/health
```

## STEP 7: Visit Your Live Site

- **Main Website**: https://mylibmarketplace.com
- **API Health Check**: https://mylibmarketplace.com/api/health
- **Register**: https://mylibmarketplace.com/register
- **Login**: https://mylibmarketplace.com/login

## Daily Management Commands

```bash
# Connect to server
ssh -p 65002 u224660466@31.97.96.196

# Navigate to project
cd /home/u224660466/liberia2usa

# Check status
./manage.sh status

# View logs
./manage.sh logs

# Restart if needed
./manage.sh restart
```

## Update Your Site (Future Updates)

```bash
# Connect to server
ssh -p 65002 u224660466@31.97.96.196

# Navigate to project
cd /home/u224660466/liberia2usa

# Pull latest changes
git pull origin main

# Stop backend
./manage.sh stop

# Rebuild frontend
cd frontend
npm run build
cp -r build/* /home/u224660466/domains/mylibmarketplace.com/public_html/

# Restart backend
cd ..
./manage.sh start
```

## Troubleshooting

### If deployment fails:
```bash
# Check what went wrong
cat deployment/deployment.log

# Check if required software is installed
python3 --version
node --version
npm --version
```

### If backend won't start:
```bash
# Check logs
./manage.sh logs

# Try manual start
cd backend
source venv/bin/activate
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### If website doesn't load:
1. Check files in public_html: `ls -la /home/u224660466/domains/mylibmarketplace.com/public_html/`
2. Enable SSL in hPanel
3. Wait for DNS propagation

---

## 🎯 Quick Summary

1. **Connect**: `ssh -p 65002 u224660466@31.97.96.196`
2. **Clone**: `git clone https://github.com/reviveshine/lib2usexpress-.git liberia2usa`
3. **Deploy**: Run the deployment script above
4. **Enable SSL**: In Hostinger hPanel
5. **Test**: Visit https://mylibmarketplace.com

Your Liberia2USA Express will be live! 🚀