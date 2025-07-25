"""
Database connection module for Liberia2USA Express
"""
import os
from dotenv import load_dotenv
import motor.motor_asyncio

# Load environment variables
load_dotenv()

# Database configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/liberia2usa_express")

# Global variables for database
database = None
client = None

async def connect_to_mongo():
    """Create database connection"""
    global client, database
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
    database = client.get_database()
    print(f"✓ Connected to MongoDB: {database.name}")

async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")

def get_database():
    """Get database instance"""
    return database