from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
from passlib.hash import bcrypt
from models.admin import (
    AdminUser, AdminUserCreate, AdminLogin, UserReport, UserReportCreate,
    ProductReport, ProductReportCreate, ProductModerationAction, UserModerationAction,
    PlatformStats, AdminActivity
)
from models.user import UserResponse
from models.product import ProductResponse
from database import get_database
from server import create_access_token, get_current_user

router = APIRouter()

# Admin permissions
ADMIN_PERMISSIONS = {
    "super_admin": [
        "manage_admins", "manage_users", "manage_products", "view_analytics", 
        "moderate_content", "resolve_disputes", "system_settings"
    ],
    "admin": [
        "manage_users", "manage_products", "view_analytics", 
        "moderate_content", "resolve_disputes"
    ],
    "moderator": [
        "manage_products", "moderate_content", "resolve_disputes"
    ]
}

async def get_current_admin(current_user_id: str = Depends(get_current_user)):
    """Get current admin user and verify admin permissions"""
    database = get_database()
    
    # Check if user is an admin
    admin = await database.admins.find_one({"id": current_user_id, "isActive": True})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return admin

async def check_admin_permission(permission: str, admin: dict):
    """Check if admin has specific permission"""
    if permission not in admin.get("permissions", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission '{permission}' required"
        )

async def log_admin_activity(database, admin_id: str, admin_name: str, action: str, 
                           target_type: str, target_id: str = None, details: str = ""):
    """Log admin activity"""
    activity = {
        "id": str(uuid.uuid4()),
        "admin_id": admin_id,
        "admin_name": admin_name,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "details": details,
        "timestamp": datetime.utcnow()
    }
    await database.admin_activities.insert_one(activity)

# Admin Authentication
@router.post("/login", response_model=dict)
async def admin_login(login_data: AdminLogin):
    """Admin login"""
    database = get_database()
    
    # Find admin by email
    admin = await database.admins.find_one({"email": login_data.email, "isActive": True})
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not bcrypt.verify(login_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": admin["id"]})
    
    # Log activity
    await log_admin_activity(
        database, admin["id"], 
        f"{admin['firstName']} {admin['lastName']}", 
        "login", "system", details="Admin logged in"
    )
    
    return {
        "success": True,
        "message": "Admin login successful",
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "firstName": admin["firstName"],
            "lastName": admin["lastName"],
            "role": admin["role"],
            "permissions": admin["permissions"]
        },
        "token": access_token
    }

@router.get("/me", response_model=dict)
async def get_current_admin_info(admin = Depends(get_current_admin)):
    """Get current admin information"""
    return {
        "success": True,
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "firstName": admin["firstName"],
            "lastName": admin["lastName"],
            "role": admin["role"],
            "permissions": admin["permissions"]
        }
    }

# Dashboard Analytics
@router.get("/dashboard/stats", response_model=dict)
async def get_dashboard_stats(admin = Depends(get_current_admin)):
    """Get platform statistics for admin dashboard"""
    await check_admin_permission("view_analytics", admin)
    
    database = get_database()
    
    # Calculate date ranges
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_last_month = (start_of_month - timedelta(days=1)).replace(day=1)
    
    # Get user statistics
    total_users = await database.users.count_documents({})
    total_buyers = await database.users.count_documents({"userType": "buyer"})
    total_sellers = await database.users.count_documents({"userType": "seller"})
    verified_sellers = await database.users.count_documents({"userType": "seller", "isVerified": True})
    
    # Get product statistics
    total_products = await database.products.count_documents({})
    active_products = await database.products.count_documents({"is_active": True})
    pending_products = await database.products.count_documents({"is_active": False})
    
    # Get transaction statistics
    total_transactions = await database.payment_transactions.count_documents({})
    
    # Get report statistics
    pending_reports = await database.user_reports.count_documents({"status": "pending"}) + \
                     await database.product_reports.count_documents({"status": "pending"})
    resolved_reports = await database.user_reports.count_documents({"status": "resolved"}) + \
                      await database.product_reports.count_documents({"status": "resolved"})
    
    # Calculate revenue (mock data for now)
    revenue_this_month = 0.0
    revenue_last_month = 0.0
    
    # Get recent transactions for revenue calculation
    this_month_transactions = database.payment_transactions.find({
        "created_at": {"$gte": start_of_month},
        "payment_status": "paid"
    })
    
    async for transaction in this_month_transactions:
        revenue_this_month += transaction.get("amount", 0)
    
    last_month_transactions = database.payment_transactions.find({
        "created_at": {"$gte": start_of_last_month, "$lt": start_of_month},
        "payment_status": "paid"
    })
    
    async for transaction in last_month_transactions:
        revenue_last_month += transaction.get("amount", 0)
    
    stats = PlatformStats(
        total_users=total_users,
        total_buyers=total_buyers,
        total_sellers=total_sellers,
        verified_sellers=verified_sellers,
        total_products=total_products,
        active_products=active_products,
        pending_products=pending_products,
        total_transactions=total_transactions,
        pending_reports=pending_reports,
        resolved_reports=resolved_reports,
        revenue_this_month=revenue_this_month,
        revenue_last_month=revenue_last_month
    )
    
    return {
        "success": True,
        "stats": stats.dict()
    }

