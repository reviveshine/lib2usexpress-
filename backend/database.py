"""
Database connection module for Liberia2USA Express
"""
import os
from dotenv import load_dotenv
import motor.motor_asyncio
from urllib.parse import urlparse
import asyncio

# Load environment variables
load_dotenv()

# Database configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/liberia2usa_express")

# Global variables for database
database = None
client = None

async def connect_to_mongo():
    """Create database connection with retry logic"""
    global client, database
    
    max_attempts = 3
    retry_delay = 2
    
    for attempt in range(max_attempts):
        try:
            # Create client with timeout settings for production
            client = motor.motor_asyncio.AsyncIOMotorClient(
                MONGO_URL,
                serverSelectionTimeoutMS=10000,  # 10 seconds
                connectTimeoutMS=10000,  # 10 seconds
                socketTimeoutMS=10000,   # 10 seconds
                maxPoolSize=10,
                retryWrites=True
            )
            
            # Test the connection
            await client.admin.command('ping')
            
            # Extract database name from URL or use default
            database_name = extract_database_name(MONGO_URL)
            database = client.get_database(database_name)
            
            print(f"✓ Connected to MongoDB: {database_name} (attempt {attempt + 1})")
            return
            
        except Exception as e:
            print(f"✗ MongoDB connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_attempts - 1:
                print(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
            else:
                print("✗ All MongoDB connection attempts failed")
                # Don't raise exception - allow app to start without DB for health checks
                database = None
                client = None

def extract_database_name(mongo_url):
    """Extract database name from MongoDB URL"""
    try:
        parsed = urlparse(mongo_url)
        
        # For Atlas URLs like mongodb+srv://user:pass@cluster.mongodb.net/dbname
        if parsed.path and len(parsed.path) > 1:
            db_name = parsed.path[1:].split('?')[0]  # Remove leading slash and query params
            if db_name:
                return db_name
        
        # For connection strings with query parameters
        if '?' in mongo_url and 'authSource=' in mongo_url:
            parts = mongo_url.split('authSource=')
            if len(parts) > 1:
                auth_source = parts[1].split('&')[0]
                if auth_source != 'admin':
                    return auth_source
        
        # Default database name
        return "liberia2usa_express"
        
    except Exception as e:
        print(f"Warning: Could not parse database name from URL: {e}")
        return "liberia2usa_express"

async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("✓ MongoDB connection closed")

def get_database():
    """Get database instance"""
    return database

def is_database_connected():
    """Check if database is connected"""
    return database is not None and client is not None