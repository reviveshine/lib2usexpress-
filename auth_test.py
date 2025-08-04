#!/usr/bin/env python3
"""
Focused Authentication Testing for Liberia2USA Express
Tests the authentication improvements mentioned in the review request
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta
from jose import jwt

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

class AuthTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_health_check(self):
        """Test basic health check"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK":
                    self.log_test("Health Check", True, "API is running")
                    return True
                else:
                    self.log_test("Health Check", False, "API not healthy", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, "Connection failed", str(e))
            return False
    
    def test_register_and_login_buyer(self):
        """Test buyer registration and login with enhanced authentication"""
        try:
            # Register buyer
            buyer_data = {
                "firstName": "TestBuyer",
                "lastName": "AuthTest",
                "email": f"testbuyer.auth.{datetime.now().timestamp()}@email.com",
                "password": "SecurePass123!",
                "userType": "buyer",
                "location": "New York, USA",
                "phone": "+1-555-0123"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=buyer_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.buyer_token = data["token"]
                    
                    # Test login with same credentials
                    login_data = {
                        "email": buyer_data["email"],
                        "password": buyer_data["password"]
                    }
                    
                    login_response = requests.post(
                        f"{self.base_url}/api/auth/login",
                        json=login_data,
                        timeout=10
                    )
                    
                    if login_response.status_code == 200:
                        login_data_resp = login_response.json()
                        if login_data_resp.get("success") and login_data_resp.get("token"):
                            self.buyer_token = login_data_resp["token"]
                            self.log_test("Buyer Registration & Login", True, "Buyer registered and logged in successfully")
                            return True
                        else:
                            self.log_test("Buyer Registration & Login", False, "Login failed", login_data_resp)
                            return False
                    else:
                        self.log_test("Buyer Registration & Login", False, f"Login HTTP {login_response.status_code}", login_response.text)
                        return False
                else:
                    self.log_test("Buyer Registration & Login", False, "Registration failed", data)
                    return False
            else:
                self.log_test("Buyer Registration & Login", False, f"Registration HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Buyer Registration & Login", False, "Request failed", str(e))
            return False
    
    def test_register_and_login_seller(self):
        """Test seller registration and login with enhanced authentication"""
        try:
            # Register seller
            seller_data = {
                "firstName": "TestSeller",
                "lastName": "AuthTest",
                "email": f"testseller.auth.{datetime.now().timestamp()}@email.com",
                "password": "SecurePass456!",
                "userType": "seller",
                "location": "Monrovia, Liberia",
                "phone": "+231-555-0456"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=seller_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.seller_token = data["token"]
                    
                    # Test login with same credentials
                    login_data = {
                        "email": seller_data["email"],
                        "password": seller_data["password"]
                    }
                    
                    login_response = requests.post(
                        f"{self.base_url}/api/auth/login",
                        json=login_data,
                        timeout=10
                    )
                    
                    if login_response.status_code == 200:
                        login_data_resp = login_response.json()
                        if login_data_resp.get("success") and login_data_resp.get("token"):
                            self.seller_token = login_data_resp["token"]
                            self.log_test("Seller Registration & Login", True, "Seller registered and logged in successfully")
                            return True
                        else:
                            self.log_test("Seller Registration & Login", False, "Login failed", login_data_resp)
                            return False
                    else:
                        self.log_test("Seller Registration & Login", False, f"Login HTTP {login_response.status_code}", login_response.text)
                        return False
                else:
                    self.log_test("Seller Registration & Login", False, "Registration failed", data)
                    return False
            else:
                self.log_test("Seller Registration & Login", False, f"Registration HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Registration & Login", False, "Request failed", str(e))
            return False
    
    def test_jwt_token_expiration_extended(self):
        """Test that JWT tokens have 7-day expiration (168 hours)"""
        try:
            if not self.buyer_token:
                self.log_test("JWT Token Expiration", False, "No buyer token available", "Registration may have failed")
                return False
            
            # Decode token without verification to check expiration
            JWT_SECRET = "your_super_secure_jwt_secret_key_here_2025"  # From server.py
            decoded = jwt.decode(self.buyer_token, JWT_SECRET, algorithms=["HS256"])
            
            # Check expiration time
            exp_timestamp = decoded.get("exp")
            if exp_timestamp:
                exp_datetime = datetime.utcfromtimestamp(exp_timestamp)
                now = datetime.utcnow()
                time_diff = exp_datetime - now
                
                # Should be approximately 7 days (168 hours)
                hours_diff = time_diff.total_seconds() / 3600
                
                if 167 <= hours_diff <= 169:  # Allow 1 hour tolerance
                    self.log_test("JWT Token Expiration", True, f"Token expires in {hours_diff:.1f} hours (7 days)")
                    return True
                else:
                    self.log_test("JWT Token Expiration", False, f"Token expires in {hours_diff:.1f} hours, expected ~168 hours", f"Expiration: {exp_datetime}")
                    return False
            else:
                self.log_test("JWT Token Expiration", False, "No expiration claim in token", decoded)
                return False
        except Exception as e:
            self.log_test("JWT Token Expiration", False, "Token decode failed", str(e))
            return False
    
    def test_enhanced_jwt_error_messages(self):
        """Test enhanced JWT authentication with detailed error messages"""
        try:
            # Test with expired token (simulate by using invalid token)
            headers = {"Authorization": "Bearer invalid_token_format"}
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 401:
                data = response.json()
                detail = data.get("detail", "")
                if "Invalid token format" in detail or "token" in detail.lower():
                    self.log_test("Enhanced JWT Error Messages", True, "Detailed error message for invalid token")
                    return True
                else:
                    self.log_test("Enhanced JWT Error Messages", False, f"Generic error message: {detail}", data)
                    return False
            else:
                self.log_test("Enhanced JWT Error Messages", False, f"Expected 401, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Enhanced JWT Error Messages", False, "Request failed", str(e))
            return False
    
    def test_database_user_verification(self):
        """Test that JWT authentication verifies user exists in database"""
        try:
            if not self.buyer_token:
                self.log_test("Database User Verification", False, "No buyer token available", "Registration may have failed")
                return False
            
            # Test with valid token
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    user = data["user"]
                    if user.get("id") and user.get("email"):
                        self.log_test("Database User Verification", True, "Token verified against database user")
                        return True
                    else:
                        self.log_test("Database User Verification", False, "Incomplete user data", user)
                        return False
                else:
                    self.log_test("Database User Verification", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Database User Verification", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Database User Verification", False, "Request failed", str(e))
            return False
    
    def test_optional_authentication_function(self):
        """Test optional authentication for endpoints that work with both logged-in and guest users"""
        try:
            # Test public endpoint without authentication (should work)
            response = requests.get(
                f"{self.base_url}/api/products?page=1&limit=5",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    # Test same endpoint with authentication (should also work)
                    if self.buyer_token:
                        headers = {"Authorization": f"Bearer {self.buyer_token}"}
                        auth_response = requests.get(
                            f"{self.base_url}/api/products?page=1&limit=5",
                            headers=headers,
                            timeout=10
                        )
                        
                        if auth_response.status_code == 200:
                            auth_data = auth_response.json()
                            if auth_data.get("success") and "data" in auth_data:
                                self.log_test("Optional Authentication", True, "Endpoint works with both guest and authenticated users")
                                return True
                            else:
                                self.log_test("Optional Authentication", False, "Authenticated request failed", auth_data)
                                return False
                        else:
                            self.log_test("Optional Authentication", False, f"Authenticated request HTTP {auth_response.status_code}", auth_response.text)
                            return False
                    else:
                        self.log_test("Optional Authentication", True, "Guest access works (no token to test authenticated access)")
                        return True
                else:
                    self.log_test("Optional Authentication", False, "Guest request failed", data)
                    return False
            else:
                self.log_test("Optional Authentication", False, f"Guest request HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Optional Authentication", False, "Request failed", str(e))
            return False
    
    def test_improved_error_handling(self):
        """Test improved error handling throughout authentication system"""
        try:
            # Test various error scenarios
            
            # 1. Invalid login credentials
            login_data = {
                "email": "nonexistent@email.com",
                "password": "wrongpassword"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                data = response.json()
                if data.get("detail") and "Invalid email or password" in data["detail"]:
                    # 2. Test malformed request
                    malformed_response = requests.post(
                        f"{self.base_url}/api/auth/login",
                        json={"email": "test@email.com"},  # Missing password
                        timeout=10
                    )
                    
                    if malformed_response.status_code == 422:  # Validation error
                        malformed_data = malformed_response.json()
                        if "detail" in malformed_data:
                            self.log_test("Improved Error Handling", True, "Proper error handling for invalid credentials and malformed requests")
                            return True
                        else:
                            self.log_test("Improved Error Handling", False, "Malformed request error not detailed", malformed_data)
                            return False
                    else:
                        self.log_test("Improved Error Handling", False, f"Expected 422 for malformed request, got HTTP {malformed_response.status_code}", malformed_response.text)
                        return False
                else:
                    self.log_test("Improved Error Handling", False, "Generic error message for invalid credentials", data)
                    return False
            else:
                self.log_test("Improved Error Handling", False, f"Expected 401 for invalid credentials, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Improved Error Handling", False, "Request failed", str(e))
            return False
    
    def test_seller_specific_functionality(self):
        """Test seller-specific functionality with authentication"""
        try:
            if not self.seller_token:
                self.log_test("Seller Specific Functionality", False, "No seller token available", "Seller registration may have failed")
                return False
            
            # Test seller can access seller-specific endpoint
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(
                f"{self.base_url}/api/products/seller/my-products?page=1&limit=10",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data and "pagination" in data:
                    # Test buyer cannot access seller-specific endpoint
                    if self.buyer_token:
                        buyer_headers = {"Authorization": f"Bearer {self.buyer_token}"}
                        buyer_response = requests.get(
                            f"{self.base_url}/api/products/seller/my-products?page=1&limit=10",
                            headers=buyer_headers,
                            timeout=10
                        )
                        
                        if buyer_response.status_code == 403:  # Should be forbidden
                            self.log_test("Seller Specific Functionality", True, "Seller endpoints properly protected - sellers can access, buyers cannot")
                            return True
                        else:
                            self.log_test("Seller Specific Functionality", False, f"Buyer should be blocked, got HTTP {buyer_response.status_code}", buyer_response.text)
                            return False
                    else:
                        self.log_test("Seller Specific Functionality", True, "Seller can access seller-specific endpoints")
                        return True
                else:
                    self.log_test("Seller Specific Functionality", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Seller Specific Functionality", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Specific Functionality", False, "Request failed", str(e))
            return False
    
    def test_authentication_success_rate(self):
        """Test overall authentication success rate"""
        try:
            success_count = 0
            total_tests = 10
            
            # Run multiple authentication tests
            for i in range(total_tests):
                headers = {"Authorization": f"Bearer {self.buyer_token}"}
                response = requests.get(
                    f"{self.base_url}/api/auth/me",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        success_count += 1
            
            success_rate = (success_count / total_tests) * 100
            
            if success_rate >= 90:
                self.log_test("Authentication Success Rate", True, f"Success rate: {success_rate}% (≥90% target achieved)")
                return True
            else:
                self.log_test("Authentication Success Rate", False, f"Success rate: {success_rate}% (below 90% target)", f"Successful: {success_count}/{total_tests}")
                return False
        except Exception as e:
            self.log_test("Authentication Success Rate", False, "Test failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔐 Starting Enhanced Authentication Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        tests = [
            self.test_health_check,
            self.test_register_and_login_buyer,
            self.test_register_and_login_seller,
            self.test_jwt_token_expiration_extended,
            self.test_enhanced_jwt_error_messages,
            self.test_database_user_verification,
            self.test_optional_authentication_function,
            self.test_improved_error_handling,
            self.test_seller_specific_functionality,
            self.test_authentication_success_rate
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
                failed += 1
        
        print("=" * 80)
        print("📊 AUTHENTICATION TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        else:
            print("\n🎉 All authentication tests passed!")
        
        return passed, failed

if __name__ == "__main__":
    tester = AuthTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(1 if failed > 0 else 0)