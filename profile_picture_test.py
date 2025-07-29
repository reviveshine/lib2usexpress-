#!/usr/bin/env python3
"""
Focused Profile Picture Testing for Liberia2USA Express
Tests the newly added profile picture functionality
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
        """Setup authentication tokens"""
        print("🔐 Setting up authentication...")
        
        # Try to login with existing buyer
        try:
            login_data = {
                "email": "john.smith@email.com",
                "password": "SecurePass123!"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.buyer_token = data["token"]
                    print("✅ Buyer authentication successful")
                else:
                    print("❌ Buyer login failed - invalid response")
                    return False
            else:
                print(f"❌ Buyer login failed - HTTP {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Buyer login failed - {str(e)}")
            return False
        
        # Try to login with seller (create new one if needed)
        try:
            # First try existing seller
            login_data = {
                "email": "mary.johnson@email.com",
                "password": "SecurePass456!"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.seller_token = data["token"]
                    print("✅ Seller authentication successful")
                else:
                    print("❌ Seller login failed - invalid response")
            else:
                # Try different seller credentials
                print("🔄 Trying alternative seller credentials...")
                alt_login_data = {
                    "email": "sarah.wilson@email.com",
                    "password": "SecurePass789!"
                }
                
                alt_response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json=alt_login_data,
                    timeout=10
                )
                
                if alt_response.status_code == 200:
                    alt_data = alt_response.json()
                    if alt_data.get("success") and alt_data.get("token"):
                        self.seller_token = alt_data["token"]
                        print("✅ Alternative seller authentication successful")
                    else:
                        print("❌ Alternative seller login failed - invalid response")
                else:
                    print(f"❌ Alternative seller login failed - HTTP {alt_response.status_code}")
        except Exception as e:
            print(f"❌ Seller authentication failed - {str(e)}")
        
        return self.buyer_token is not None
    
    def test_profile_picture_upload_png(self):
        """Test PUT /api/profile/profile/picture with PNG image"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            # Use the provided test image (1x1 pixel PNG)
            test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            
            picture_data = {
                "profile_picture": test_image_base64
            }
            
            response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=picture_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture updated successfully":
                    self.log_test("Profile Picture Upload - PNG", True, "PNG profile picture uploaded successfully")
                    return True
                else:
                    self.log_test("Profile Picture Upload - PNG", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Profile Picture Upload - PNG", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Picture Upload - PNG", False, "Request failed", str(e))
            return False
    
    def test_profile_picture_upload_jpeg(self):
        """Test PUT /api/profile/profile/picture with JPEG image"""
        if not self.seller_token:
            self.log_test("Profile Picture Upload - JPEG", False, "No seller token available", "Seller authentication failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create a simple JPEG base64 test image
            test_image_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=="
            
            picture_data = {
                "profile_picture": test_image_base64
            }
            
            response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=picture_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture updated successfully":
                    self.log_test("Profile Picture Upload - JPEG", True, "JPEG profile picture uploaded successfully")
                    return True
                else:
                    self.log_test("Profile Picture Upload - JPEG", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Profile Picture Upload - JPEG", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Picture Upload - JPEG", False, "Request failed", str(e))
            return False
    
    def test_profile_picture_retrieval_after_upload(self):
        """Test GET /api/profile/profile includes profile_picture after upload"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            response = requests.get(
                f"{self.base_url}/api/profile/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile") and
                    "profile_picture" in data["profile"]):
                    
                    profile_picture = data["profile"]["profile_picture"]
                    if profile_picture is not None and profile_picture.startswith("data:image/"):
                        self.log_test("Profile Picture Retrieval After Upload", True, "Profile picture retrieved successfully after upload")
                        return True
                    elif profile_picture is None:
                        self.log_test("Profile Picture Retrieval After Upload", False, "Profile picture is null (may have been deleted)", data.get("profile", {}))
                        return False
                    else:
                        self.log_test("Profile Picture Retrieval After Upload", False, "Profile picture format invalid", data.get("profile", {}))
                        return False
                else:
                    self.log_test("Profile Picture Retrieval After Upload", False, "Profile picture field not found", data.get("profile", {}))
                    return False
            else:
                self.log_test("Profile Picture Retrieval After Upload", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Picture Retrieval After Upload", False, "Request failed", str(e))
            return False
    
    def test_profile_picture_delete(self):
        """Test DELETE /api/profile/profile/picture removes profile picture"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            response = requests.delete(
                f"{self.base_url}/api/profile/profile/picture",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message") == "Profile picture removed successfully":
                    self.log_test("Profile Picture Delete", True, "Profile picture deleted successfully")
                    return True
                else:
                    self.log_test("Profile Picture Delete", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Profile Picture Delete", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Picture Delete", False, "Request failed", str(e))
            return False
    
    def test_profile_picture_retrieval_after_delete(self):
        """Test GET /api/profile/profile shows null profile_picture after deletion"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            response = requests.get(
                f"{self.base_url}/api/profile/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile") and
                    "profile_picture" in data["profile"] and
                    data["profile"]["profile_picture"] is None):
                    self.log_test("Profile Picture Retrieval After Delete", True, "Profile picture correctly set to null after deletion")
                    return True
                else:
                    self.log_test("Profile Picture Retrieval After Delete", False, "Profile picture not null after deletion", data.get("profile", {}))
                    return False
            else:
                self.log_test("Profile Picture Retrieval After Delete", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Picture Retrieval After Delete", False, "Request failed", str(e))
            return False
    
    def test_profile_picture_authentication_required(self):
        """Test that profile picture endpoints require authentication"""
        try:
            # Test upload without authentication
            test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            picture_data = {"profile_picture": test_image_base64}
            
            response1 = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=picture_data,
                timeout=10
            )
            
            # Test delete without authentication
            response2 = requests.delete(
                f"{self.base_url}/api/profile/profile/picture",
                timeout=10
            )
            
            if response1.status_code == 403 and response2.status_code == 403:
                self.log_test("Profile Picture Authentication Required", True, "Profile picture endpoints correctly require authentication")
                return True
            else:
                self.log_test("Profile Picture Authentication Required", False, f"Expected 403 for both endpoints, got {response1.status_code} and {response2.status_code}")
                return False
        except Exception as e:
            self.log_test("Profile Picture Authentication Required", False, "Request failed", str(e))
            return False
    
    def test_complete_workflow(self):
        """Test complete profile picture workflow: upload → retrieve → delete → verify removal"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            # Step 1: Upload profile picture
            test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            picture_data = {"profile_picture": test_image_base64}
            
            upload_response = requests.put(
                f"{self.base_url}/api/profile/profile/picture",
                json=picture_data,
                headers=headers,
                timeout=10
            )
            
            if upload_response.status_code != 200:
                self.log_test("Complete Workflow", False, "Upload failed", upload_response.text)
                return False
            
            # Step 2: Retrieve and verify picture exists
            get_response = requests.get(
                f"{self.base_url}/api/profile/profile",
                headers=headers,
                timeout=10
            )
            
            if get_response.status_code != 200:
                self.log_test("Complete Workflow", False, "Profile retrieval failed", get_response.text)
                return False
            
            get_data = get_response.json()
            if not (get_data.get("profile", {}).get("profile_picture") and 
                   get_data["profile"]["profile_picture"].startswith("data:image/")):
                self.log_test("Complete Workflow", False, "Profile picture not found after upload")
                return False
            
            # Step 3: Delete profile picture
            delete_response = requests.delete(
                f"{self.base_url}/api/profile/profile/picture",
                headers=headers,
                timeout=10
            )
            
            if delete_response.status_code != 200:
                self.log_test("Complete Workflow", False, "Delete failed", delete_response.text)
                return False
            
            # Step 4: Verify picture is removed
            verify_response = requests.get(
                f"{self.base_url}/api/profile/profile",
                headers=headers,
                timeout=10
            )
            
            if verify_response.status_code != 200:
                self.log_test("Complete Workflow", False, "Verification retrieval failed", verify_response.text)
                return False
            
            verify_data = verify_response.json()
            if verify_data.get("profile", {}).get("profile_picture") is not None:
                self.log_test("Complete Workflow", False, "Profile picture not removed after deletion")
                return False
            
            self.log_test("Complete Workflow", True, "Complete workflow successful: upload → retrieve → delete → verify removal")
            return True
            
        except Exception as e:
            self.log_test("Complete Workflow", False, "Request failed", str(e))
            return False
    
    def run_tests(self):
        """Run all profile picture tests"""
        print(f"🚀 Starting Profile Picture Testing for: {self.base_url}")
        print("=" * 80)
        
        # Setup authentication
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return
        
        print("\n📸 PROFILE PICTURE FUNCTIONALITY TESTS")
        print("-" * 50)
        
        # Run tests
        tests = [
            self.test_profile_picture_upload_png,
            self.test_profile_picture_retrieval_after_upload,
            self.test_profile_picture_upload_jpeg,
            self.test_profile_picture_delete,
            self.test_profile_picture_retrieval_after_delete,
            self.test_profile_picture_authentication_required,
            self.test_complete_workflow
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
            print()  # Add spacing between tests
        
        # Summary
        print("=" * 80)
        print(f"📊 PROFILE PICTURE TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        if passed + failed > 0:
            print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        # Save results
        with open('/app/profile_picture_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\n📄 Detailed test results saved to: /app/profile_picture_test_results.json")
        
        return passed, failed

if __name__ == "__main__":
    tester = ProfilePictureTester()
    passed, failed = tester.run_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)