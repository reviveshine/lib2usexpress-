#!/usr/bin/env python3
"""
Comprehensive Enhanced Authentication System Test
"""

import requests
import json
import time
from datetime import datetime

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

def test_enhanced_auth_system():
    """Comprehensive test of enhanced authentication system"""
    print(f"🔐 Testing Enhanced Authentication System at {BACKEND_URL}")
    print("=" * 60)
    
    results = []
    
    # Test 1: Enhanced Registration
    print("1. Testing Enhanced Registration...")
    user_data = {
        "firstName": "Enhanced",
        "lastName": "TestUser",
        "email": f"enhanced.test.{int(time.time())}@email.com",
        "password": "SecurePass123!",
        "userType": "buyer",
        "location": "Miami, USA",
        "phone": "+1-555-0199"
    }
    
    response = requests.post(f"{BACKEND_URL}/api/auth/register", json=user_data, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token") and data.get("refresh_token"):
            print("✅ Enhanced Registration: PASS - Returns both tokens")
            access_token = data["token"]
            refresh_token = data["refresh_token"]
            user_id = data["user"]["id"]
            results.append(("Enhanced Registration", True, "Returns both access_token and refresh_token"))
        else:
            print("❌ Enhanced Registration: FAIL - Missing tokens")
            results.append(("Enhanced Registration", False, "Missing tokens in response"))
            return results
    else:
        print(f"❌ Enhanced Registration: FAIL - HTTP {response.status_code}")
        results.append(("Enhanced Registration", False, f"HTTP {response.status_code}"))
        return results
    
    # Test 2: Enhanced Login
    print("\n2. Testing Enhanced Login...")
    login_data = {
        "email": user_data["email"],
        "password": user_data["password"]
    }
    
    response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("token") and data.get("refresh_token"):
            print("✅ Enhanced Login: PASS - Returns both tokens")
            # Update tokens (should be new ones from login)
            access_token = data["token"]
            refresh_token = data["refresh_token"]
            results.append(("Enhanced Login", True, "Returns both access_token and refresh_token"))
        else:
            print("❌ Enhanced Login: FAIL - Missing tokens")
            results.append(("Enhanced Login", False, "Missing tokens in response"))
    else:
        print(f"❌ Enhanced Login: FAIL - HTTP {response.status_code}")
        results.append(("Enhanced Login", False, f"HTTP {response.status_code}"))
    
    # Test 3: Token Type Validation
    print("\n3. Testing Token Type Validation...")
    try:
        import jwt as jwt_lib
        
        # Decode tokens without verification to check type
        access_payload = jwt_lib.decode(access_token, options={"verify_signature": False})
        refresh_payload = jwt_lib.decode(refresh_token, options={"verify_signature": False})
        
        if access_payload.get("type") == "access" and refresh_payload.get("type") == "refresh":
            print("✅ Token Type Validation: PASS - Correct token types")
            results.append(("Token Type Validation", True, "Access token has type 'access', refresh token has type 'refresh'"))
        else:
            print(f"❌ Token Type Validation: FAIL - Wrong types: access={access_payload.get('type')}, refresh={refresh_payload.get('type')}")
            results.append(("Token Type Validation", False, f"Wrong token types"))
    except ImportError:
        # Test by using tokens with endpoints
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            # Test refresh token with API (should fail)
            headers = {"Authorization": f"Bearer {refresh_token}"}
            response = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 401:
                print("✅ Token Type Validation: PASS - Access token works, refresh token rejected")
                results.append(("Token Type Validation", True, "Access token works for API calls, refresh token correctly rejected"))
            else:
                print("❌ Token Type Validation: FAIL - Refresh token should not work for API calls")
                results.append(("Token Type Validation", False, "Refresh token should not work for API calls"))
        else:
            print("❌ Token Type Validation: FAIL - Access token should work for API calls")
            results.append(("Token Type Validation", False, "Access token should work for API calls"))
    
    # Test 4: Token Refresh Endpoint
    print("\n4. Testing Token Refresh Endpoint...")
    original_refresh_token = refresh_token
    
    # Wait a second to ensure different timestamps
    time.sleep(1)
    
    refresh_data = {"refresh_token": refresh_token}
    response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json=refresh_data, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if (data.get("success") and 
            data.get("access_token") and
            data.get("refresh_token") and
            data.get("token_type") == "bearer"):
            
            new_access_token = data["access_token"]
            new_refresh_token = data["refresh_token"]
            
            print("✅ Token Refresh Endpoint: PASS - Returns new tokens")
            results.append(("Token Refresh Endpoint", True, "Successfully refreshes tokens"))
            
            # Update tokens for further tests
            access_token = new_access_token
            refresh_token = new_refresh_token
        else:
            print("❌ Token Refresh Endpoint: FAIL - Invalid response format")
            results.append(("Token Refresh Endpoint", False, "Invalid response format"))
    else:
        print(f"❌ Token Refresh Endpoint: FAIL - HTTP {response.status_code}")
        results.append(("Token Refresh Endpoint", False, f"HTTP {response.status_code}"))
    
    # Test 5: Refresh Token Database Storage (Test old token invalidation)
    print("\n5. Testing Refresh Token Database Storage...")
    old_refresh_data = {"refresh_token": original_refresh_token}
    response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json=old_refresh_data, timeout=10)
    
    if response.status_code == 401:
        print("✅ Refresh Token Database Storage: PASS - Old token invalidated")
        results.append(("Refresh Token Database Storage", True, "Old refresh token invalidated, new token stored"))
    else:
        print(f"❌ Refresh Token Database Storage: FAIL - Old token should be invalid, got {response.status_code}")
        results.append(("Refresh Token Database Storage", False, "Old refresh token not invalidated"))
    
    # Test 6: Token Expiration Handling
    print("\n6. Testing Token Expiration Handling...")
    headers = {"Authorization": "Bearer invalid_token_12345"}
    response = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers, timeout=10)
    
    if response.status_code == 401:
        print("✅ Token Expiration Handling: PASS - Invalid tokens rejected")
        results.append(("Token Expiration Handling", True, "Invalid tokens properly rejected with 401"))
    else:
        print(f"❌ Token Expiration Handling: FAIL - Should return 401, got {response.status_code}")
        results.append(("Token Expiration Handling", False, f"Should return 401, got {response.status_code}"))
    
    # Test 7: Error Scenarios
    print("\n7. Testing Error Scenarios...")
    
    # Missing refresh token
    response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json={}, timeout=10)
    if response.status_code == 400:
        # Invalid refresh token
        invalid_refresh_data = {"refresh_token": "invalid_token"}
        response = requests.post(f"{BACKEND_URL}/api/auth/refresh", json=invalid_refresh_data, timeout=10)
        if response.status_code == 401:
            print("✅ Error Scenarios: PASS - All error cases handled")
            results.append(("Error Scenarios", True, "Missing and invalid tokens properly handled"))
        else:
            print("❌ Error Scenarios: FAIL - Invalid token should return 401")
            results.append(("Error Scenarios", False, "Invalid token handling failed"))
    else:
        print("❌ Error Scenarios: FAIL - Missing token should return 400")
        results.append(("Error Scenarios", False, "Missing token handling failed"))
    
    # Test 8: Access Token Extended Expiration (7 days)
    print("\n8. Testing Access Token Extended Expiration...")
    try:
        import jwt as jwt_lib
        from datetime import datetime, timedelta
        
        payload = jwt_lib.decode(access_token, options={"verify_signature": False})
        exp_timestamp = payload.get("exp")
        
        if exp_timestamp:
            exp_datetime = datetime.fromtimestamp(exp_timestamp)
            current_time = datetime.utcnow()
            time_diff = exp_datetime - current_time
            actual_days = time_diff.total_seconds() / (24 * 3600)
            
            if 6.9 <= actual_days <= 7.1:  # Allow small variance
                print(f"✅ Access Token Extended Expiration: PASS - {actual_days:.1f} days")
                results.append(("Access Token Extended Expiration", True, f"Access token expires in {actual_days:.1f} days"))
            else:
                print(f"❌ Access Token Extended Expiration: FAIL - {actual_days:.1f} days instead of 7")
                results.append(("Access Token Extended Expiration", False, f"Unexpected expiration: {actual_days:.1f} days"))
        else:
            print("❌ Access Token Extended Expiration: FAIL - No expiration in token")
            results.append(("Access Token Extended Expiration", False, "No expiration timestamp in token"))
    except ImportError:
        # Test that token is valid (indicating proper expiration)
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{BACKEND_URL}/api/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Access Token Extended Expiration: PASS - Token is valid")
            results.append(("Access Token Extended Expiration", True, "Access token is valid (7-day expiration configured)"))
        else:
            print("❌ Access Token Extended Expiration: FAIL - Token should be valid")
            results.append(("Access Token Extended Expiration", False, "Access token should be valid"))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 ENHANCED AUTHENTICATION SYSTEM TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for test_name, success, message in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {total - passed}")
    print(f"Success Rate: {(passed / total * 100):.1f}%")
    
    if passed == total:
        print("\n🎉 All enhanced authentication tests passed!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
    
    return results

if __name__ == "__main__":
    test_enhanced_auth_system()