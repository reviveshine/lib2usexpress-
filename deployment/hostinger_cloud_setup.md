# Liberia2USA Express Deployment on Hostinger Cloud Startup
## Domain: mylibmarketplace.com

## STEP 1: Access Your Hostinger Cloud Panel

1. **Login to Hostinger** → Go to **hPanel**
2. **Navigate to Cloud Hosting** → Select your **mylibmarketplace.com** plan
3. **Get SSH Access**:
   - Go to **Advanced** → **SSH Access**
   - Enable SSH access
   - Note your SSH credentials

## STEP 2: Connect via SSH

```bash
# Connect to your Hostinger Cloud server
ssh u123456789@mylibmarketplace.com
# (Replace u123456789 with your actual username from Hostinger)
```

## STEP 3: Hostinger Cloud-Specific Setup

### Check Available Resources:
```bash
# Check Python version (should be 3.8+)
python3 --version

# Check available space
df -h

# Check memory
free -h

# Install additional packages if needed
sudo apt update
sudo apt install -y python3-pip python3-venv
```

## STEP 4: Project Structure for Hostinger Cloud

```
/home/u123456789/
├── domains/
│   └── mylibmarketplace.com/
│       └── public_html/          # This is where React build goes
├── liberia2usa/                  # Main project folder
│   ├── backend/
│   ├── frontend/
│   └── deployment/
```

## STEP 5: Upload Your Application Files

### Option A: Git Clone (Recommended)
```bash
cd /home/u123456789
git clone YOUR_REPOSITORY_URL liberia2usa
```

### Option B: File Manager Upload
1. In hPanel → **File Manager**
2. Navigate to `/home/u123456789/`
3. Create folder `liberia2usa`
4. Upload your project files

## STEP 6: Backend Setup

```bash
cd /home/u123456789/liberia2usa/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## STEP 7: Frontend Build and Deploy

```bash
cd /home/u123456789/liberia2usa/frontend

# Install dependencies
npm install

# Build for production with correct backend URL
echo "REACT_APP_BACKEND_URL=https://mylibmarketplace.com" > .env.production
npm run build

# Copy built files to public_html
cp -r build/* /home/u123456789/domains/mylibmarketplace.com/public_html/
```

## STEP 8: Backend Configuration

Create production environment file:
```bash
cd /home/u123456789/liberia2usa/backend

cat > .env << 'EOF'
MONGO_URL=mongodb+srv://liberia2usa:SecurePass123!@lib2usa.xhw79.mongodb.net/liberia2usa?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_change_this_in_production_mylibmarketplace2024
FRONTEND_URL=https://mylibmarketplace.com
EOF
```

## STEP 9: Start Backend Service

Create startup script:
```bash
cat > /home/u123456789/liberia2usa/start_backend.sh << 'EOF'
#!/bin/bash
cd /home/u123456789/liberia2usa/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 &
echo $! > backend.pid
EOF

chmod +x /home/u123456789/liberia2usa/start_backend.sh

# Start the backend
./start_backend.sh
```

## STEP 10: Nginx Configuration for Hostinger Cloud

```bash
# Create nginx config file
cat > /home/u123456789/nginx.conf << 'EOF'
server {
    listen 80;
    server_name mylibmarketplace.com www.mylibmarketplace.com;
    root /home/u123456789/domains/mylibmarketplace.com/public_html;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
```

## STEP 11: SSL Setup (Hostinger provides free SSL)

1. **In hPanel**:
   - Go to **SSL** section
   - Enable **Free SSL Certificate** for mylibmarketplace.com
   - Wait for SSL to activate (5-30 minutes)

## STEP 12: Process Management

Create a simple process manager:
```bash
cat > /home/u123456789/liberia2usa/manage.sh << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "Starting Liberia2USA Express backend..."
        cd /home/u123456789/liberia2usa/backend
        source venv/bin/activate
        nohup uvicorn server:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
        echo $! > backend.pid
        echo "Backend started with PID $(cat backend.pid)"
        ;;
    stop)
        echo "Stopping backend..."
        if [ -f backend.pid ]; then
            kill $(cat backend.pid)
            rm backend.pid
            echo "Backend stopped"
        else
            echo "Backend not running"
        fi
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f backend.pid ] && kill -0 $(cat backend.pid) 2>/dev/null; then
            echo "Backend is running (PID: $(cat backend.pid))"
        else
            echo "Backend is not running"
        fi
        ;;
    logs)
        tail -f backend.log
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

chmod +x /home/u123456789/liberia2usa/manage.sh
```

## STEP 13: Start Everything

```bash
# Start the backend
cd /home/u123456789/liberia2usa
./manage.sh start

# Check status
./manage.sh status
```