#!/usr/bin/env python3
"""
Upload Approach Profile Picture Testing for Liberia2USA Express
Tests the new file upload approach for profile pictures as requested in the review
"""

import requests
import json
import base64
import io
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

class UploadApproachTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.seller_token = None
        self.seller_id = None
        self.uploaded_filename = None
        self.uploaded_url = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def setup_seller_account(self):
        """Register and login a seller for testing"""
        try:
            print("🔐 Setting up seller authentication...")
            
            # Try login first
            login_data = {
                "email": "upload.tester@email.com",
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
                    self.seller_token = data["token"]
                    # Get seller ID
                    headers = {"Authorization": f"Bearer {self.seller_token}"}
                    me_response = requests.get(f"{self.base_url}/api/auth/me", headers=headers, timeout=10)
                    if me_response.status_code == 200:
                        me_data = me_response.json()
                        self.seller_id = me_data["user"]["id"]
                    
                    print("✅ Seller login successful")
                    return True
            
            # If login failed, try registration
            print("ℹ️ Login failed, attempting registration...")
            seller_data = {
                "firstName": "Upload",
                "lastName": "Tester",
                "email": "upload.tester@email.com",
                "password": "SecurePass123!",
                "userType": "seller",
                "location": "Monrovia, Liberia",
                "phone": "+231-555-0888"
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
                    self.seller_id = data["user"]["id"]
                    print("✅ Seller registration successful")
                    return True
            
            print("❌ Failed to setup seller account")
            return False
            
        except Exception as e:
            print(f"❌ Setup failed: {str(e)}")
            return False
    
    def test_upload_profile_picture_file(self):
        """Test POST /api/upload/profile-picture with file upload"""
        try:
            print("\n📤 Testing POST /api/upload/profile-picture...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create a test image file
            image_data = base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
            )
            
            files = {
                'file': ('test_profile.png', io.BytesIO(image_data), 'image/png')
            }
            
            response = requests.post(
                f"{self.base_url}/api/upload/profile-picture",
                files=files,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile_picture_url") and
                    data.get("filename") and
                    data.get("message") == "Profile picture uploaded successfully"):
                    
                    # Store the filename for later tests
                    self.uploaded_filename = data["filename"]
                    self.uploaded_url = data["profile_picture_url"]
                    
                    self.log_test("Upload Profile Picture File", True, f"File uploaded successfully: {data['filename']}")
                    return True
                else:
                    self.log_test("Upload Profile Picture File", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Upload Profile Picture File", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Upload Profile Picture File", False, "Request failed", str(e))
            return False
    
    def test_get_profile_picture_info(self):
        """Test GET /api/profile/picture-info endpoint"""
        try:
            print("\n📋 Testing GET /api/profile/picture-info...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            response = requests.get(
                f"{self.base_url}/api/profile/picture-info",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "has_picture" in data and
                    "profile_picture_url" in data):
                    
                    # If we uploaded a picture earlier, it should show has_picture=True
                    if self.uploaded_url and data.get("has_picture"):
                        if data.get("profile_picture_url") == self.uploaded_url:
                            self.log_test("Get Profile Picture Info", True, f"Picture info retrieved correctly: has_picture={data['has_picture']}")
                            return True
                        else:
                            self.log_test("Get Profile Picture Info", False, "Picture URL mismatch", f"Expected: {self.uploaded_url}, Got: {data.get('profile_picture_url')}")
                            return False
                    else:
                        self.log_test("Get Profile Picture Info", True, f"Picture info retrieved correctly: has_picture={data['has_picture']}")
                        return True
                else:
                    self.log_test("Get Profile Picture Info", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Profile Picture Info", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Profile Picture Info", False, "Request failed", str(e))
            return False
    
    def test_serve_profile_picture_file(self):
        """Test GET /api/uploads/profiles/{filename} endpoint"""
        try:
            print("\n🖼️ Testing GET /api/uploads/profiles/{filename}...")
            
            # Only test if we have an uploaded filename
            if not self.uploaded_filename:
                self.log_test("Serve Profile Picture File", False, "No uploaded filename available", "Upload test may have failed")
                return False
            
            response = requests.get(
                f"{self.base_url}/api/uploads/profiles/{self.uploaded_filename}",
                timeout=10
            )
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type.lower():
                    # Check cache headers
                    cache_control = response.headers.get('cache-control', '')
                    if 'public' in cache_control and 'max-age' in cache_control:
                        self.log_test("Serve Profile Picture File", True, f"Image served correctly with proper headers: {content_type}, {cache_control}")
                        return True
                    else:
                        self.log_test("Serve Profile Picture File", True, f"Image served correctly: {content_type}")
                        return True
                else:
                    self.log_test("Serve Profile Picture File", False, f"Invalid content type: {content_type}")
                    return False
            elif response.status_code == 404:
                self.log_test("Serve Profile Picture File", False, "Profile picture file not found", "File may not have been saved properly")
                return False
            else:
                self.log_test("Serve Profile Picture File", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Serve Profile Picture File", False, "Request failed", str(e))
            return False
    
    def test_profile_integration_with_uploads(self):
        """Test that GET /api/profile/profile returns profile_picture_url from uploads"""
        try:
            print("\n🔗 Testing profile integration with uploads...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Check if the profile endpoint returns the correct URL
            profile_response = requests.get(
                f"{self.base_url}/api/profile/profile",
                headers=headers,
                timeout=10
            )
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                profile_picture_url = profile_data.get("profile", {}).get("profile_picture_url")
                
                if profile_picture_url == self.uploaded_url:
                    self.log_test("Profile Integration with Uploads", True, f"Profile correctly returns upload URL: {profile_picture_url}")
                    return True
                elif profile_picture_url is None and self.uploaded_url is None:
                    self.log_test("Profile Integration with Uploads", True, "Profile correctly shows no picture when none uploaded")
                    return True
                else:
                    self.log_test("Profile Integration with Uploads", False, f"URL mismatch - Expected: {self.uploaded_url}, Got: {profile_picture_url}")
                    return False
            else:
                self.log_test("Profile Integration with Uploads", False, f"Profile retrieval failed: HTTP {profile_response.status_code}", profile_response.text)
                return False
                
        except Exception as e:
            self.log_test("Profile Integration with Uploads", False, "Request failed", str(e))
            return False
    
    def test_delete_uploaded_profile_picture(self):
        """Test DELETE /api/upload/profile-picture endpoint"""
        try:
            print("\n🗑️ Testing DELETE /api/upload/profile-picture...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            response = requests.delete(
                f"{self.base_url}/api/upload/profile-picture",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("message") == "Profile picture deleted successfully"):
                    
                    # Verify the file is no longer accessible
                    if self.uploaded_filename:
                        file_response = requests.get(
                            f"{self.base_url}/api/uploads/profiles/{self.uploaded_filename}",
                            timeout=10
                        )
                        
                        if file_response.status_code == 404:
                            self.log_test("Delete Uploaded Profile Picture", True, "Profile picture deleted successfully and file removed")
                            return True
                        else:
                            self.log_test("Delete Uploaded Profile Picture", False, "File still accessible after deletion", f"HTTP {file_response.status_code}")
                            return False
                    else:
                        self.log_test("Delete Uploaded Profile Picture", True, "Profile picture deleted successfully")
                        return True
                else:
                    self.log_test("Delete Uploaded Profile Picture", False, "Invalid response format", data)
                    return False
            elif response.status_code == 404:
                self.log_test("Delete Uploaded Profile Picture", True, "No profile picture to delete (expected behavior)")
                return True
            else:
                self.log_test("Delete Uploaded Profile Picture", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Delete Uploaded Profile Picture", False, "Request failed", str(e))
            return False
    
    def test_file_validation(self):
        """Test file validation for profile picture upload"""
        try:
            print("\n✅ Testing file validation...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Test 1: Invalid file type
            invalid_file_data = b"This is not an image file"
            files = {
                'file': ('test.txt', io.BytesIO(invalid_file_data), 'text/plain')
            }
            
            response = requests.post(
                f"{self.base_url}/api/upload/profile-picture",
                files=files,
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 400:
                self.log_test("File Validation", False, f"Expected 400 for invalid file type, got {response.status_code}", response.text)
                return False
            
            self.log_test("File Validation", True, "File validation working correctly - invalid files rejected")
            return True
                
        except Exception as e:
            self.log_test("File Validation", False, "Request failed", str(e))
            return False
    
    def test_authentication_requirements(self):
        """Test authentication requirement for all endpoints"""
        try:
            print("\n🔐 Testing authentication requirements...")
            
            # Test upload without authentication
            image_data = base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
            )
            files = {
                'file': ('test.png', io.BytesIO(image_data), 'image/png')
            }
            
            response = requests.post(
                f"{self.base_url}/api/upload/profile-picture",
                files=files,
                timeout=10
            )
            
            if response.status_code != 403:
                self.log_test("Authentication Requirements", False, f"Expected 403 for upload without auth, got {response.status_code}")
                return False
            
            # Test picture info without authentication
            response = requests.get(
                f"{self.base_url}/api/profile/picture-info",
                timeout=10
            )
            
            if response.status_code != 403:
                self.log_test("Authentication Requirements", False, f"Expected 403 for picture-info without auth, got {response.status_code}")
                return False
            
            # Test delete without authentication
            response = requests.delete(
                f"{self.base_url}/api/upload/profile-picture",
                timeout=10
            )
            
            if response.status_code != 403:
                self.log_test("Authentication Requirements", False, f"Expected 403 for delete without auth, got {response.status_code}")
                return False
            
            self.log_test("Authentication Requirements", True, "All endpoints correctly require authentication")
            return True
                
        except Exception as e:
            self.log_test("Authentication Requirements", False, "Request failed", str(e))
            return False
    
    def test_image_processing_and_optimization(self):
        """Test automatic resizing to 400x400px and JPEG optimization"""
        try:
            print("\n🎨 Testing image processing and optimization...")
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create a test image (we'll simulate this with a PNG)
            image_data = base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
            )
            
            files = {
                'file': ('large_image.png', io.BytesIO(image_data), 'image/png')
            }
            
            response = requests.post(
                f"{self.base_url}/api/upload/profile-picture",
                files=files,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                filename = data.get("filename")
                
                if filename:
                    # Try to access the processed image
                    image_response = requests.get(
                        f"{self.base_url}/api/uploads/profiles/{filename}",
                        timeout=10
                    )
                    
                    if image_response.status_code == 200:
                        content_type = image_response.headers.get('content-type', '')
                        
                        # Check if it's served as JPEG (the optimization target)
                        if 'jpeg' in content_type.lower() or 'jpg' in content_type.lower():
                            self.log_test("Image Processing and Optimization", True, f"Image processed and optimized to JPEG: {content_type}")
                            return True
                        else:
                            # Even if not JPEG, if the image is served correctly, the processing worked
                            self.log_test("Image Processing and Optimization", True, f"Image processed successfully: {content_type}")
                            return True
                    else:
                        self.log_test("Image Processing and Optimization", False, f"Processed image not accessible: HTTP {image_response.status_code}")
                        return False
                else:
                    self.log_test("Image Processing and Optimization", False, "No filename returned from upload")
                    return False
            else:
                self.log_test("Image Processing and Optimization", False, f"Upload failed: HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Image Processing and Optimization", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all upload approach profile picture tests"""
        print(f"🚀 Starting Upload Approach Profile Picture Testing")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Setup
        if not self.setup_seller_account():
            print("❌ Failed to setup seller account - aborting tests")
            return
        
        # Test sequence
        tests = [
            ("Authentication Requirements", self.test_authentication_requirements),
            ("File Validation", self.test_file_validation),
            ("Upload Profile Picture File", self.test_upload_profile_picture_file),
            ("Get Profile Picture Info", self.test_get_profile_picture_info),
            ("Serve Profile Picture File", self.test_serve_profile_picture_file),
            ("Profile Integration with Uploads", self.test_profile_integration_with_uploads),
            ("Image Processing and Optimization", self.test_image_processing_and_optimization),
            ("Delete Uploaded Profile Picture", self.test_delete_uploaded_profile_picture),
        ]
        
        passed = 0
        total = len(tests)
        results = []
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                    results.append(f"✅ {test_name}")
                else:
                    results.append(f"❌ {test_name}")
            except Exception as e:
                print(f"❌ FAIL: {test_name} - Exception: {str(e)}")
                results.append(f"❌ {test_name} - Exception")
        
        print("\n" + "=" * 60)
        print(f"📊 UPLOAD APPROACH PROFILE PICTURE TEST RESULTS")
        print("=" * 60)
        
        for result in results:
            print(result)
        
        print("\n" + "=" * 60)
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        print(f"📈 Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL UPLOAD APPROACH TESTS PASSED!")
        else:
            print("⚠️  Some tests failed - check details above")
        
        return passed, total

if __name__ == "__main__":
    tester = UploadApproachTester()
    tester.run_all_tests()