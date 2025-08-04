from fastapi import APIRouter, HTTPException, status, Depends
from passlib.hash import bcrypt
from datetime import datetime, timedelta
import uuid
import secrets
import os
from models.user import UserCreate, UserLogin, UserResponse
from models.password_reset import ForgotPasswordRequest, ResetPasswordRequest, PasswordResetToken, PasswordResetResponse
from database import get_database
from server import create_access_token, create_refresh_token, store_refresh_token, get_current_user

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

@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset - sends reset token via email (simulated)"""
    
    database = get_database()
    
    # Find user by email
    user = await database.users.find_one({"email": request.email})
    if not user:
        # Don't reveal if email exists or not for security
        return PasswordResetResponse(
            success=True,
            message="If your email is registered with us, you will receive a password reset link shortly.",
            reset_token_sent=False
        )
    
    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=15)  # Token expires in 15 minutes
    
    # Invalidate any existing reset tokens for this user
    await database.password_reset_tokens.delete_many({"user_id": user["id"]})
    
    # Create new reset token
    token_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "email": user["email"],
        "token": reset_token,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.utcnow()
    }
    
    await database.password_reset_tokens.insert_one(token_doc)
    
    # In a real application, you would send an email here
    # For now, we'll log the reset link for development/testing
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    print(f"🔐 Password Reset Link for {request.email}: {reset_link}")
    print(f"🔐 Reset Token: {reset_token}")
    
    return PasswordResetResponse(
        success=True,
        message="If your email is registered with us, you will receive a password reset link shortly.",
        reset_token_sent=True
    )

@router.get("/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    """Verify if a reset token is valid and not expired"""
    
    database = get_database()
    
    # Find the reset token
    reset_token_doc = await database.password_reset_tokens.find_one({
        "token": token,
        "used": False
    })
    
    if not reset_token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if datetime.utcnow() > reset_token_doc["expires_at"]:
        # Mark token as expired by deleting it
        await database.password_reset_tokens.delete_one({"id": reset_token_doc["id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new password reset."
        )
    
    # Get user information
    user = await database.users.find_one({"id": reset_token_doc["user_id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User associated with this token no longer exists"
        )
    
    return {
        "success": True,
        "message": "Reset token is valid",
        "email": user["email"],
        "expires_at": reset_token_doc["expires_at"].isoformat()
    }

@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(request: ResetPasswordRequest):
    """Reset password using valid reset token"""
    
    database = get_database()
    
    # Validate passwords match
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Validate password strength
    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )
    
    # Find and verify the reset token
    reset_token_doc = await database.password_reset_tokens.find_one({
        "token": request.token,
        "used": False
    })
    
    if not reset_token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token is expired
    if datetime.utcnow() > reset_token_doc["expires_at"]:
        await database.password_reset_tokens.delete_one({"id": reset_token_doc["id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new password reset."
        )
    
    # Find the user
    user = await database.users.find_one({"id": reset_token_doc["user_id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User associated with this token no longer exists"
        )
    
    # Hash the new password
    new_password_hash = bcrypt.hash(request.new_password)
    
    # Update user's password
    await database.users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "password_hash": new_password_hash,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    # Mark the reset token as used and delete it
    await database.password_reset_tokens.delete_one({"id": reset_token_doc["id"]})
    
    # Also delete any other unused tokens for this user
    await database.password_reset_tokens.delete_many({"user_id": user["id"]})
    
    print(f"🔐 Password successfully reset for user: {user['email']}")
    
    return PasswordResetResponse(
        success=True,
        message="Password has been successfully reset. You can now log in with your new password."
    )