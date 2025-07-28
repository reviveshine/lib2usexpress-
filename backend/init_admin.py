#!/usr/bin/env python3
"""
Initialize Admin System for Liberia2USA Express
Creates default super admin and sets up admin collections
"""

import asyncio
import os
import sys
from datetime import datetime
import uuid
from passlib.hash import bcrypt

# Add the backend directory to Python path
sys.path.append('/app/backend')

from database import connect_to_mongo, get_database

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

async def create_default_admin():
    """Create default super admin"""
    
    # Connect to database
    await connect_to_mongo()
    database = get_database()
    
    # Check if super admin already exists
    existing_admin = await database.admins.find_one({"role": "super_admin"})
    if existing_admin:
        print("✅ Super admin already exists")
        return
    
    # Create default super admin
    password_hash = bcrypt.hash("Admin@2025!")
    
    admin_doc = {
        "id": str(uuid.uuid4()),
        "email": "admin@liberia2usa.com",
        "firstName": "System",
        "lastName": "Administrator",
        "password_hash": password_hash,
        "role": "super_admin",
        "permissions": ADMIN_PERMISSIONS["super_admin"],
        "isActive": True,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    await database.admins.insert_one(admin_doc)
    
    # Create initial activity log
    activity = {
        "id": str(uuid.uuid4()),
        "admin_id": admin_doc["id"],
        "admin_name": "System Administrator",
        "action": "system_init",
        "target_type": "system",
        "target_id": None,
        "details": "Admin system initialized with default super admin",
        "timestamp": datetime.utcnow()
    }
    await database.admin_activities.insert_one(activity)
    
    print("✅ Default super admin created:")
    print(f"   Email: admin@liberia2usa.com")
    print(f"   Password: Admin@2025!")
    print(f"   Role: super_admin")
    print("   ⚠️  Please change the default password after first login!")

async def create_indexes():
    """Create database indexes for admin collections"""
    database = get_database()
    
    # Admin indexes
    await database.admins.create_index("email", unique=True)
    await database.admins.create_index("id", unique=True)
    await database.admins.create_index("role")
    
    # Activity logs indexes
    await database.admin_activities.create_index("admin_id")
    await database.admin_activities.create_index("timestamp")
    await database.admin_activities.create_index("target_type")
    
    # Reports indexes
    await database.user_reports.create_index("status")
    await database.user_reports.create_index("reported_user_id")
    await database.user_reports.create_index("created_at")
    
    await database.product_reports.create_index("status")
    await database.product_reports.create_index("product_id")
    await database.product_reports.create_index("created_at")
    
    print("✅ Database indexes created for admin collections")

async def main():
    """Main initialization function"""
    print("🚀 Initializing Admin System for Liberia2USA Express...")
    
    try:
        await create_default_admin()
        await create_indexes()
        
        print("\n🎉 Admin system initialization completed successfully!")
        print("\n📋 Admin Login Details:")
        print("   URL: /admin/login")
        print("   Email: admin@liberia2usa.com")
        print("   Password: Admin@2025!")
        print("\n⚠️  Important: Change the default password immediately after first login!")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())