# User Management
@router.get("/users", response_model=dict)
async def get_all_users(
    admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    user_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get all users with filtering and pagination"""
    await check_admin_permission("manage_users", admin)
    
    database = get_database()
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"firstName": {"$regex": search, "$options": "i"}},
            {"lastName": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    
    if user_type:
        query["userType"] = user_type
    
    if status == "verified":
        query["isVerified"] = True
    elif status == "unverified":
        query["isVerified"] = False
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get users
    users_cursor = database.users.find(
        query, {"password_hash": 0}
    ).sort([("createdAt", -1)]).skip(skip).limit(limit)
    
    users = []
    async for user in users_cursor:
        user_data = UserResponse(
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
        users.append(user_data.dict())
    
    # Get total count
    total_count = await database.users.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "users": users,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }

@router.post("/users/{user_id}/moderate", response_model=dict)
async def moderate_user(
    user_id: str,
    action_data: UserModerationAction,
    admin = Depends(get_current_admin)
):
    """Moderate user (verify, suspend, ban, etc.)"""
    await check_admin_permission("manage_users", admin)
    
    database = get_database()
    
    # Find user
    user = await database.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Apply moderation action
    update_data = {"updatedAt": datetime.utcnow()}
    
    if action_data.action == "verify":
        update_data["isVerified"] = True
    elif action_data.action == "suspend":
        update_data["isActive"] = False
        if action_data.duration_days:
            update_data["suspendedUntil"] = datetime.utcnow() + timedelta(days=action_data.duration_days)
    elif action_data.action == "ban":
        update_data["isActive"] = False
        update_data["isBanned"] = True
    elif action_data.action == "reactivate":
        update_data["isActive"] = True
        update_data["isBanned"] = False
        update_data.pop("suspendedUntil", None)
    
    # Update user
    await database.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    # Log activity
    await log_admin_activity(
        database, admin["id"], 
        f"{admin['firstName']} {admin['lastName']}", 
        f"user_{action_data.action}", "user", user_id,
        f"User {action_data.action}: {action_data.reason or 'No reason provided'}"
    )
    
    return {
        "success": True,
        "message": f"User {action_data.action} successfully"
    }

# Product Management
@router.get("/products", response_model=dict)
async def get_all_products(
    admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get all products with filtering and pagination"""
    await check_admin_permission("manage_products", admin)
    
    database = get_database()
    
    # Build query
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"seller_name": {"$regex": search, "$options": "i"}}
        ]
    
    if status == "active":
        query["is_active"] = True
    elif status == "inactive":
        query["is_active"] = False
    
    if category:
        query["category"] = category
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get products
    products_cursor = database.products.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    
    products = []
    async for product in products_cursor:
        product_data = ProductResponse(
            id=product["id"],
            name=product["name"],
            description=product["description"],
            price=product["price"],
            category=product["category"],
            images=product["images"],
            video=product.get("video"),
            stock=product["stock"],
            tags=product["tags"],
            weight=product.get("weight"),
            dimensions=product.get("dimensions"),
            seller_id=product["seller_id"],
            seller_name=product["seller_name"],
            views=product["views"],
            is_active=product["is_active"],
            created_at=product["created_at"],
            updated_at=product["updated_at"]
        )
        products.append(product_data.dict())
    
    # Get total count
    total_count = await database.products.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "products": products,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }

