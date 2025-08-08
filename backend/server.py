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
REFRESH_TOKEN_EXPIRE_DAYS = 30  # Refresh tokens last 30 days

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
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create JWT refresh token with longer expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def store_refresh_token(user_id: str, refresh_token: str):
    """Store refresh token in database"""
    database = get_database()
    if database is not None:
        # Update user with new refresh token and expiration
        expire_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        await database.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "refresh_token": refresh_token,
                    "refresh_token_expires_at": expire_at
                }
            }
        )

async def validate_refresh_token(refresh_token: str):
    """Validate refresh token and return user_id if valid"""
    try:
        # Decode the refresh token
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Check if it's a refresh token
        if payload.get("type") != "refresh":
            return None
            
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # Check if refresh token exists in database and hasn't expired
        database = get_database()
        if database is None:
            return None
            
        user = await database.users.find_one({
            "id": user_id,
            "refresh_token": refresh_token,
            "refresh_token_expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            return None
            
        return user_id
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
    except Exception:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token with enhanced error handling"""
    try:
        token = credentials.credentials
        
        # Decode token with detailed error handling
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            
            # Check if it's an access token (not refresh token)
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type. Access token required.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
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

# Token refresh endpoint
@app.post("/api/auth/refresh")
async def refresh_access_token(request: dict):
    """Refresh access token using refresh token"""
    try:
        refresh_token = request.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )
        
        # Validate refresh token
        user_id = await validate_refresh_token(refresh_token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Get user info
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
                detail="User no longer exists"
            )
        
        # Create new access token
        new_access_token = create_access_token({"sub": user_id})
        
        # Optionally create new refresh token (rotation strategy)
        new_refresh_token = create_refresh_token({"sub": user_id})
        await store_refresh_token(user_id, new_refresh_token)
        
        return {
            "success": True,
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in refresh token endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token refresh"
        )

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
    from routes.upload import router as upload_router
    from routes.dashboard import router as dashboard_router

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
    app.include_router(upload_router, prefix="/api", tags=["File Upload"])
    app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard Analytics"])
    
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