#!/usr/bin/env python3
"""
Focused Registration Testing for Liberia2USA Express
Tests the user registration functionality specifically as requested
"""

import requests
import json
import sys
import os
from datetime import datetime
import uuid

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

class RegistrationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.buyer_token = None
        self.seller_token = None
        self.buyer_data = None
        self.seller_data = None
        
        # Generate unique email addresses for this test run
        test_id = str(uuid.uuid4())[:8]
        self.buyer_email = f"buyer_{test_id}@testliberia2usa.com"
        self.seller_email = f"seller_{test_id}@testliberia2usa.com"
        
        print(f"🧪 Registration Testing with unique emails:")
        print(f"   Buyer: {self.buyer_email}")
        print(f"   Seller: {self.seller_email}")
        print(f"   Backend URL: {self.base_url}")
        print("=" * 60)
    
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
        """Test API health before registration tests"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK":
                    self.log_test("Health Check", True, f"API is running - Database connected: {data.get('database_connected', False)}")
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
    
    def test_buyer_registration(self):
        """Test buyer registration with USA location"""
        try:
            buyer_data = {
                "firstName": "Michael",
                "lastName": "Johnson",
                "email": self.buyer_email,
                "password": "SecurePass123!",
                "userType": "buyer",
                "location": "Chicago, USA",
                "phone": "+1-312-555-0123"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=buyer_data,
                timeout=15
            )
            
            print(f"🔍 Buyer Registration Response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📋 Response data keys: {list(data.keys())}")
                
                # Check for required fields in response
                if data.get("success") and data.get("token") and data.get("user"):
                    self.buyer_token = data["token"]
                    self.buyer_data = data["user"]
                    
                    # Verify user data structure
                    user = data["user"]
                    expected_fields = ["id", "firstName", "lastName", "email", "userType", "location"]
                    missing_fields = [field for field in expected_fields if field not in user]
                    
                    if not missing_fields:
                        self.log_test("Buyer Registration", True, 
                                    f"Buyer registered successfully - ID: {user['id']}, Type: {user['userType']}")
                        return True
                    else:
                        self.log_test("Buyer Registration", False, 
                                    f"Missing user fields: {missing_fields}", data)
                        return False
                else:
                    missing_keys = []
                    if not data.get("success"): missing_keys.append("success")
                    if not data.get("token"): missing_keys.append("token")
                    if not data.get("user"): missing_keys.append("user")
                    
                    self.log_test("Buyer Registration", False, 
                                f"Missing response keys: {missing_keys}", data)
                    return False
            else:
                self.log_test("Buyer Registration", False, 
                            f"HTTP {response.status_code}", response.text[:500])
                return False
        except Exception as e:
            self.log_test("Buyer Registration", False, "Request failed", str(e))
            return False
    
    def test_seller_registration(self):
        """Test seller registration with Liberia location"""
        try:
            seller_data = {
                "firstName": "Fatima",
                "lastName": "Konneh",
                "email": self.seller_email,
                "password": "SecurePass456!",
                "userType": "seller",
                "location": "Monrovia, Liberia",
                "phone": "+231-777-555-0456"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=seller_data,
                timeout=15
            )
            
            print(f"🔍 Seller Registration Response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📋 Response data keys: {list(data.keys())}")
                
                # Check for required fields in response
                if data.get("success") and data.get("token") and data.get("user"):
                    self.seller_token = data["token"]
                    self.seller_data = data["user"]
                    
                    # Verify user data structure
                    user = data["user"]
                    expected_fields = ["id", "firstName", "lastName", "email", "userType", "location"]
                    missing_fields = [field for field in expected_fields if field not in user]
                    
                    if not missing_fields:
                        self.log_test("Seller Registration", True, 
                                    f"Seller registered successfully - ID: {user['id']}, Type: {user['userType']}")
                        return True
                    else:
                        self.log_test("Seller Registration", False, 
                                    f"Missing user fields: {missing_fields}", data)
                        return False
                else:
                    missing_keys = []
                    if not data.get("success"): missing_keys.append("success")
                    if not data.get("token"): missing_keys.append("token")
                    if not data.get("user"): missing_keys.append("user")
                    
                    self.log_test("Seller Registration", False, 
                                f"Missing response keys: {missing_keys}", data)
                    return False
            else:
                self.log_test("Seller Registration", False, 
                            f"HTTP {response.status_code}", response.text[:500])
                return False
        except Exception as e:
            self.log_test("Seller Registration", False, "Request failed", str(e))
            return False
    
    def test_location_validation_buyer_in_liberia(self):
        """Test that buyers cannot register with Liberia location"""
        try:
            invalid_buyer_data = {
                "firstName": "Invalid",
                "lastName": "Buyer",
                "email": f"invalid_buyer_{uuid.uuid4().hex[:8]}@testliberia2usa.com",
                "password": "SecurePass789!",
                "userType": "buyer",
                "location": "Monrovia, Liberia",  # Invalid for buyer
                "phone": "+231-777-555-0789"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=invalid_buyer_data,
                timeout=15
            )
            
            print(f"🔍 Invalid Buyer Location Response: {response.status_code}")
            
            if response.status_code == 422:  # Validation error expected
                data = response.json()
                self.log_test("Location Validation - Buyer in Liberia", True, 
                            "Buyer with Liberia location correctly rejected")
                return True
            elif response.status_code == 400:  # Alternative validation error
                data = response.json()
                if "location" in str(data).lower() or "validation" in str(data).lower():
                    self.log_test("Location Validation - Buyer in Liberia", True, 
                                "Buyer with Liberia location correctly rejected (400)")
                    return True
                else:
                    self.log_test("Location Validation - Buyer in Liberia", False, 
                                f"Wrong error type for location validation", data)
                    return False
            else:
                self.log_test("Location Validation - Buyer in Liberia", False, 
                            f"Expected validation error (422/400), got HTTP {response.status_code}", 
                            response.text[:500])
                return False
        except Exception as e:
            self.log_test("Location Validation - Buyer in Liberia", False, "Request failed", str(e))
            return False
    
    def test_location_validation_seller_in_usa(self):
        """Test that sellers cannot register with USA location"""
        try:
            invalid_seller_data = {
                "firstName": "Invalid",
                "lastName": "Seller",
                "email": f"invalid_seller_{uuid.uuid4().hex[:8]}@testliberia2usa.com",
                "password": "SecurePass789!",
                "userType": "seller",
                "location": "New York, USA",  # Invalid for seller
                "phone": "+1-212-555-0789"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=invalid_seller_data,
                timeout=15
            )
            
            print(f"🔍 Invalid Seller Location Response: {response.status_code}")
            
            if response.status_code == 422:  # Validation error expected
                data = response.json()
                self.log_test("Location Validation - Seller in USA", True, 
                            "Seller with USA location correctly rejected")
                return True
            elif response.status_code == 400:  # Alternative validation error
                data = response.json()
                if "location" in str(data).lower() or "validation" in str(data).lower():
                    self.log_test("Location Validation - Seller in USA", True, 
                                "Seller with USA location correctly rejected (400)")
                    return True
                else:
                    self.log_test("Location Validation - Seller in USA", False, 
                                f"Wrong error type for location validation", data)
                    return False
            else:
                self.log_test("Location Validation - Seller in USA", False, 
                            f"Expected validation error (422/400), got HTTP {response.status_code}", 
                            response.text[:500])
                return False
        except Exception as e:
            self.log_test("Location Validation - Seller in USA", False, "Request failed", str(e))
            return False
    
    def test_duplicate_email_validation(self):
        """Test that duplicate email registration is rejected"""
        try:
            # Try to register buyer again with same email
            duplicate_data = {
                "firstName": "Duplicate",
                "lastName": "User",
                "email": self.buyer_email,  # Same email as first buyer
                "password": "DifferentPass123!",
                "userType": "buyer",
                "location": "Miami, USA",
                "phone": "+1-305-555-0999"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=duplicate_data,
                timeout=15
            )
            
            print(f"🔍 Duplicate Email Response: {response.status_code}")
            
            if response.status_code == 400:  # Bad request expected
                data = response.json()
                if "email" in str(data).lower() or "already" in str(data).lower():
                    self.log_test("Duplicate Email Validation", True, 
                                "Duplicate email correctly rejected")
                    return True
                else:
                    self.log_test("Duplicate Email Validation", False, 
                                f"Wrong error message for duplicate email", data)
                    return False
            else:
                self.log_test("Duplicate Email Validation", False, 
                            f"Expected 400 for duplicate email, got HTTP {response.status_code}", 
                            response.text[:500])
                return False
        except Exception as e:
            self.log_test("Duplicate Email Validation", False, "Request failed", str(e))
            return False
    
    def test_token_validation(self):
        """Test that registration tokens work for authentication"""
        if not self.buyer_token:
            self.log_test("Token Validation", False, "No buyer token available", "Buyer registration may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=10
            )
            
            print(f"🔍 Token Validation Response: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    user = data["user"]
                    if user.get("email") == self.buyer_email:
                        self.log_test("Token Validation", True, 
                                    f"Registration token works - User: {user.get('firstName')} {user.get('lastName')}")
                        return True
                    else:
                        self.log_test("Token Validation", False, 
                                    f"Token returned wrong user: {user.get('email')}")
                        return False
                else:
                    self.log_test("Token Validation", False, "Invalid /me response format", data)
                    return False
            else:
                self.log_test("Token Validation", False, 
                            f"Token validation failed - HTTP {response.status_code}", response.text[:500])
                return False
        except Exception as e:
            self.log_test("Token Validation", False, "Request failed", str(e))
            return False
    
    def test_registration_response_structure(self):
        """Test that registration response has the expected JSON structure"""
        if not self.buyer_data or not self.seller_data:
            self.log_test("Response Structure", False, "Missing registration data", "Previous registrations may have failed")
            return False
        
        try:
            # Check buyer response structure
            buyer_required_fields = ["id", "firstName", "lastName", "email", "userType", "location", "phone"]
            buyer_missing = [field for field in buyer_required_fields if field not in self.buyer_data]
            
            # Check seller response structure  
            seller_required_fields = ["id", "firstName", "lastName", "email", "userType", "location", "phone"]
            seller_missing = [field for field in seller_required_fields if field not in self.seller_data]
            
            if not buyer_missing and not seller_missing:
                # Verify data types and values
                buyer_checks = [
                    self.buyer_data["userType"] == "buyer",
                    "usa" in self.buyer_data["location"].lower(),
                    "@" in self.buyer_data["email"],
                    len(self.buyer_data["id"]) > 10  # UUID should be longer
                ]
                
                seller_checks = [
                    self.seller_data["userType"] == "seller", 
                    "liberia" in self.seller_data["location"].lower(),
                    "@" in self.seller_data["email"],
                    len(self.seller_data["id"]) > 10  # UUID should be longer
                ]
                
                if all(buyer_checks) and all(seller_checks):
                    self.log_test("Response Structure", True, 
                                "Registration responses have correct JSON structure with all required fields")
                    return True
                else:
                    self.log_test("Response Structure", False, 
                                f"Data validation failed - Buyer checks: {buyer_checks}, Seller checks: {seller_checks}")
                    return False
            else:
                self.log_test("Response Structure", False, 
                            f"Missing fields - Buyer: {buyer_missing}, Seller: {seller_missing}")
                return False
                
        except Exception as e:
            self.log_test("Response Structure", False, "Structure validation failed", str(e))
            return False
    
    def test_error_handling(self):
        """Test various error scenarios"""
        try:
            # Test missing required fields
            incomplete_data = {
                "firstName": "Incomplete",
                "email": f"incomplete_{uuid.uuid4().hex[:8]}@testliberia2usa.com"
                # Missing lastName, password, userType, location, phone
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=incomplete_data,
                timeout=10
            )
            
            print(f"🔍 Incomplete Data Response: {response.status_code}")
            
            if response.status_code == 422:  # Validation error expected
                data = response.json()
                if "detail" in data and isinstance(data["detail"], list):
                    # FastAPI validation error format
                    missing_fields = [error.get("loc", [])[-1] for error in data["detail"] if error.get("type") == "missing"]
                    if len(missing_fields) >= 3:  # Should have multiple missing fields
                        self.log_test("Error Handling", True, 
                                    f"Missing fields correctly identified: {missing_fields}")
                        return True
                    else:
                        self.log_test("Error Handling", False, 
                                    f"Expected more missing field errors, got: {missing_fields}")
                        return False
                else:
                    self.log_test("Error Handling", False, "Unexpected error format", data)
                    return False
            else:
                self.log_test("Error Handling", False, 
                            f"Expected 422 for incomplete data, got HTTP {response.status_code}", 
                            response.text[:500])
                return False
        except Exception as e:
            self.log_test("Error Handling", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all registration tests"""
        print("🚀 Starting Registration API Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        tests = [
            self.test_health_check,
            self.test_buyer_registration,
            self.test_seller_registration,
            self.test_location_validation_buyer_in_liberia,
            self.test_location_validation_seller_in_usa,
            self.test_duplicate_email_validation,
            self.test_token_validation,
            self.test_registration_response_structure,
            self.test_error_handling
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
        
        print("\n" + "=" * 60)
        print("📊 REGISTRATION TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        else:
            print("\n🎉 All registration tests passed!")
        
        return passed, failed

if __name__ == "__main__":
    tester = RegistrationTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(1 if failed > 0 else 0)