@router.post("/products/{product_id}/moderate", response_model=dict)
async def moderate_product(
    product_id: str,
    action_data: ProductModerationAction,
    admin = Depends(get_current_admin)
):
    """Moderate product (approve, reject, suspend, delete)"""
    await check_admin_permission("manage_products", admin)
    
    database = get_database()
    
    # Find product
    product = await database.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Apply moderation action
    if action_data.action == "approve":
        await database.products.update_one(
            {"id": product_id},
            {"$set": {"is_active": True, "updated_at": datetime.utcnow()}}
        )
    elif action_data.action == "reject" or action_data.action == "suspend":
        await database.products.update_one(
            {"id": product_id},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
    elif action_data.action == "delete":
        await database.products.delete_one({"id": product_id})
    
    # Log activity
    await log_admin_activity(
        database, admin["id"], 
        f"{admin['firstName']} {admin['lastName']}", 
        f"product_{action_data.action}", "product", product_id,
        f"Product {action_data.action}: {action_data.reason or 'No reason provided'}"
    )
    
    return {
        "success": True,
        "message": f"Product {action_data.action} successfully"
    }

# Reports Management
@router.get("/reports/users", response_model=dict)
async def get_user_reports(
    admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None)
):
    """Get user reports"""
    await check_admin_permission("resolve_disputes", admin)
    
    database = get_database()
    
    # Build query
    query = {}
    if status:
        query["status"] = status
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get reports with user details
    reports = []
    reports_cursor = database.user_reports.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    
    async for report in reports_cursor:
        # Get reported user and reporter details
        reported_user = await database.users.find_one({"id": report["reported_user_id"]}, {"password_hash": 0})
        reporter = await database.users.find_one({"id": report["reporter_id"]}, {"password_hash": 0})
        
        report_data = {
            "id": report["id"],
            "reported_user": {
                "id": reported_user["id"],
                "name": f"{reported_user['firstName']} {reported_user['lastName']}",
                "email": reported_user["email"],
                "userType": reported_user["userType"]
            } if reported_user else None,
            "reporter": {
                "id": reporter["id"],
                "name": f"{reporter['firstName']} {reporter['lastName']}",
                "email": reporter["email"]
            } if reporter else None,
            "reason": report["reason"],
            "description": report["description"],
            "status": report["status"],
            "created_at": report["created_at"],
            "resolved_at": report.get("resolved_at"),
            "resolution_notes": report.get("resolution_notes")
        }
        reports.append(report_data)
    
    # Get total count
    total_count = await database.user_reports.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "reports": reports,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }

@router.post("/reports/users/{report_id}/resolve", response_model=dict)
async def resolve_user_report(
    report_id: str,
    resolution_data: dict,
    admin = Depends(get_current_admin)
):
    """Resolve a user report"""
    await check_admin_permission("resolve_disputes", admin)
    
    database = get_database()
    
    # Update report
    await database.user_reports.update_one(
        {"id": report_id},
        {"$set": {
            "status": resolution_data["status"],
            "resolution_notes": resolution_data.get("notes", ""),
            "resolved_at": datetime.utcnow(),
            "resolved_by": admin["id"]
        }}
    )
    
    # Log activity
    await log_admin_activity(
        database, admin["id"], 
        f"{admin['firstName']} {admin['lastName']}", 
        "resolve_user_report", "report", report_id,
        f"User report resolved: {resolution_data['status']}"
    )
    
    return {
        "success": True,
        "message": "Report resolved successfully"
    }

# Admin Activity Logs
@router.get("/activities", response_model=dict)
async def get_admin_activities(
    admin = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    admin_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None)
):
    """Get admin activity logs"""
    await check_admin_permission("view_analytics", admin)
    
    database = get_database()
    
    # Build query
    query = {}
    if admin_id:
        query["admin_id"] = admin_id
    if action:
        query["action"] = action
    
    # Calculate skip
    skip = (page - 1) * limit
    
    # Get activities
    activities_cursor = database.admin_activities.find(query).sort([("timestamp", -1)]).skip(skip).limit(limit)
    
    activities = []
    async for activity in activities_cursor:
        activity_data = AdminActivity(
            id=activity["id"],
            admin_id=activity["admin_id"],
            admin_name=activity["admin_name"],
            action=activity["action"],
            target_type=activity["target_type"],
            target_id=activity.get("target_id"),
            details=activity["details"],
            timestamp=activity["timestamp"]
        )
        activities.append(activity_data.dict())
    
    # Get total count
    total_count = await database.admin_activities.count_documents(query)
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "success": True,
        "activities": activities,
        "pagination": {
            "currentPage": page,
            "totalPages": total_pages,
            "totalCount": total_count,
            "hasNextPage": page < total_pages,
            "hasPrevPage": page > 1
        }
    }