from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
import uvicorn
from database import connect_to_mongo, close_mongo_connection, get_database, is_database_connected

# Load environment variables
load_dotenv()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secure_jwt_secret_key_here_2025")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 168  # 7 days instead of 24 hours

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)  # Don't raise error if no token provided

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Liberia2USA Express API...")
    await connect_to_mongo()
    print("✅ Application startup completed")
    yield
    # Shutdown
    print("🔄 Shutting down Liberia2USA Express API...")
    await close_mongo_connection()
    print("✅ Application shutdown completed")

# Create FastAPI application
app = FastAPI(
    title="Liberia2USA Express API",
    description="International shipping platform API from Liberia to USA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - very permissive for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token with enhanced error handling"""
    try:
        token = credentials.credentials
        
        # Decode token with detailed error handling
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please login again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTClaimsError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user information",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify user still exists in database
        database = get_database()
        if database is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection unavailable"
            )
        
        user = await database.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any other unexpected errors
        print(f"Unexpected error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)):
    """Get current user from JWT token, return None if not authenticated (for optional auth)"""
    try:
        if not credentials or not credentials.credentials:
            return None
            
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
        
        # Verify user still exists in database
        database = get_database()
        if database is None:
            return None
        
        user = await database.users.find_one({"id": user_id})
        if not user:
            return None
            
        return user_id
        
    except:
        # For optional auth, any error just returns None
        return None

# Add a function to get current user info with full user data
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """Get full user information for current user"""
    database = get_database()
    if database is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable"
        )
    
    user = await database.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists"
        )
    
    return user

# Health check endpoint - must not depend on database for Kubernetes health checks
@app.get("/api/health")
async def health_check():
    """Health check endpoint for Kubernetes deployment"""
    db_connected = is_database_connected()
    
    # Always return 200 OK for Kubernetes health checks
    # Database connection is optional for health check success
    response = {
        "status": "OK",
        "message": "Liberia2USA Express API is running",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "database_connected": db_connected
    }
    
    if db_connected:
        database = get_database()
        if database is not None:
            response["database_name"] = database.name
        else:
            response["database_name"] = "unknown"
    
    return response
    
# Debug endpoint for troubleshooting network issues
@app.get("/api/debug/network")
async def debug_network():
    """Debug endpoint to test network connectivity"""
    return {
        "status": "OK",
        "message": "Network connectivity test successful",
        "timestamp": datetime.utcnow().isoformat(),
        "headers_received": "Check browser network tab for full headers",
        "cors_configured": True
    }

# Kubernetes readiness probe endpoint
@app.get("/api/ready")
async def readiness_check():
    """Readiness check for Kubernetes - requires database connection"""
    db_connected = is_database_connected()
    
    if not db_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not connected"
        )
    
    return {
        "status": "READY",
        "message": "Application is ready to serve requests",
        "timestamp": datetime.utcnow().isoformat(),
        "database_connected": True
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Liberia2USA Express API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth",
            "users": "/api/users",
            "products": "/api/products"
        }
    }

# Import routes with error handling
try:
    from routes.auth import router as auth_router
    from routes.users import router as users_router
    from routes.products import router as products_router
    from routes.shipping import router as shipping_router
    from routes.chat import router as chat_router
    from routes.payments import router as payments_router
    from routes.admin import router as admin_router
    from routes.verification import router as verification_router
    from routes.profile import router as profile_router
    from routes.user_status import router as user_status_router

    app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(users_router, prefix="/api/users", tags=["Users"])
    app.include_router(products_router, prefix="/api/products", tags=["Products"])
    app.include_router(shipping_router, prefix="/api/shipping", tags=["Shipping"])
    app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
    app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
    app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
    app.include_router(verification_router, prefix="/api/verification", tags=["Verification"])
    app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
    app.include_router(user_status_router, prefix="/api/user", tags=["User Status"])
    
    print("✅ All API routes loaded successfully")
    
except ImportError as e:
    print(f"⚠️ Warning: Some routes could not be imported: {e}")
    print("✅ Application will continue with available routes")

if __name__ == "__main__":
    # Get port from environment for Kubernetes deployment
    port = int(os.getenv("PORT", 8001))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"🚀 Starting server on {host}:{port}")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=False,  # Disable reload in production
        log_level="info"
    )