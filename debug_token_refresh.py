#!/usr/bin/env python3
"""
Debug Token Refresh Issue
"""

import requests
import json

# Get backend URL from frontend .env
try:
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                BACKEND_URL = line.split('=', 1)[1].strip()
                break
        else:
            BACKEND_URL = "http://localhost:8001"
except:
    BACKEND_URL = "http://localhost:8001"

def debug_token_refresh():
    """Debug the token refresh functionality"""
    print(f"🔍 Debugging Token Refresh at {BACKEND_URL}")
    
    # First, register a new user to get fresh tokens
    user_data = {
        "firstName": "Debug",
        "lastName": "User",
        "email": "debug.user@email.com",
        "password": "SecurePass123!",
        "userType": "buyer",
        "location": "Chicago, USA",
        "phone": "+1-555-0199"
    }
    
    print("1. Registering new user...")
    response = requests.post(f"{BACKEND_URL}/api/auth/register", json=user_data, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Registration successful")
        print(f"   Access Token: {data['token'][:50]}...")
        print(f"   Refresh Token: {data['refresh_token'][:50]}...")
        
        original_access_token = data['token']
        original_refresh_token = data['refresh_token']
        
        # Now test token refresh
        print("\n2. Testing token refresh...")
        refresh_data = {"refresh_token": original_refresh_token}
        
        response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json=refresh_data, timeout=10)
        
        if response.status_code == 200:
            refresh_response = response.json()
            print(f"✅ Token refresh successful")
            print(f"   New Access Token: {refresh_response['access_token'][:50]}...")
            print(f"   New Refresh Token: {refresh_response['refresh_token'][:50]}...")
            
            # Check if tokens are different
            if refresh_response['access_token'] != original_access_token:
                print("✅ Access token rotated successfully")
            else:
                print("❌ Access token NOT rotated")
                
            if refresh_response['refresh_token'] != original_refresh_token:
                print("✅ Refresh token rotated successfully")
            else:
                print("❌ Refresh token NOT rotated")
                
            # Test using old refresh token (should fail)
            print("\n3. Testing old refresh token (should fail)...")
            old_refresh_data = {"refresh_token": original_refresh_token}
            response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json=old_refresh_data, timeout=10)
            
            if response.status_code == 401:
                print("✅ Old refresh token correctly invalidated")
            else:
                print(f"❌ Old refresh token should be invalid, got: {response.status_code}")
                print(f"   Response: {response.text}")
                
        else:
            print(f"❌ Token refresh failed: {response.status_code}")
            print(f"   Response: {response.text}")
    else:
        print(f"❌ Registration failed: {response.status_code}")
        print(f"   Response: {response.text}")

if __name__ == "__main__":
    debug_token_refresh()