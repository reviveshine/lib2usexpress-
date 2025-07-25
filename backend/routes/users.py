from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from models.user import UserResponse
from server import database, get_current_user

router = APIRouter()

@router.get("/profile", response_model=dict)
async def get_user_profile(current_user_id: str = Depends(get_current_user)):
    """Get current user's profile"""
    
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

@router.put("/profile", response_model=dict)
async def update_user_profile(
    update_data: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Update current user's profile"""
    
    # Find user
    user = await database.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update allowed fields only
    allowed_fields = ["firstName", "lastName", "phone", "location"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if update_dict:
        update_dict["updatedAt"] = datetime.utcnow()
        await database.users.update_one(
            {"id": current_user_id},
            {"$set": update_dict}
        )
    
    # Get updated user
    updated_user = await database.users.find_one({"id": current_user_id})
    user_response = UserResponse(
        id=updated_user["id"],
        firstName=updated_user["firstName"],
        lastName=updated_user["lastName"],
        email=updated_user["email"],
        userType=updated_user["userType"],
        location=updated_user["location"],
        phone=updated_user.get("phone"),
        isVerified=updated_user["isVerified"],
        createdAt=updated_user["createdAt"]
    )
    
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": user_response.dict()
    }

@router.get("/sellers", response_model=dict)
async def get_sellers():
    """Get list of verified sellers"""
    
    sellers_cursor = database.users.find(
        {"userType": "seller", "isVerified": True},
        {"password_hash": 0}  # Exclude password hash
    )
    
    sellers = []
    async for seller in sellers_cursor:
        seller_response = UserResponse(
            id=seller["id"],
            firstName=seller["firstName"],
            lastName=seller["lastName"],
            email=seller["email"],
            userType=seller["userType"],
            location=seller["location"],
            phone=seller.get("phone"),
            isVerified=seller["isVerified"],
            createdAt=seller["createdAt"]
        )
        sellers.append(seller_response.dict())
    
    return {
        "success": True,
        "sellers": sellers,
        "count": len(sellers)
    }