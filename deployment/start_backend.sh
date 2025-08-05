#!/bin/bash

# Hostinger Backend Startup Script for Liberia2USA Express

# Set environment variables
export PYTHONPATH=/home/yourusername/liberia2usa/backend:$PYTHONPATH
export MONGO_URL="mongodb+srv://liberia2usa:SecurePass123!@lib2usa.xhw79.mongodb.net/liberia2usa?retryWrites=true&w=majority"
export JWT_SECRET="your_super_secure_jwt_secret_change_this_in_production"
export FRONTEND_URL="https://yourdomain.com"

# Navigate to backend directory
cd /home/yourusername/liberia2usa/backend

# Activate virtual environment
source venv/bin/activate

# Start the FastAPI server
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 2

# Alternative for production with gunicorn:
# gunicorn server:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001