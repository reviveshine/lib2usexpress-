#!/usr/bin/env python3
"""
Test registration API endpoint to debug network issues
"""

import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

def test_registration_api():
    """Test the registration API endpoint"""
    
    # Get backend URL from frontend config
    backend_url = "https://b63c3324-aeb1-4ef8-8d26-c78de417cad8.preview.emergentagent.com"
    
    # Test data
    test_data = {
        "firstName": "Network",
        "lastName": "Test",
        "email": "networktest@example.com",
        "password": "testpass123",
        "userType": "seller",
        "location": "Monrovia, Liberia"
    }
    
    print(f"🔍 Testing registration API at: {backend_url}/api/auth/register")
    
    try:
        # Test health endpoint first
        print("\n1. Testing health endpoint...")
        health_response = requests.get(f"{backend_url}/api/health", timeout=10)
        print(f"   Status: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"   Response: {health_response.json()}")
        else:
            print(f"   Error: {health_response.text}")
        
        # Test debug endpoint
        print("\n2. Testing debug endpoint...")
        debug_response = requests.get(f"{backend_url}/api/debug/network", timeout=10)
        print(f"   Status: {debug_response.status_code}")
        if debug_response.status_code == 200:
            print(f"   Response: {debug_response.json()}")
        else:
            print(f"   Error: {debug_response.text}")
        
        # Test registration endpoint
        print("\n3. Testing registration endpoint...")
        headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://b63c3324-aeb1-4ef8-8d26-c78de417cad8.preview.emergentagent.com'
        }
        
        reg_response = requests.post(
            f"{backend_url}/api/auth/register",
            json=test_data,
            headers=headers,
            timeout=10
        )
        
        print(f"   Status: {reg_response.status_code}")
        if reg_response.status_code == 200:
            print(f"   Response: {reg_response.json()}")
            print("✅ Registration API is working correctly!")
        else:
            print(f"   Error: {reg_response.text}")
            print("❌ Registration API failed")
        
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        print("   The backend server might not be accessible from this URL")
    except requests.exceptions.Timeout as e:
        print(f"❌ Timeout Error: {e}")
        print("   The request timed out")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def test_local_backend():
    """Test local backend"""
    print("\n" + "="*50)
    print("🔍 Testing local backend for comparison...")
    
    backend_url = "http://localhost:8001"
    
    test_data = {
        "firstName": "Local",
        "lastName": "Test",
        "email": "localtest@example.com",
        "password": "testpass123",
        "userType": "seller",
        "location": "Monrovia, Liberia"
    }
    
    try:
        response = requests.post(
            f"{backend_url}/api/auth/register",
            json=test_data,
            timeout=5
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Local backend is working correctly!")
        else:
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Local backend error: {e}")

if __name__ == "__main__":
    print("🚀 Testing Registration API Network Connectivity")
    print("="*60)
    
    test_registration_api()
    test_local_backend()
    
    print("\n" + "="*60)
    print("🔍 Summary:")
    print("   If preview URL fails but local works, it's a deployment/routing issue")
    print("   If both fail, it's a backend configuration issue")
    print("   Check the browser network tab for more details when testing the UI")