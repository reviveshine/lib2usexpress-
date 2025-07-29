from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
JWT_EXPIRE_HOURS = 24

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI application
app = FastAPI(
    title="Liberia2USA Express API",
    description="International shipping platform API from Liberia to USA",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8001"],
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
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/api/health")
async def health_check():
    database = get_database()
    return {
        "status": "OK",
        "message": "Liberia2USA Express API is running",
        "timestamp": datetime.utcnow().isoformat(),
        "database_connected": database is not None
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

# Import routes (we'll create these next)
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.products import router as products_router
from routes.shipping import router as shipping_router
from routes.chat import router as chat_router
from routes.payments import router as payments_router
from routes.admin import router as admin_router
from routes.verification import router as verification_router

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(shipping_router, prefix="/api/shipping", tags=["Shipping"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])
app.include_router(payments_router, prefix="/api/payments", tags=["Payments"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(verification_router, prefix="/api/verification", tags=["Verification"])

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=True
    )