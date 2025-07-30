from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timedelta
from typing import List, Dict
from models.user_status import UserStatusUpdate, UserStatus, UserOnlineResponse
from database import get_database
from server import get_current_user

router = APIRouter()

@router.post("/status", response_model=UserOnlineResponse)
async def update_user_status(
    status_update: UserStatusUpdate,
    current_user_id: str = Depends(get_current_user)
):
    """Update user's online status"""
    
    database = get_database()
    
    try:
        # Update user status in database
        now = datetime.utcnow()
        
        user_status = {
            "user_id": current_user_id,
            "status": status_update.status,
            "last_seen": now,
            "last_activity": now
        }
        
        # Upsert user status
        await database.user_status.update_one(
            {"user_id": current_user_id},
            {"$set": user_status},
            upsert=True
        )
        
        return UserOnlineResponse(
            success=True,
            message=f"Status updated to {status_update.status}",
            status=status_update.status,
            last_seen=now
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

@router.get("/status/{user_id}", response_model=dict)
async def get_user_status(user_id: str):
    """Get a specific user's online status"""
    
    database = get_database()
    
    try:
        # Get user status
        user_status = await database.user_status.find_one({"user_id": user_id})
        
        if not user_status:
            # If no status record, assume offline
            return {
                "success": True,
                "status": "offline",
                "last_seen": None,
                "is_online": False
            }
        
        # Check if user is considered online (active within last 5 minutes)
        now = datetime.utcnow()
        last_activity = user_status["last_activity"]
        is_online = (now - last_activity).total_seconds() < 300  # 5 minutes
        
        # Auto-update to offline if inactive
        if not is_online and user_status["status"] == "online":
            await database.user_status.update_one(
                {"user_id": user_id},
                {"$set": {"status": "offline"}}
            )
            user_status["status"] = "offline"
        
        return {
            "success": True,
            "status": user_status["status"],
            "last_seen": user_status["last_seen"],
            "is_online": is_online
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )

@router.get("/status/bulk/{user_ids}", response_model=dict)
async def get_multiple_user_status(user_ids: str):
    """Get multiple users' online status (comma-separated user IDs)"""
    
    database = get_database()
    
    try:
        user_id_list = user_ids.split(',')
        user_statuses = {}
        
        # Get all user statuses
        statuses = await database.user_status.find(
            {"user_id": {"$in": user_id_list}}
        ).to_list(length=None)
        
        now = datetime.utcnow()
        
        # Process each user status
        for user_id in user_id_list:
            # Find status for this user
            user_status = next((s for s in statuses if s["user_id"] == user_id), None)
            
            if not user_status:
                user_statuses[user_id] = {
                    "status": "offline",
                    "is_online": False,
                    "last_seen": None
                }
            else:
                # Check if user is considered online (active within last 5 minutes)
                last_activity = user_status["last_activity"]
                is_online = (now - last_activity).total_seconds() < 300  # 5 minutes
                
                user_statuses[user_id] = {
                    "status": user_status["status"] if is_online else "offline",
                    "is_online": is_online,
                    "last_seen": user_status["last_seen"]
                }
        
        return {
            "success": True,
            "statuses": user_statuses
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get bulk status: {str(e)}"
        )

@router.post("/heartbeat", response_model=dict)
async def user_heartbeat(current_user_id: str = Depends(get_current_user)):
    """Update user's last activity timestamp (heartbeat)"""
    
    database = get_database()
    
    try:
        now = datetime.utcnow()
        
        # Update last activity
        await database.user_status.update_one(
            {"user_id": current_user_id},
            {
                "$set": {
                    "last_activity": now,
                    "status": "online"
                }
            },
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Heartbeat updated",
            "timestamp": now
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update heartbeat: {str(e)}"
        )

@router.get("/online-users", response_model=dict)
async def get_online_users():
    """Get list of currently online users"""
    
    database = get_database()
    
    try:
        now = datetime.utcnow()
        five_minutes_ago = now - timedelta(minutes=5)
        
        # Get users who were active in last 5 minutes
        online_statuses = await database.user_status.find({
            "last_activity": {"$gte": five_minutes_ago},
            "status": {"$in": ["online", "away"]}
        }).to_list(length=None)
        
        # Get user details for online users
        online_user_ids = [s["user_id"] for s in online_statuses]
        
        if online_user_ids:
            online_users = await database.users.find(
                {"id": {"$in": online_user_ids}},
                {"id": 1, "firstName": 1, "lastName": 1, "userType": 1}
            ).to_list(length=None)
            
            # Combine user info with status
            result = []
            for user in online_users:
                user_status = next((s for s in online_statuses if s["user_id"] == user["id"]), None)
                result.append({
                    "user_id": user["id"],
                    "name": f"{user['firstName']} {user['lastName']}",
                    "userType": user["userType"],
                    "status": user_status["status"] if user_status else "online",
                    "last_activity": user_status["last_activity"] if user_status else now
                })
        else:
            result = []
        
        return {
            "success": True,
            "online_users": result,
            "count": len(result)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get online users: {str(e)}"
        )