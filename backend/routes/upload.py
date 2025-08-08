from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
import uuid
import shutil
from PIL import Image
from typing import Optional
from server import get_current_user
from database import get_database
from datetime import datetime
import base64
from io import BytesIO
import json
import hashlib

router = APIRouter()

# Directory to store uploaded profile pictures and chunks
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads", "profiles")
CHUNK_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "uploads", "chunks")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_SIZE = (400, 400)  # 400x400 pixels
CHUNK_SIZE = 1024 * 1024  # 1MB chunks

# Ensure upload directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHUNK_DIR, exist_ok=True)

def validate_image(file: UploadFile) -> bool:
    """Validate image file"""
    # Check file extension
    file_ext = os.path.splitext(file.filename.lower())[1]
    if file_ext not in ALLOWED_EXTENSIONS:
        return False
    
    # Check file size
    if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        if size > MAX_FILE_SIZE:
            return False
    
    return True

def resize_image(image_path: str, max_size: tuple = MAX_IMAGE_SIZE):
    """Resize image to max_size while maintaining aspect ratio"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Calculate size maintaining aspect ratio
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(image_path, 'JPEG', quality=85, optimize=True)
            
        return True
    except Exception as e:
        print(f"Error resizing image: {e}")
        return False

@router.post("/upload/profile-picture", response_model=dict)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user)
):
    """Upload and set user profile picture"""
    
    # Validate file
    if not validate_image(file):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}. Max size: {MAX_FILE_SIZE//1024//1024}MB"
        )
    
    try:
        print(f"DEBUG: Starting upload for user {current_user_id}")
        print(f"DEBUG: Upload dir: {UPLOAD_DIR}")
        print(f"DEBUG: Upload dir exists: {os.path.exists(UPLOAD_DIR)}")
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename.lower())[1]
        filename = f"{current_user_id}_{uuid.uuid4().hex[:8]}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        print(f"DEBUG: File path: {file_path}")
        
        # Reset file pointer to beginning before saving
        file.file.seek(0)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Resize image
        if not resize_image(file_path):
            # Remove file if resize failed
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process image"
            )
        
        # Update user profile in database
        database = get_database()
        
        # Get or create profile
        profile = await database.user_profiles.find_one({"user_id": current_user_id})
        if not profile:
            # Generate system user ID
            system_user_id = f"LIB2USA-{str(uuid.uuid4())[:8].upper()}"
            
            # Create default profile
            from models.profile import UserProfile
            new_profile = UserProfile(
                user_id=current_user_id,
                system_user_id=system_user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            await database.user_profiles.insert_one(new_profile.dict())
        
        # Remove old profile picture file if exists
        old_profile = await database.user_profiles.find_one({"user_id": current_user_id})
        if old_profile and old_profile.get("profile_picture_url"):
            old_filename = old_profile["profile_picture_url"].split("/")[-1]
            old_file_path = os.path.join(UPLOAD_DIR, old_filename)
            if os.path.exists(old_file_path):
                os.remove(old_file_path)
        
        # Generate public URL for the image
        profile_picture_url = f"/api/uploads/profiles/{filename}"
        
        # Update profile with new picture URL
        await database.user_profiles.update_one(
            {"user_id": current_user_id},
            {
                "$set": {
                    "profile_picture_url": profile_picture_url,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Profile picture uploaded successfully",
            "profile_picture_url": profile_picture_url,
            "filename": filename
        }
        
    except Exception as e:
        print(f"DEBUG: Exception occurred: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        
        # Clean up file if database update failed
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}"
        )

@router.get("/uploads/profiles/{filename}")
async def get_profile_picture(filename: str):
    """Serve profile picture files"""
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile picture not found"
        )
    
    return FileResponse(
        file_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"}  # Cache for 1 hour
    )

@router.delete("/upload/profile-picture", response_model=dict)
async def delete_profile_picture(
    current_user_id: str = Depends(get_current_user)
):
    """Delete user's profile picture"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Remove file if exists
    if profile.get("profile_picture_url"):
        filename = profile["profile_picture_url"].split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    # Remove from database
    await database.user_profiles.update_one(
        {"user_id": current_user_id},
        {
            "$set": {
                "profile_picture_url": None,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "message": "Profile picture deleted successfully"
    }

@router.get("/profile/picture-info", response_model=dict)
async def get_profile_picture_info(
    current_user_id: str = Depends(get_current_user)
):
    """Get user's profile picture information"""
    
    database = get_database()
    
    # Get profile
    profile = await database.user_profiles.find_one({"user_id": current_user_id})
    
    if not profile or not profile.get("profile_picture_url"):
        return {
            "success": True,
            "has_picture": False,
            "profile_picture_url": None
        }
    
    return {
        "success": True,
        "has_picture": True,
        "profile_picture_url": profile["profile_picture_url"]
    }