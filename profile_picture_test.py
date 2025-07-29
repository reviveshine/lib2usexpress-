#!/usr/bin/env python3
"""
Profile Picture Functionality Testing for Liberia2USA Express
Tests the newly added profile picture endpoints as requested in the review
"""

import requests
import json
import sys
import os
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

class ProfilePictureTester:
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
    
    def setup_authentication(self):
        """Setup buyer and seller authentication"""
        print("🔐 Setting up authentication...")
        
        # Register and login buyer
        buyer_data = {
            "firstName": "John",
            "lastName": "Buyer",
            "email": "john.buyer.profile@test.com",
            "password": "TestPass123!",
            "userType": "buyer",
            "location": "usa",
            "phone": "+1234567890"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=buyer_data, timeout=10)
            if response.status_code == 201:
                print("✅ Buyer registered successfully")
            elif response.status_code == 400 and "already registered" in response.text:
                print("ℹ️ Buyer already exists, proceeding to login")
            else:
                print(f"⚠️ Buyer registration issue: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Buyer registration error: {e}")
        
        # Login buyer
        try:
            login_data = {"email": buyer_data["email"], "password": buyer_data["password"]}
            response = requests.post(f"{self.base_url}/api/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.buyer_token = data["token"]
                    print("✅ Buyer login successful")
                else:
                    print("❌ Buyer login failed - invalid response")
            else:
                print(f"❌ Buyer login failed - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Buyer login error: {e}")
        
        # Register and login seller
        seller_data = {
            "firstName": "Mary",
            "lastName": "Seller",
            "email": "mary.seller.profile@test.com",
            "password": "TestPass123!",
            "userType": "seller",
            "location": "liberia",
            "phone": "+231234567890"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=seller_data, timeout=10)
            if response.status_code == 201:
                print("✅ Seller registered successfully")
            elif response.status_code == 400 and "already registered" in response.text:
                print("ℹ️ Seller already exists, proceeding to login")
            else:
                print(f"⚠️ Seller registration issue: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Seller registration error: {e}")
        
        # Login seller
        try:
            login_data = {"email": seller_data["email"], "password": seller_data["password"]}
            response = requests.post(f"{self.base_url}/api/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.seller_token = data["token"]
                    print("✅ Seller login successful")
                else:
                    print("❌ Seller login failed - invalid response")
            else:
                print(f"❌ Seller login failed - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Seller login error: {e}")
    
    def test_put_profile_picture_png(self):
        """Test PUT /api/profile/profile/picture with PNG image"""
        print("\n📸 Testing PUT /api/profile/profile/picture (PNG)...")
        
        # Small PNG test image (1x1 pixel)
        test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            payload = {"profile_picture": test_image_base64}
            
            response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture updated successfully":
                    self.log_test("PUT Profile Picture (PNG)", True, "PNG profile picture uploaded successfully")
                    return True
                else:
                    self.log_test("PUT Profile Picture (PNG)", False, "Invalid response format", data)
            else:
                self.log_test("PUT Profile Picture (PNG)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("PUT Profile Picture (PNG)", False, "Request failed", str(e))
        
        return False
    
    def test_put_profile_picture_jpeg(self):
        """Test PUT /api/profile/profile/picture with JPEG image"""
        print("\n📸 Testing PUT /api/profile/profile/picture (JPEG)...")
        
        # Small JPEG test image (1x1 pixel)
        test_image_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A"
        
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            payload = {"profile_picture": test_image_base64}
            
            response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture updated successfully":
                    self.log_test("PUT Profile Picture (JPEG)", True, "JPEG profile picture uploaded successfully")
                    return True
                else:
                    self.log_test("PUT Profile Picture (JPEG)", False, "Invalid response format", data)
            else:
                self.log_test("PUT Profile Picture (JPEG)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("PUT Profile Picture (JPEG)", False, "Request failed", str(e))
        
        return False
    
    def test_get_profile_with_picture(self):
        """Test GET /api/profile/profile includes profile_picture field"""
        print("\n👤 Testing GET /api/profile/profile (with picture)...")
        
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(f"{self.base_url}/api/profile/profile", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile") and 
                    "profile_picture" in data["profile"] and
                    data["profile"]["profile_picture"] is not None and
                    data["profile"]["profile_picture"].startswith("data:image/")):
                    self.log_test("GET Profile (with picture)", True, "Profile picture retrieved successfully")
                    return True
                else:
                    self.log_test("GET Profile (with picture)", False, "Profile picture not found or invalid format", data.get("profile", {}))
            else:
                self.log_test("GET Profile (with picture)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET Profile (with picture)", False, "Request failed", str(e))
        
        return False
    
    def test_delete_profile_picture(self):
        """Test DELETE /api/profile/profile/picture"""
        print("\n🗑️ Testing DELETE /api/profile/profile/picture...")
        
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.delete(f"{self.base_url}/api/profile/profile/picture", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture removed successfully":
                    self.log_test("DELETE Profile Picture", True, "Profile picture deleted successfully")
                    return True
                else:
                    self.log_test("DELETE Profile Picture", False, "Invalid response format", data)
            else:
                self.log_test("DELETE Profile Picture", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("DELETE Profile Picture", False, "Request failed", str(e))
        
        return False
    
    def test_get_profile_after_delete(self):
        """Test GET /api/profile/profile after deletion (should be null)"""
        print("\n👤 Testing GET /api/profile/profile (after deletion)...")
        
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(f"{self.base_url}/api/profile/profile", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile") and 
                    "profile_picture" in data["profile"] and
                    data["profile"]["profile_picture"] is None):
                    self.log_test("GET Profile (after deletion)", True, "Profile picture correctly set to null after deletion")
                    return True
                else:
                    self.log_test("GET Profile (after deletion)", False, "Profile picture not null after deletion", data.get("profile", {}))
            else:
                self.log_test("GET Profile (after deletion)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("GET Profile (after deletion)", False, "Request failed", str(e))
        
        return False
    
    def test_delete_nonexistent_picture(self):
        """Test DELETE /api/profile/profile/picture when no picture exists"""
        print("\n🗑️ Testing DELETE /api/profile/profile/picture (no picture exists)...")
        
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.delete(f"{self.base_url}/api/profile/profile/picture", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture removed successfully":
                    self.log_test("DELETE Profile Picture (nonexistent)", True, "Delete operation successful even when no picture exists")
                    return True
                else:
                    self.log_test("DELETE Profile Picture (nonexistent)", False, "Invalid response format", data)
            else:
                self.log_test("DELETE Profile Picture (nonexistent)", False, f"HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("DELETE Profile Picture (nonexistent)", False, "Request failed", str(e))
        
        return False
    
    def test_authentication_required(self):
        """Test that all endpoints require authentication"""
        print("\n🔐 Testing authentication requirements...")
        
        test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        endpoints = [
            ("PUT", f"{self.base_url}/api/profile/profile/picture", {"profile_picture": test_image_base64}),
            ("DELETE", f"{self.base_url}/api/profile/profile/picture", None),
            ("GET", f"{self.base_url}/api/profile/profile", None)
        ]
        
        all_protected = True
        
        for method, url, payload in endpoints:
            try:
                if method == "PUT":
                    response = requests.put(url, json=payload, timeout=10)
                elif method == "DELETE":
                    response = requests.delete(url, timeout=10)
                else:  # GET
                    response = requests.get(url, timeout=10)
                
                if response.status_code == 403:
                    print(f"✅ {method} endpoint correctly requires authentication")
                else:
                    print(f"❌ {method} endpoint does not require authentication (got {response.status_code})")
                    all_protected = False
            except Exception as e:
                print(f"❌ Error testing {method} endpoint: {e}")
                all_protected = False
        
        if all_protected:
            self.log_test("Authentication Required", True, "All profile picture endpoints correctly require authentication")
        else:
            self.log_test("Authentication Required", False, "Some endpoints do not require authentication")
        
        return all_protected
    
    def test_updated_at_timestamp(self):
        """Test that profile picture operations update the updated_at timestamp"""
        print("\n⏰ Testing updated_at timestamp updates...")
        
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Get initial timestamp
            response = requests.get(f"{self.base_url}/api/profile/profile", headers=headers, timeout=10)
            if response.status_code != 200:
                self.log_test("Updated At Timestamp", False, "Could not get initial profile")
                return False
            
            initial_data = response.json()
            initial_timestamp = initial_data.get("profile", {}).get("updated_at")
            
            # Wait a moment to ensure timestamp difference
            import time
            time.sleep(1)
            
            # Upload profile picture
            test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            payload = {"profile_picture": test_image_base64}
            
            response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test("Updated At Timestamp", False, "Could not upload profile picture")
                return False
            
            # Get updated timestamp
            response = requests.get(f"{self.base_url}/api/profile/profile", headers=headers, timeout=10)
            if response.status_code != 200:
                self.log_test("Updated At Timestamp", False, "Could not get updated profile")
                return False
            
            updated_data = response.json()
            updated_timestamp = updated_data.get("profile", {}).get("updated_at")
            
            if initial_timestamp != updated_timestamp:
                self.log_test("Updated At Timestamp", True, "Profile updated_at timestamp correctly updated after picture upload")
                return True
            else:
                self.log_test("Updated At Timestamp", False, "Profile updated_at timestamp not updated")
                return False
                
        except Exception as e:
            self.log_test("Updated At Timestamp", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all profile picture tests"""
        print(f"\n🚀 Starting Profile Picture Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Setup authentication
        self.setup_authentication()
        
        if not self.buyer_token or not self.seller_token:
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return
        
        print("\n📸 Running Profile Picture Functionality Tests...")
        
        # Test sequence as requested in the review
        tests = [
            self.test_put_profile_picture_png,
            self.test_put_profile_picture_jpeg,
            self.test_get_profile_with_picture,
            self.test_updated_at_timestamp,
            self.test_delete_profile_picture,
            self.test_get_profile_after_delete,
            self.test_delete_nonexistent_picture,
            self.test_authentication_required
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {e}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 PROFILE PICTURE TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        print(f"\n🎯 Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All profile picture tests passed! The functionality is working correctly.")
        else:
            print("⚠️ Some tests failed. Please review the issues above.")

def main():
    tester = ProfilePictureTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()