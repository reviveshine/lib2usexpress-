# Step-by-Step Deployment Guide for mylibmarketplace.com

## Your Server Details
- **SSH Command**: `ssh -p 65002 u224660466@31.97.96.196`
- **Username**: u224660466
- **Domain**: mylibmarketplace.com
- **Server IP**: 31.97.96.196
- **SSH Port**: 65002

## STEP 1: Connect to Your Server

Open your terminal and run:
```bash
ssh -p 65002 u224660466@31.97.96.196
```

Enter your password when prompted.

## STEP 2: Prepare Your Server

Once connected, run these commands:

```bash
# Check current directory
pwd
# Should show: /home/u224660466

# Update system packages
sudo apt update

# Install required packages (if not already installed)
sudo apt install -y python3 python3-pip python3-venv nodejs npm

# Check versions
python3 --version
node --version
npm --version
```

## STEP 3: Create Project Structure

```bash
# Create project directory
mkdir -p /home/u224660466/liberia2usa
cd /home/u224660466/liberia2usa

# Create subdirectories
mkdir -p backend frontend deployment
```

## STEP 4: Upload Your Files

### Option A: Using Git (if your code is in a repository)
```bash
cd /home/u224660466
git clone YOUR_REPOSITORY_URL liberia2usa
```

### Option B: Using SCP from your local machine
From your local computer (new terminal window):
```bash
# Upload backend files
scp -P 65002 -r /path/to/your/backend u224660466@31.97.96.196:/home/u224660466/liberia2usa/

# Upload frontend files  
scp -P 65002 -r /path/to/your/frontend u224660466@31.97.96.196:/home/u224660466/liberia2usa/

# Upload deployment files
scp -P 65002 -r /path/to/your/deployment u224660466@31.97.96.196:/home/u224660466/liberia2usa/
```

### Option C: Using Hostinger File Manager
1. Login to **hPanel**
2. Go to **File Manager**
3. Navigate to `/home/u224660466/`
4. Create folder `liberia2usa`
5. Upload your project files

## STEP 5: Run the Deployment Script

Back on your server:
```bash
cd /home/u224660466/liberia2usa/deployment

# Make script executable
chmod +x quick_deploy_mylibmarketplace.sh

# Run deployment
./quick_deploy_mylibmarketplace.sh
```

## STEP 6: Verify Deployment

```bash
# Check backend status
cd /home/u224660466/liberia2usa
./manage.sh status

# Test API locally
curl http://localhost:8001/api/health

# Check if files are in public_html
ls -la /home/u224660466/domains/mylibmarketplace.com/public_html/
```

## STEP 7: Enable SSL in Hostinger

1. **Login to hPanel**
2. Go to **SSL** section
3. Find **mylibmarketplace.com**
4. Click **Enable SSL Certificate**
5. Wait for activation (5-30 minutes)

## STEP 8: Configure Domain (if needed)

If mylibmarketplace.com doesn't point to your server:
1. In **hPanel** → **DNS Zone**
2. Ensure A record points to: `31.97.96.196`

## STEP 9: Test Your Live Site

Visit these URLs:
- **Main site**: https://mylibmarketplace.com
- **API health**: https://mylibmarketplace.com/api/health
- **Register page**: https://mylibmarketplace.com/register

## STEP 10: Daily Management

```bash
# Connect to server
ssh -p 65002 u224660466@31.97.96.196

# Check backend status
cd /home/u224660466/liberia2usa
./manage.sh status

# Start backend
./manage.sh start

# Stop backend  
./manage.sh stop

# Restart backend
./manage.sh restart

# View logs
./manage.sh logs
```

## Troubleshooting

### If deployment fails:
```bash
# Check logs
./manage.sh logs

# Check if port 8001 is available
netstat -tlnp | grep :8001

# Manually start backend
cd /home/u224660466/liberia2usa/backend
source venv/bin/activate
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

### If website doesn't load:
1. Check if files are in public_html:
   ```bash
   ls -la /home/u224660466/domains/mylibmarketplace.com/public_html/
   ```
2. Check SSL status in hPanel
3. Verify DNS settings

### If API doesn't work:
1. Check backend is running: `./manage.sh status`
2. Check backend logs: `./manage.sh logs`
3. Test locally: `curl http://localhost:8001/api/health`

## Quick Commands Reference

```bash
# Connect to server
ssh -p 65002 u224660466@31.97.96.196

# Project directory
cd /home/u224660466/liberia2usa

# Backend management
./manage.sh {start|stop|restart|status|logs}

# Check site files
ls -la /home/u224660466/domains/mylibmarketplace.com/public_html/
```