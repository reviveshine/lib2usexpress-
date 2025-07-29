from fastapi import APIRouter, HTTPException, status, Depends
from passlib.hash import bcrypt
from datetime import datetime, timedelta
import uuid
import secrets
from models.user import UserCreate, UserLogin, UserResponse
from models.password_reset import ForgotPasswordRequest, ResetPasswordRequest, PasswordResetToken, PasswordResetResponse
from database import get_database
from server import create_access_token, get_current_user

router = APIRouter()

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user (buyer or seller)"""
    
    database = get_database()
    
    # Check if user already exists
    existing_user = await database.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = bcrypt.hash(user_data.password)
    
    # Create user document
    user_doc = {
        "id": str(uuid.uuid4()),
        "firstName": user_data.firstName,
        "lastName": user_data.lastName,
        "email": user_data.email,
        "password_hash": password_hash,
        "userType": user_data.userType,
        "location": user_data.location,
        "phone": user_data.phone,
        "isVerified": False,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    # Insert user into database
    await database.users.insert_one(user_doc)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_doc["id"]})
    
    # Return response (excluding password_hash)
    user_response = UserResponse(
        id=user_doc["id"],
        firstName=user_doc["firstName"],
        lastName=user_doc["lastName"],
        email=user_doc["email"],
        userType=user_doc["userType"],
        location=user_doc["location"],
        phone=user_doc["phone"],
        isVerified=user_doc["isVerified"],
        createdAt=user_doc["createdAt"]
    )
    
    return {
        "success": True,
        "message": "User registered successfully",
        "user": user_response.dict(),
        "token": access_token
    }

@router.post("/login", response_model=dict)
async def login_user(login_data: UserLogin):
    """Login user and return access token"""
    
    database = get_database()
    
    # Find user by email
    user = await database.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not bcrypt.verify(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Return response (excluding password_hash)
    user_response = UserResponse(
        id=user["id"],
        firstName=user["firstName"],
        lastName=user["lastName"],
        email=user["email"],
        userType=user["userType"],
        location=user["location"],
        phone=user.get("phone"),
        isVerified=user["isVerified"],
        createdAt=user["createdAt"]
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "user": user_response.dict(),
        "token": access_token
    }

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """Get current user information"""
    
    database = get_database()
    
    # Find user by ID
    user = await database.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_response = UserResponse(
        id=user["id"],
        firstName=user["firstName"],
        lastName=user["lastName"],
        email=user["email"],
        userType=user["userType"],
        location=user["location"],
        phone=user.get("phone"),
        isVerified=user["isVerified"],
        createdAt=user["createdAt"]
    )
    
    return {
        "success": True,
        "user": user_response.dict()
    }