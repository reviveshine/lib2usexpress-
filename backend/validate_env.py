#!/usr/bin/env python3
"""
Environment validation for Liberia2USA Express
Validates required environment variables and dependencies for deployment
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
sys.path.append('/app/backend')

def validate_environment():
    """Validate environment variables and configuration"""
    print("🔍 Validating environment configuration...")
    
    required_vars = {
        'MONGO_URL': 'MongoDB connection string',
        'JWT_SECRET': 'JWT secret key for authentication'
    }
    
    missing_vars = []
    
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            missing_vars.append(f"  - {var}: {description}")
            print(f"❌ Missing: {var}")
        else:
            # Don't print sensitive values, just confirm they exist
            if 'SECRET' in var or 'PASSWORD' in var or 'KEY' in var:
                print(f"✅ Found: {var} (value hidden for security)")
            else:
                print(f"✅ Found: {var} = {value}")
    
    if missing_vars:
        print("\n❌ Missing required environment variables:")
        for var in missing_vars:
            print(var)
        return False
    
    print("✅ All required environment variables are present")
    return True

def validate_database_url():
    """Validate MongoDB URL format"""
    print("\n🔍 Validating MongoDB URL format...")
    
    mongo_url = os.getenv('MONGO_URL')
    if not mongo_url:
        print("❌ MONGO_URL not found")
        return False
    
    # Check for common MongoDB URL patterns
    if mongo_url.startswith('mongodb://'):
        print("✅ Standard MongoDB URL format detected")
    elif mongo_url.startswith('mongodb+srv://'):
        print("✅ MongoDB Atlas URL format detected")
    else:
        print("⚠️  Warning: Unusual MongoDB URL format")
    
    # Check for database name in URL
    if '/' in mongo_url.split('://', 1)[1]:
        path_part = mongo_url.split('://', 1)[1]
        if '/' in path_part:
            db_name = path_part.split('/')[-1].split('?')[0]
            if db_name:
                print(f"✅ Database name detected in URL: {db_name}")
            else:
                print("⚠️  No database name in URL, will use default")
        else:
            print("⚠️  No database name in URL, will use default")
    
    return True

def validate_file_structure():
    """Validate required files exist"""
    print("\n🔍 Validating file structure...")
    
    backend_path = Path('/app/backend')
    required_files = [
        'server.py',
        'database.py',
        'requirements.txt',
        '.env'
    ]
    
    missing_files = []
    
    for file in required_files:
        file_path = backend_path / file
        if file_path.exists():
            print(f"✅ Found: {file}")
        else:
            missing_files.append(file)
            print(f"❌ Missing: {file}")
    
    if missing_files:
        print(f"\n❌ Missing required files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files are present")
    return True

def test_imports():
    """Test critical imports"""
    print("\n🔍 Testing critical imports...")
    
    try:
        import fastapi
        print(f"✅ FastAPI: {fastapi.__version__}")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import motor
        print(f"✅ Motor: {motor.__version__}")
    except ImportError as e:
        print(f"❌ Motor import failed: {e}")
        return False
    
    try:
        import pymongo
        print(f"✅ PyMongo: {pymongo.__version__}")
    except ImportError as e:
        print(f"❌ PyMongo import failed: {e}")
        return False
    
    try:
        from database import connect_to_mongo, get_database, is_database_connected
        print("✅ Database module imports successful")
    except ImportError as e:
        print(f"❌ Database module import failed: {e}")
        return False
    
    try:
        from server import app
        print("✅ Server module imports successful")
    except ImportError as e:
        print(f"❌ Server module import failed: {e}")
        return False
    
    print("✅ All critical imports successful")
    return True

def main():
    """Main validation function"""
    print("🚀 Liberia2USA Express - Environment Validation")
    print("=" * 50)
    
    validation_results = []
    
    # Run all validations
    validation_results.append(validate_environment())
    validation_results.append(validate_database_url())
    validation_results.append(validate_file_structure())
    validation_results.append(test_imports())
    
    print("\n" + "=" * 50)
    
    if all(validation_results):
        print("🎉 All validations passed! Application should deploy successfully.")
        return 0
    else:
        print("❌ Some validations failed. Please fix the issues above before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())