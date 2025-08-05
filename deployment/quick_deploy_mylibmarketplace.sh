#!/bin/bash

# Quick Deployment Script for mylibmarketplace.com on Hostinger Cloud Startup
# Run this script after uploading your files to the server

set -e  # Exit on any error

echo "🚀 Starting deployment for mylibmarketplace.com..."

# Load environment variables
source ./mylibmarketplace_env.sh

# Check if we're on the right server
if [[ $(hostname) != *"hostinger"* ]] && [[ $(pwd) != *"/home/"* ]]; then
    echo "⚠️ Warning: This doesn't look like a Hostinger server. Continue? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📂 Setting up project structure..."
mkdir -p "$PROJECT_PATH"
mkdir -p "$PUBLIC_HTML_PATH"

echo "🐍 Setting up Python backend..."
cd "$PROJECT_PATH/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Python dependencies installed"

echo "⚛️ Building React frontend..."
cd "$PROJECT_PATH/frontend"

# Check if Node.js is available
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    # Install Node.js dependencies
    npm install
    
    # Create production environment file
    echo "REACT_APP_BACKEND_URL=$FRONTEND_URL" > .env.production
    
    # Build the React app
    npm run build
    
    # Copy to public_html
    cp -r build/* "$PUBLIC_HTML_PATH/"
    
    echo "✅ React app built and deployed to public_html"
else
    echo "⚠️ Node.js not found. Please build the React app locally and upload to $PUBLIC_HTML_PATH"
    echo "Commands to run locally:"
    echo "  npm install"
    echo "  echo 'REACT_APP_BACKEND_URL=$FRONTEND_URL' > .env.production"
    echo "  npm run build"
    echo "  Then upload build/* to $PUBLIC_HTML_PATH"
fi

echo "🔐 Setting up backend environment..."
cd "$PROJECT_PATH/backend"

# Create production .env file
cat > .env << EOF
MONGO_URL=$MONGO_URL
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
EOF

echo "✅ Backend environment configured"

echo "🎛️ Setting up process management..."
cat > "$PROJECT_PATH/manage.sh" << 'EOF'
#!/bin/bash

BACKEND_DIR="/home/u123456789/liberia2usa/backend"
PID_FILE="$BACKEND_DIR/backend.pid"
LOG_FILE="$BACKEND_DIR/backend.log"

case "$1" in
    start)
        echo "Starting mylibmarketplace backend..."
        cd "$BACKEND_DIR"
        source venv/bin/activate
        nohup uvicorn server:app --host 0.0.0.0 --port 8001 > "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "Backend started with PID $(cat $PID_FILE)"
        echo "Logs: tail -f $LOG_FILE"
        ;;
    stop)
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill -0 "$PID" 2>/dev/null; then
                kill "$PID"
                rm "$PID_FILE"
                echo "Backend stopped"
            else
                echo "Backend was not running"
                rm "$PID_FILE"
            fi
        else
            echo "PID file not found, backend may not be running"
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
                echo "Backend is running (PID: $PID)"
                echo "URL: https://mylibmarketplace.com/api/health"
            else
                echo "Backend is not running (stale PID file)"
                rm "$PID_FILE"
            fi
        else
            echo "Backend is not running"
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
        echo ""
        echo "Examples:"
        echo "  $0 start    # Start the backend server"
        echo "  $0 status   # Check if backend is running"
        echo "  $0 logs     # View live backend logs"
        echo "  $0 restart  # Restart the backend"
        exit 1
        ;;
esac
EOF

chmod +x "$PROJECT_PATH/manage.sh"

echo "🚀 Starting the backend service..."
cd "$PROJECT_PATH"
./manage.sh start

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🧪 Testing the deployment..."
./manage.sh status

# Test health endpoint
if curl -sf http://localhost:8001/api/health > /dev/null; then
    echo "✅ Backend health check passed"
else
    echo "⚠️ Backend health check failed - check logs: ./manage.sh logs"
fi

echo ""
echo "🎉 Deployment completed for mylibmarketplace.com!"
echo ""
echo "📋 Next Steps:"
echo "1. 🌐 Visit your site: https://mylibmarketplace.com"
echo "2. 🔧 Test API endpoint: https://mylibmarketplace.com/api/health"
echo "3. 🔐 Enable SSL in Hostinger hPanel (SSL section)"
echo "4. 📊 Monitor with: $PROJECT_PATH/manage.sh status"
echo "5. 📝 View logs with: $PROJECT_PATH/manage.sh logs"
echo ""
echo "🛠️ Management Commands:"
echo "   ./manage.sh start    # Start backend"
echo "   ./manage.sh stop     # Stop backend"
echo "   ./manage.sh restart  # Restart backend"
echo "   ./manage.sh status   # Check status"
echo "   ./manage.sh logs     # View logs"
echo ""
echo "🆘 If you need help: Check the logs or contact support"