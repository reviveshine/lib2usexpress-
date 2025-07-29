#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Liberia2USA Express
Tests all FastAPI endpoints with proper authentication and validation
"""

import requests
import json
import sys
import os
import base64
import io
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://express-shipping-2.emergent.host"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.admin_token = None
        self.buyer_id = None
        self.seller_id = None
        self.product_id = None
        self.chat_id = None
        self.message_id = None
        self.checkout_session_id = None
        self.package_session_id = None
        self.test_results = []
    
    def _set_buyer_id(self):
        """Helper method to set buyer_id from token"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(f"{self.base_url}/api/auth/me", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.buyer_id = data["user"]["id"]
        except Exception:
            pass
    
    def _set_seller_id(self):
        """Helper method to set seller_id from token"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(f"{self.base_url}/api/auth/me", headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.seller_id = data["user"]["id"]
        except Exception:
            pass
        
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
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK" and data.get("database_connected"):
                    self.log_test("Health Check", True, "API is running and database connected")
                    return True
                else:
                    self.log_test("Health Check", False, "API running but database not connected", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, "Connection failed", str(e))
            return False
    
    def test_register_buyer(self):
        """Test buyer registration with USA location"""
        try:
            buyer_data = {
                "firstName": "John",
                "lastName": "Smith",
                "email": "john.smith@email.com",
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
                    self.buyer_id = data["user"]["id"]
                    self.log_test("Buyer Registration", True, "Buyer registered successfully")
                    return True
                else:
                    self.log_test("Buyer Registration", False, "Registration failed", data)
                    return False
            else:
                self.log_test("Buyer Registration", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Buyer Registration", False, "Request failed", str(e))
            return False
    
    def test_register_seller(self):
        """Test seller registration with Liberia location"""
        try:
            seller_data = {
                "firstName": "Mary",
                "lastName": "Johnson",
                "email": "mary.johnson@email.com",
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
                    self.seller_id = data["user"]["id"]
                    self.log_test("Seller Registration", True, "Seller registered successfully")
                    return True
                else:
                    self.log_test("Seller Registration", False, "Registration failed", data)
                    return False
            else:
                self.log_test("Seller Registration", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Registration", False, "Request failed", str(e))
            return False
    
    def test_location_validation(self):
        """Test location validation - buyer with Liberia location should fail"""
        try:
            invalid_buyer_data = {
                "firstName": "Invalid",
                "lastName": "Buyer",
                "email": "invalid.buyer@email.com",
                "password": "SecurePass789!",
                "userType": "buyer",
                "location": "Monrovia, Liberia",  # Invalid for buyer
                "phone": "+231-555-0789"
            }
            
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=invalid_buyer_data,
                timeout=10
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_test("Location Validation", True, "Location validation working - buyer with Liberia location rejected")
                return True
            else:
                self.log_test("Location Validation", False, f"Expected validation error, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Location Validation", False, "Request failed", str(e))
            return False
    
    def test_login_buyer(self):
        """Test buyer login"""
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
                    # Update token in case it's different
                    self.buyer_token = data["token"]
                    self._set_buyer_id()
                    self.log_test("Buyer Login", True, "Buyer login successful")
                    return True
                else:
                    self.log_test("Buyer Login", False, "Login failed", data)
                    return False
            else:
                self.log_test("Buyer Login", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Buyer Login", False, "Request failed", str(e))
            return False
    
    def test_login_seller(self):
        """Test seller login"""
        try:
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
                    # Update token in case it's different
                    self.seller_token = data["token"]
                    self._set_seller_id()
                    self.log_test("Seller Login", True, "Seller login successful")
                    return True
                else:
                    self.log_test("Seller Login", False, "Login failed", data)
                    return False
            else:
                self.log_test("Seller Login", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Login", False, "Request failed", str(e))
            return False
    
    def test_auth_me_endpoint(self):
        """Test /api/auth/me endpoint with buyer token"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.log_test("Auth Me Endpoint", True, "User info retrieved successfully")
                    return True
                else:
                    self.log_test("Auth Me Endpoint", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Auth Me Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Auth Me Endpoint", False, "Request failed", str(e))
            return False
    
    def test_user_profile_get(self):
        """Test GET /api/users/profile endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/users/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.log_test("Get User Profile", True, "User profile retrieved successfully")
                    return True
                else:
                    self.log_test("Get User Profile", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get User Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get User Profile", False, "Request failed", str(e))
            return False
    
    def test_user_profile_update(self):
        """Test PUT /api/users/profile endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            update_data = {
                "firstName": "John Updated",
                "phone": "+1-555-9999"
            }
            
            response = requests.put(
                f"{self.base_url}/api/users/profile",
                json=update_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("user"):
                    self.log_test("Update User Profile", True, "User profile updated successfully")
                    return True
                else:
                    self.log_test("Update User Profile", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Update User Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Update User Profile", False, "Request failed", str(e))
            return False
    
    def test_get_sellers(self):
        """Test GET /api/users/sellers endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/api/users/sellers",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "sellers" in data:
                    self.log_test("Get Sellers", True, f"Retrieved {data.get('count', 0)} sellers")
                    return True
                else:
                    self.log_test("Get Sellers", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Sellers", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Sellers", False, "Request failed", str(e))
            return False
    
    def test_create_product(self):
        """Test POST /api/products endpoint (seller only)"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            product_data = {
                "name": "Traditional Liberian Craft",
                "description": "Beautiful handmade traditional craft from Liberia, perfect for home decoration",
                "price": 45.99,
                "category": "Arts & Crafts",
                "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
                "video_url": "https://example.com/video.mp4",
                "stock": 10,
                "tags": ["handmade", "traditional", "liberian", "craft"],
                "weight": 0.5,
                "dimensions": {"length": 20, "width": 15, "height": 10}
            }
            
            response = requests.post(
                f"{self.base_url}/api/products",
                json=product_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("product"):
                    self.product_id = data["product"]["id"]
                    self.log_test("Create Product", True, "Product created successfully")
                    return True
                else:
                    self.log_test("Create Product", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Product", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Product", False, "Request failed", str(e))
            return False
    
    def test_get_products(self):
        """Test GET /api/products endpoint with pagination"""
        try:
            response = requests.get(
                f"{self.base_url}/api/products?page=1&limit=10",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data and "pagination" in data:
                    product_count = len(data["data"])
                    self.log_test("Get Products", True, f"Retrieved {product_count} products with pagination")
                    return True
                else:
                    self.log_test("Get Products", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Products", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Products", False, "Request failed", str(e))
            return False
    
    def test_get_products_with_filters(self):
        """Test GET /api/products endpoint with search and category filters"""
        try:
            response = requests.get(
                f"{self.base_url}/api/products?search=craft&category=Arts & Crafts&sort=price&order=asc",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    self.log_test("Get Products with Filters", True, "Products filtered successfully")
                    return True
                else:
                    self.log_test("Get Products with Filters", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Products with Filters", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Products with Filters", False, "Request failed", str(e))
            return False
    
    def test_get_single_product(self):
        """Test GET /api/products/{product_id} endpoint"""
        if not self.product_id:
            self.log_test("Get Single Product", False, "No product ID available", "Product creation may have failed")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/api/products/{self.product_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("product"):
                    self.log_test("Get Single Product", True, "Product retrieved successfully")
                    return True
                else:
                    self.log_test("Get Single Product", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Single Product", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Single Product", False, "Request failed", str(e))
            return False
    
    def test_get_seller_products(self):
        """Test GET /api/products/seller/my-products endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(
                f"{self.base_url}/api/products/seller/my-products?page=1&limit=10",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data and "pagination" in data:
                    product_count = len(data["data"])
                    self.log_test("Get Seller Products", True, f"Retrieved {product_count} seller products")
                    return True
                else:
                    self.log_test("Get Seller Products", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Seller Products", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Seller Products", False, "Request failed", str(e))
            return False
    
    def test_buyer_cannot_create_product(self):
        """Test that buyers cannot create products"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            product_data = {
                "name": "Unauthorized Product",
                "description": "This should fail",
                "price": 10.00,
                "category": "Test",
                "stock": 1
            }
            
            response = requests.post(
                f"{self.base_url}/api/products",
                json=product_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403:  # Forbidden expected
                self.log_test("Buyer Product Creation Block", True, "Buyers correctly blocked from creating products")
                return True
            else:
                self.log_test("Buyer Product Creation Block", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Buyer Product Creation Block", False, "Request failed", str(e))
            return False
    
    def test_unauthorized_access(self):
        """Test that protected endpoints require authentication"""
        try:
            response = requests.get(
                f"{self.base_url}/api/users/profile",
                timeout=10
            )
            
            if response.status_code == 403:  # Forbidden expected
                self.log_test("Unauthorized Access Block", True, "Protected endpoints correctly require authentication")
                return True
            else:
                self.log_test("Unauthorized Access Block", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Unauthorized Access Block", False, "Request failed", str(e))
            return False
    
    def create_test_image(self, size_mb=1):
        """Create a test image file in memory"""
        # Create a simple test image (1x1 pixel PNG)
        png_data = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
        )
        
        # If we need a larger file, repeat the data
        if size_mb > 1:
            multiplier = int((size_mb * 1024 * 1024) / len(png_data)) + 1
            png_data = png_data * multiplier
            
        return png_data
    
    def create_test_video(self, size_mb=1):
        """Create a test video file in memory"""
        # Create minimal test video data (just some bytes that look like video)
        video_data = b"fake_video_data_for_testing" * 1000
        
        # If we need a larger file, repeat the data
        if size_mb > 1:
            multiplier = int((size_mb * 1024 * 1024) / len(video_data)) + 1
            video_data = video_data * multiplier
            
        return video_data
    
    def test_media_upload_images(self):
        """Test POST /api/products/upload-media with image files"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create test image files
            image1_data = self.create_test_image(1)  # 1MB image
            image2_data = self.create_test_image(2)  # 2MB image
            
            files = [
                ('files', ('test_image1.png', io.BytesIO(image1_data), 'image/png')),
                ('files', ('test_image2.png', io.BytesIO(image2_data), 'image/png'))
            ]
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "images" in data and 
                    len(data["images"]) == 2 and
                    all(img.startswith("data:image/png;base64,") for img in data["images"])):
                    self.log_test("Media Upload - Images", True, "Images uploaded and base64 encoded successfully")
                    return True
                else:
                    self.log_test("Media Upload - Images", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Media Upload - Images", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload - Images", False, "Request failed", str(e))
            return False
    
    def test_media_upload_video(self):
        """Test POST /api/products/upload-media with video file"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create test video file
            video_data = self.create_test_video(5)  # 5MB video
            
            files = [
                ('files', ('test_video.mp4', io.BytesIO(video_data), 'video/mp4'))
            ]
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "video" in data and 
                    data["video"] and
                    data["video"].startswith("data:video/mp4;base64,")):
                    self.log_test("Media Upload - Video", True, "Video uploaded and base64 encoded successfully")
                    return True
                else:
                    self.log_test("Media Upload - Video", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Media Upload - Video", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload - Video", False, "Request failed", str(e))
            return False
    
    def test_media_upload_authentication(self):
        """Test that media upload requires seller authentication"""
        try:
            # Test without authentication
            image_data = self.create_test_image(1)
            files = [('files', ('test.png', io.BytesIO(image_data), 'image/png'))]
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                timeout=10
            )
            
            if response.status_code == 403:  # Should be forbidden without auth
                # Test with buyer token (should also fail)
                headers = {"Authorization": f"Bearer {self.buyer_token}"}
                response = requests.post(
                    f"{self.base_url}/api/products/upload-media",
                    files=files,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 403:
                    self.log_test("Media Upload Authentication", True, "Media upload correctly requires seller authentication")
                    return True
                else:
                    self.log_test("Media Upload Authentication", False, f"Buyer should be blocked, got HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Media Upload Authentication", False, f"Expected 403 without auth, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload Authentication", False, "Request failed", str(e))
            return False
    
    def test_media_upload_size_limits(self):
        """Test file size limits for media upload"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Test oversized image (>10MB)
            large_image_data = self.create_test_image(12)  # 12MB image
            files = [('files', ('large_image.png', io.BytesIO(large_image_data), 'image/png'))]
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 400:  # Should reject oversized image
                # Test oversized video (>100MB) - we'll simulate this with a smaller file but check the logic
                large_video_data = self.create_test_video(50)  # 50MB video (should pass)
                files = [('files', ('video.mp4', io.BytesIO(large_video_data), 'video/mp4'))]
                
                response = requests.post(
                    f"{self.base_url}/api/products/upload-media",
                    files=files,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 200:  # 50MB video should pass
                    self.log_test("Media Upload Size Limits", True, "File size limits correctly enforced")
                    return True
                else:
                    self.log_test("Media Upload Size Limits", False, f"50MB video should pass, got HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Media Upload Size Limits", False, f"Expected 400 for oversized image, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload Size Limits", False, "Request failed", str(e))
            return False
    
    def test_media_upload_count_limits(self):
        """Test file count limits (max 10 images, 1 video)"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Test with 11 images (should fail)
            files = []
            for i in range(11):
                image_data = self.create_test_image(1)
                files.append(('files', (f'image_{i}.png', io.BytesIO(image_data), 'image/png')))
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 400:  # Should reject >10 images
                # Test with 2 videos (should fail)
                files = [
                    ('files', ('video1.mp4', io.BytesIO(self.create_test_video(1)), 'video/mp4')),
                    ('files', ('video2.mp4', io.BytesIO(self.create_test_video(1)), 'video/mp4'))
                ]
                
                response = requests.post(
                    f"{self.base_url}/api/products/upload-media",
                    files=files,
                    headers=headers,
                    timeout=30
                )
                
                if response.status_code == 400:  # Should reject multiple videos
                    self.log_test("Media Upload Count Limits", True, "File count limits correctly enforced")
                    return True
                else:
                    self.log_test("Media Upload Count Limits", False, f"Expected 400 for multiple videos, got HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Media Upload Count Limits", False, f"Expected 400 for >10 images, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload Count Limits", False, "Request failed", str(e))
            return False
    
    def test_create_product_with_multimedia(self):
        """Test creating products with multimedia content"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # First upload some media
            image_data = self.create_test_image(1)
            video_data = self.create_test_video(2)
            
            files = [
                ('files', ('product_image.png', io.BytesIO(image_data), 'image/png')),
                ('files', ('product_video.mp4', io.BytesIO(video_data), 'video/mp4'))
            ]
            
            upload_response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if upload_response.status_code == 200:
                upload_data = upload_response.json()
                
                # Now create product with the uploaded media
                product_data = {
                    "name": "Multimedia Liberian Craft",
                    "description": "Beautiful craft with images and video",
                    "price": 75.99,
                    "category": "Arts & Crafts",
                    "images": upload_data["images"],
                    "video": upload_data["video"],
                    "stock": 5,
                    "tags": ["multimedia", "craft", "liberian"],
                    "weight": 1.2,
                    "dimensions": {"length": 25, "width": 20, "height": 15}
                }
                
                response = requests.post(
                    f"{self.base_url}/api/products",
                    json=product_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and 
                        data.get("product") and
                        data["product"]["images"] and
                        data["product"]["video"]):
                        self.product_id = data["product"]["id"]  # Update for other tests
                        self.log_test("Create Product with Multimedia", True, "Product with multimedia created successfully")
                        return True
                    else:
                        self.log_test("Create Product with Multimedia", False, "Invalid response format", data)
                        return False
                else:
                    self.log_test("Create Product with Multimedia", False, f"HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Create Product with Multimedia", False, f"Media upload failed: HTTP {upload_response.status_code}", upload_response.text)
                return False
        except Exception as e:
            self.log_test("Create Product with Multimedia", False, "Request failed", str(e))
            return False
    
    def test_get_product_with_multimedia(self):
        """Test retrieving products with multimedia content"""
        if not self.product_id:
            self.log_test("Get Product with Multimedia", False, "No product ID available", "Product creation may have failed")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/api/products/{self.product_id}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("product") and
                    data["product"].get("images") and
                    data["product"].get("video") and
                    all(img.startswith("data:image/") for img in data["product"]["images"]) and
                    data["product"]["video"].startswith("data:video/")):
                    self.log_test("Get Product with Multimedia", True, "Product with multimedia retrieved successfully")
                    return True
                else:
                    self.log_test("Get Product with Multimedia", False, "Multimedia content not properly formatted", data.get("product", {}))
                    return False
            else:
                self.log_test("Get Product with Multimedia", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Product with Multimedia", False, "Request failed", str(e))
            return False
    
    def test_media_upload_invalid_files(self):
        """Test media upload with non-image/video files"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Test with text file (should be ignored)
            text_data = b"This is a text file, not an image or video"
            files = [
                ('files', ('document.txt', io.BytesIO(text_data), 'text/plain')),
                ('files', ('valid_image.png', io.BytesIO(self.create_test_image(1)), 'image/png'))
            ]
            
            response = requests.post(
                f"{self.base_url}/api/products/upload-media",
                files=files,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                # Should only process the valid image, ignore the text file
                if (data.get("success") and 
                    len(data.get("images", [])) == 1 and
                    not data.get("video") and
                    len(data.get("uploaded_files", [])) == 1):
                    self.log_test("Media Upload Invalid Files", True, "Invalid file types correctly ignored")
                    return True
                else:
                    self.log_test("Media Upload Invalid Files", False, "Invalid files not handled correctly", data)
                    return False
            else:
                self.log_test("Media Upload Invalid Files", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Media Upload Invalid Files", False, "Request failed", str(e))
            return False
    
    # ==================== CHAT SYSTEM TESTS ====================
    
    def test_create_chat_between_users(self):
        """Test POST /api/chat/create endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            chat_data = {
                "recipient_id": self.seller_id,
                "product_id": self.product_id,
                "initial_message": "Hi, I'm interested in your Traditional Liberian Craft. Can you tell me more about it?"
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/create",
                json=chat_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("chat") and
                    data["chat"]["id"] and
                    len(data["chat"]["participants"]) == 2):
                    
                    self.chat_id = data["chat"]["id"]
                    self.log_test("Create Chat Between Users", True, f"Chat created successfully with ID: {self.chat_id}")
                    return True
                else:
                    self.log_test("Create Chat Between Users", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Chat Between Users", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Chat Between Users", False, "Request failed", str(e))
            return False
    
    def test_create_chat_without_product(self):
        """Test creating chat without product context"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            chat_data = {
                "recipient_id": self.buyer_id,
                "initial_message": "Hello! Thank you for your interest in our products."
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/create",
                json=chat_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("chat") and
                    data["chat"]["product_id"] is None):
                    self.log_test("Create Chat Without Product", True, "Chat created successfully without product context")
                    return True
                else:
                    self.log_test("Create Chat Without Product", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Chat Without Product", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Chat Without Product", False, "Request failed", str(e))
            return False
    
    def test_create_duplicate_chat(self):
        """Test that creating duplicate chat returns existing chat"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            chat_data = {
                "recipient_id": self.seller_id,
                "product_id": self.product_id,
                "initial_message": "This should return the existing chat"
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/create",
                json=chat_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("chat") and
                    data["chat"]["id"] == self.chat_id):
                    self.log_test("Create Duplicate Chat", True, "Existing chat returned instead of creating duplicate")
                    return True
                else:
                    self.log_test("Create Duplicate Chat", False, "New chat created instead of returning existing", data)
                    return False
            else:
                self.log_test("Create Duplicate Chat", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Duplicate Chat", False, "Request failed", str(e))
            return False
    
    def test_get_user_chat_list(self):
        """Test GET /api/chat/list endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/chat/list?page=1&limit=20",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("chats") is not None and
                    data.get("total_count") is not None and
                    data.get("unread_total") is not None and
                    len(data["chats"]) > 0):
                    
                    # Verify chat structure
                    chat = data["chats"][0]
                    if (chat.get("id") and 
                        chat.get("participants") and
                        len(chat["participants"]) == 2):
                        self.log_test("Get User Chat List", True, f"Retrieved {len(data['chats'])} chats with unread count: {data['unread_total']}")
                        return True
                    else:
                        self.log_test("Get User Chat List", False, "Invalid chat structure", chat)
                        return False
                else:
                    self.log_test("Get User Chat List", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get User Chat List", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get User Chat List", False, "Request failed", str(e))
            return False
    
    def test_send_text_message(self):
        """Test POST /api/chat/send-message endpoint with text message"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Send Text Message", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            message_data = {
                "chat_id": self.chat_id,
                "message_type": "text",
                "content": {
                    "text": "Thank you for your interest! This craft is handmade using traditional techniques passed down through generations. The price includes shipping to the USA."
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/send-message",
                json=message_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("message_data") and
                    data["message_data"]["id"] and
                    data["message_data"]["content"]["text"]):
                    
                    self.message_id = data["message_data"]["id"]
                    self.log_test("Send Text Message", True, "Text message sent successfully")
                    return True
                else:
                    self.log_test("Send Text Message", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Send Text Message", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Send Text Message", False, "Request failed", str(e))
            return False
    
    def test_send_reply_message(self):
        """Test sending a reply to a previous message"""
        if not hasattr(self, 'chat_id') or not self.chat_id or not hasattr(self, 'message_id') or not self.message_id:
            self.log_test("Send Reply Message", False, "No chat ID or message ID available", "Previous tests may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            message_data = {
                "chat_id": self.chat_id,
                "message_type": "text",
                "content": {
                    "text": "That sounds wonderful! What are the dimensions and weight for shipping calculation?"
                },
                "reply_to": self.message_id
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/send-message",
                json=message_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("message_data") and
                    data["message_data"]["reply_to"] == self.message_id):
                    self.log_test("Send Reply Message", True, "Reply message sent successfully")
                    return True
                else:
                    self.log_test("Send Reply Message", False, "Invalid response format or reply_to not set", data)
                    return False
            else:
                self.log_test("Send Reply Message", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Send Reply Message", False, "Request failed", str(e))
            return False
    
    def test_get_chat_messages(self):
        """Test GET /api/chat/{chat_id}/messages endpoint"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Get Chat Messages", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/chat/{self.chat_id}/messages?page=1&limit=50",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("messages") is not None and
                    data.get("chat_info") and
                    data.get("total_count") is not None and
                    len(data["messages"]) > 0):
                    
                    # Verify message structure and decryption
                    message = data["messages"][0]
                    if (message.get("id") and 
                        message.get("content") and
                        message["content"].get("text") and
                        not message["content"]["text"].startswith("gAAAAA")):  # Should be decrypted, not encrypted
                        self.log_test("Get Chat Messages", True, f"Retrieved {len(data['messages'])} messages, messages properly decrypted")
                        return True
                    else:
                        self.log_test("Get Chat Messages", False, "Messages not properly decrypted or invalid structure", message)
                        return False
                else:
                    self.log_test("Get Chat Messages", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Chat Messages", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Chat Messages", False, "Request failed", str(e))
            return False
    
    def test_mark_messages_read(self):
        """Test POST /api/chat/{chat_id}/mark-read endpoint"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Mark Messages Read", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.post(
                f"{self.base_url}/api/chat/{self.chat_id}/mark-read",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Mark Messages Read", True, "Messages marked as read successfully")
                    return True
                else:
                    self.log_test("Mark Messages Read", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Mark Messages Read", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Mark Messages Read", False, "Request failed", str(e))
            return False
    
    def test_verify_unread_count_update(self):
        """Test that unread count updates correctly after marking as read"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/chat/list?page=1&limit=20",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("chats") and 
                    len(data["chats"]) > 0 and
                    data.get("unread_total") == 0):  # Should be 0 after marking as read
                    self.log_test("Verify Unread Count Update", True, "Unread count correctly updated to 0 after marking as read")
                    return True
                else:
                    self.log_test("Verify Unread Count Update", False, f"Unread count not updated correctly: {data.get('unread_total')}", data)
                    return False
            else:
                self.log_test("Verify Unread Count Update", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Verify Unread Count Update", False, "Request failed", str(e))
            return False
    
    def test_chat_report_functionality(self):
        """Test POST /api/chat/report endpoint"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Chat Report Functionality", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            report_data = {
                "chat_id": self.chat_id,
                "reason": "spam",
                "description": "This user is sending inappropriate messages and spam content."
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/report",
                json=report_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("report_id")):
                    self.log_test("Chat Report Functionality", True, f"Chat reported successfully with report ID: {data['report_id']}")
                    return True
                else:
                    self.log_test("Chat Report Functionality", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Chat Report Functionality", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Chat Report Functionality", False, "Request failed", str(e))
            return False
    
    def test_get_online_users(self):
        """Test GET /api/chat/online-users endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/chat/online-users",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("online_users") is not None and
                    data.get("count") is not None):
                    self.log_test("Get Online Users", True, f"Retrieved {data['count']} online users")
                    return True
                else:
                    self.log_test("Get Online Users", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Online Users", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Online Users", False, "Request failed", str(e))
            return False
    
    def test_chat_access_control(self):
        """Test that users can only access their own chats"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Chat Access Control", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            # Create a third user to test access control
            third_user_data = {
                "firstName": "Alice",
                "lastName": "Wilson",
                "email": "alice.wilson@email.com",
                "password": "SecurePass789!",
                "userType": "buyer",
                "location": "Chicago, USA",
                "phone": "+1-555-0789"
            }
            
            register_response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=third_user_data,
                timeout=10
            )
            
            if register_response.status_code == 200:
                third_user_token = register_response.json()["token"]
                
                # Try to access chat with third user token (should fail)
                headers = {"Authorization": f"Bearer {third_user_token}"}
                response = requests.get(
                    f"{self.base_url}/api/chat/{self.chat_id}/messages",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 404:  # Should be denied access
                    self.log_test("Chat Access Control", True, "Users correctly blocked from accessing other users' chats")
                    return True
                else:
                    self.log_test("Chat Access Control", False, f"Expected 404, got HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Chat Access Control", False, "Failed to create third user for testing", register_response.text)
                return False
        except Exception as e:
            self.log_test("Chat Access Control", False, "Request failed", str(e))
            return False
    
    def test_message_encryption_in_database(self):
        """Test that messages are encrypted when stored (by checking raw response structure)"""
        if not hasattr(self, 'chat_id') or not self.chat_id:
            self.log_test("Message Encryption in Database", False, "No chat ID available", "Chat creation may have failed")
            return False
            
        try:
            # Send a test message with known content
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            test_message = "This is a test message for encryption verification"
            message_data = {
                "chat_id": self.chat_id,
                "message_type": "text",
                "content": {
                    "text": test_message
                }
            }
            
            send_response = requests.post(
                f"{self.base_url}/api/chat/send-message",
                json=message_data,
                headers=headers,
                timeout=10
            )
            
            if send_response.status_code == 200:
                # The fact that we get back decrypted content in the API response
                # while the service handles encryption/decryption indicates encryption is working
                data = send_response.json()
                if (data.get("success") and 
                    data.get("message_data") and
                    data["message_data"]["content"]["text"] == test_message and
                    data["message_data"]["is_encrypted"] == True):
                    self.log_test("Message Encryption in Database", True, "Messages are encrypted in storage (verified by is_encrypted flag)")
                    return True
                else:
                    self.log_test("Message Encryption in Database", False, "Encryption flag not set or message not properly handled", data)
                    return False
            else:
                self.log_test("Message Encryption in Database", False, f"Failed to send test message: HTTP {send_response.status_code}", send_response.text)
                return False
        except Exception as e:
            self.log_test("Message Encryption in Database", False, "Request failed", str(e))
            return False
    
    def test_chat_authentication_required(self):
        """Test that all chat endpoints require authentication"""
        try:
            # Test chat creation without auth
            chat_data = {
                "recipient_id": self.seller_id,
                "initial_message": "This should fail"
            }
            
            response = requests.post(
                f"{self.base_url}/api/chat/create",
                json=chat_data,
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                # Test chat list without auth
                response = requests.get(
                    f"{self.base_url}/api/chat/list",
                    timeout=10
                )
                
                if response.status_code == 403:
                    self.log_test("Chat Authentication Required", True, "All chat endpoints correctly require authentication")
                    return True
                else:
                    self.log_test("Chat Authentication Required", False, f"Chat list should require auth, got HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Chat Authentication Required", False, f"Chat creation should require auth, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Chat Authentication Required", False, "Request failed", str(e))
            return False
    
    # ==================== SELLER VERIFICATION API TESTS ====================
    
    def test_create_verification_profile(self):
        """Test POST /api/verification/profile - Create seller verification profile"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            profile_data = {
                "full_name": "Mary Johnson",
                "date_of_birth": "1985-03-15",
                "nationality": "Liberian",
                "national_id_number": "LR123456789",
                "business_name": "Johnson's Crafts & Textiles",
                "business_type": "sole_proprietorship",
                "business_registration_number": "BR2024001",
                "tax_identification_number": "TIN987654321",
                "physical_address": "123 Broad Street, Sinkor",
                "city": "Monrovia",
                "county": "Montserrado",
                "postal_code": "1000",
                "bank_name": "Liberia Bank for Development and Investment",
                "account_holder_name": "Mary Johnson",
                "account_number": "ACC123456789",
                "mobile_money_number": "+231-777-123456"
            }
            
            response = requests.post(
                f"{self.base_url}/api/verification/profile",
                json=profile_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("message"):
                    self.log_test("Create Verification Profile", True, "Seller verification profile created successfully")
                    return True
                else:
                    self.log_test("Create Verification Profile", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Verification Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Verification Profile", False, "Request failed", str(e))
            return False
    
    def test_get_verification_profile(self):
        """Test GET /api/verification/profile - Get seller verification profile"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(
                f"{self.base_url}/api/verification/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("profile") and
                    data["profile"]["full_name"] == "Mary Johnson" and
                    data["profile"]["verification_status"] in ["pending", "documents_required", "under_review", "approved", "rejected"] and
                    "counties" in data):
                    self.log_test("Get Verification Profile", True, f"Profile retrieved - Status: {data['profile']['verification_status']}")
                    return True
                else:
                    self.log_test("Get Verification Profile", False, "Invalid response format or missing data", data)
                    return False
            else:
                self.log_test("Get Verification Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Verification Profile", False, "Request failed", str(e))
            return False
    
    def test_upload_verification_document(self):
        """Test POST /api/verification/documents/upload - Upload verification document"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create a sample document (base64 encoded image)
            sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
            
            document_data = {
                "document_type": "national_id",
                "document_name": "National_ID_Mary_Johnson.png",
                "file_content": sample_image_b64,
                "file_type": "image/png",
                "file_size": len(sample_image_b64)
            }
            
            response = requests.post(
                f"{self.base_url}/api/verification/documents/upload",
                json=document_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("message") and
                    data.get("document_id")):
                    self.log_test("Upload Verification Document", True, f"National ID uploaded successfully - ID: {data['document_id']}")
                    return True
                else:
                    self.log_test("Upload Verification Document", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Upload Verification Document", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Upload Verification Document", False, "Request failed", str(e))
            return False
    
    def test_upload_utility_bill_document(self):
        """Test uploading utility bill document"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Create a sample utility bill document
            sample_pdf_b64 = "JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KeJzLSM3PyckBAAAGAAL//2Q9CmVuZHN0cmVhbQplbmRvYmoK"
            
            document_data = {
                "document_type": "utility_bill",
                "document_name": "Utility_Bill_Mary_Johnson.pdf",
                "file_content": sample_pdf_b64,
                "file_type": "application/pdf",
                "file_size": len(sample_pdf_b64)
            }
            
            response = requests.post(
                f"{self.base_url}/api/verification/documents/upload",
                json=document_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("message") and
                    data.get("document_id")):
                    self.log_test("Upload Utility Bill Document", True, f"Utility bill uploaded successfully - ID: {data['document_id']}")
                    return True
                else:
                    self.log_test("Upload Utility Bill Document", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Upload Utility Bill Document", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Upload Utility Bill Document", False, "Request failed", str(e))
            return False
    
    def test_get_verification_documents(self):
        """Test GET /api/verification/documents - Get verification documents"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(
                f"{self.base_url}/api/verification/documents",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "documents" in data and
                    len(data["documents"]) >= 2):  # Should have national_id and utility_bill
                    
                    # Verify document structure
                    doc = data["documents"][0]
                    if (doc.get("id") and 
                        doc.get("document_type") and
                        doc.get("document_name") and
                        doc.get("status") in ["pending", "approved", "rejected"]):
                        self.log_test("Get Verification Documents", True, f"Retrieved {len(data['documents'])} documents")
                        return True
                    else:
                        self.log_test("Get Verification Documents", False, "Invalid document structure", doc)
                        return False
                else:
                    self.log_test("Get Verification Documents", False, "Invalid response format or insufficient documents", data)
                    return False
            else:
                self.log_test("Get Verification Documents", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Verification Documents", False, "Request failed", str(e))
            return False
    
    def test_get_verification_status(self):
        """Test GET /api/verification/status - Get verification status"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            response = requests.get(
                f"{self.base_url}/api/verification/status",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("verification_status") and
                    data.get("verification_level") and
                    "progress_percentage" in data and
                    "required_documents" in data and
                    "uploaded_count" in data):
                    
                    status = data["verification_status"]
                    progress = data["progress_percentage"]
                    uploaded = data["uploaded_count"]
                    required = len(data["required_documents"])
                    
                    self.log_test("Get Verification Status", True, f"Status: {status}, Progress: {progress}%, Documents: {uploaded}/{required}")
                    return True
                else:
                    self.log_test("Get Verification Status", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Verification Status", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Verification Status", False, "Request failed", str(e))
            return False
    
    def test_get_verification_requirements(self):
        """Test GET /api/verification/requirements - Get verification requirements"""
        try:
            response = requests.get(
                f"{self.base_url}/api/verification/requirements",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("requirements") and
                    data.get("counties") and
                    data.get("document_types") and
                    "basic" in data["requirements"] and
                    "enhanced" in data["requirements"] and
                    "business" in data["requirements"]):
                    
                    basic_docs = len(data["requirements"]["basic"])
                    enhanced_docs = len(data["requirements"]["enhanced"])
                    business_docs = len(data["requirements"]["business"])
                    counties_count = len(data["counties"])
                    
                    self.log_test("Get Verification Requirements", True, f"Requirements loaded - Basic: {basic_docs}, Enhanced: {enhanced_docs}, Business: {business_docs} docs, {counties_count} counties")
                    return True
                else:
                    self.log_test("Get Verification Requirements", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Verification Requirements", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Verification Requirements", False, "Request failed", str(e))
            return False
    
    def test_verification_buyer_access_denied(self):
        """Test that buyers cannot access verification endpoints"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/verification/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403:  # Should be forbidden for buyers
                self.log_test("Verification Buyer Access Denied", True, "Buyers correctly blocked from verification endpoints")
                return True
            else:
                self.log_test("Verification Buyer Access Denied", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Verification Buyer Access Denied", False, "Request failed", str(e))
            return False
    
    def test_admin_get_all_verifications(self):
        """Test GET /api/admin/verifications - Admin get all verifications"""
        if not self.admin_token:
            self.log_test("Admin Get All Verifications", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/verifications?page=1&limit=10",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "verifications" in data and
                    "total_count" in data and
                    "pagination" in data):
                    
                    verification_count = len(data["verifications"])
                    total_count = data["total_count"]
                    
                    # Verify verification structure if any exist
                    if verification_count > 0:
                        verification = data["verifications"][0]
                        if (verification.get("id") and 
                            verification.get("seller") and
                            verification.get("verification_status") and
                            verification.get("verification_level")):
                            self.log_test("Admin Get All Verifications", True, f"Retrieved {verification_count}/{total_count} verifications")
                            return True
                        else:
                            self.log_test("Admin Get All Verifications", False, "Invalid verification structure", verification)
                            return False
                    else:
                        self.log_test("Admin Get All Verifications", True, f"No verifications found (total: {total_count})")
                        return True
                else:
                    self.log_test("Admin Get All Verifications", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Get All Verifications", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Get All Verifications", False, "Request failed", str(e))
            return False
    
    def test_admin_verification_stats(self):
        """Test GET /api/admin/verifications/stats - Admin verification statistics"""
        if not self.admin_token:
            self.log_test("Admin Verification Stats", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/verifications/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("stats") and
                    "total_applications" in data["stats"] and
                    "pending_review" in data["stats"] and
                    "approved" in data["stats"] and
                    "rejected" in data["stats"] and
                    "approval_rate" in data["stats"]):
                    
                    stats = data["stats"]
                    total = stats["total_applications"]
                    pending = stats["pending_review"]
                    approved = stats["approved"]
                    rejected = stats["rejected"]
                    approval_rate = stats["approval_rate"]
                    
                    self.log_test("Admin Verification Stats", True, f"Stats: {total} total, {pending} pending, {approved} approved, {rejected} rejected, {approval_rate}% approval rate")
                    return True
                else:
                    self.log_test("Admin Verification Stats", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Verification Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Verification Stats", False, "Request failed", str(e))
            return False

    # ==================== ADMIN API TESTS ====================
    
    def test_admin_login(self):
        """Test POST /api/admin/login - Admin authentication with default credentials"""
        try:
            login_data = {
                "email": "admin@liberia2usa.com",
                "password": "Admin@2025!"
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("token") and
                    data.get("admin") and
                    data["admin"].get("role") and
                    data["admin"].get("permissions")):
                    
                    self.admin_token = data["token"]
                    self.log_test("Admin Login", True, f"Admin login successful - Role: {data['admin']['role']}")
                    return True
                else:
                    self.log_test("Admin Login", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Login", False, "Request failed", str(e))
            return False
    
    def test_admin_me_endpoint(self):
        """Test GET /api/admin/me - Get current admin information"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Me Endpoint", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("admin") and
                    data["admin"].get("id") and
                    data["admin"].get("email") and
                    data["admin"].get("role") and
                    data["admin"].get("permissions")):
                    self.log_test("Admin Me Endpoint", True, f"Admin info retrieved - {data['admin']['firstName']} {data['admin']['lastName']}")
                    return True
                else:
                    self.log_test("Admin Me Endpoint", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Me Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Me Endpoint", False, "Request failed", str(e))
            return False
    
    def test_admin_dashboard_stats(self):
        """Test GET /api/admin/dashboard/stats - Get dashboard statistics"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Dashboard Stats", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/dashboard/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("stats") and
                    "total_users" in data["stats"] and
                    "total_products" in data["stats"] and
                    "total_transactions" in data["stats"]):
                    
                    stats = data["stats"]
                    self.log_test("Admin Dashboard Stats", True, 
                                f"Stats retrieved - Users: {stats['total_users']}, Products: {stats['total_products']}, Transactions: {stats['total_transactions']}")
                    return True
                else:
                    self.log_test("Admin Dashboard Stats", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Dashboard Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Dashboard Stats", False, "Request failed", str(e))
            return False
    
    def test_admin_get_users(self):
        """Test GET /api/admin/users - Get all users with pagination"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Get Users", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/users?page=1&limit=20",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "users" in data and
                    "pagination" in data and
                    data["pagination"].get("totalCount") is not None):
                    
                    user_count = len(data["users"])
                    total_count = data["pagination"]["totalCount"]
                    self.log_test("Admin Get Users", True, 
                                f"Retrieved {user_count} users (Total: {total_count}) with pagination")
                    return True
                else:
                    self.log_test("Admin Get Users", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Get Users", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Get Users", False, "Request failed", str(e))
            return False
    
    def test_admin_get_products(self):
        """Test GET /api/admin/products - Get all products for admin review"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Get Products", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/products?page=1&limit=20",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "products" in data and
                    "pagination" in data and
                    data["pagination"].get("totalCount") is not None):
                    
                    product_count = len(data["products"])
                    total_count = data["pagination"]["totalCount"]
                    self.log_test("Admin Get Products", True, 
                                f"Retrieved {product_count} products (Total: {total_count}) for admin review")
                    return True
                else:
                    self.log_test("Admin Get Products", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Get Products", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Get Products", False, "Request failed", str(e))
            return False
    
    def test_admin_get_activities(self):
        """Test GET /api/admin/activities - Get admin activity logs"""
        if not hasattr(self, 'admin_token') or not self.admin_token:
            self.log_test("Admin Get Activities", False, "No admin token available", "Admin login may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(
                f"{self.base_url}/api/admin/activities?page=1&limit=50",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "activities" in data and
                    "pagination" in data and
                    data["pagination"].get("totalCount") is not None):
                    
                    activity_count = len(data["activities"])
                    total_count = data["pagination"]["totalCount"]
                    self.log_test("Admin Get Activities", True, 
                                f"Retrieved {activity_count} activities (Total: {total_count}) from admin logs")
                    return True
                else:
                    self.log_test("Admin Get Activities", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Admin Get Activities", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Get Activities", False, "Request failed", str(e))
            return False
    
    def test_admin_authentication_required(self):
        """Test that admin endpoints require proper admin authentication"""
        try:
            # Test admin dashboard stats without authentication
            response = requests.get(
                f"{self.base_url}/api/admin/dashboard/stats",
                timeout=10
            )
            
            if response.status_code == 403:  # Should be forbidden without auth
                # Test with regular user token (should also fail)
                if hasattr(self, 'buyer_token') and self.buyer_token:
                    headers = {"Authorization": f"Bearer {self.buyer_token}"}
                    response = requests.get(
                        f"{self.base_url}/api/admin/dashboard/stats",
                        headers=headers,
                        timeout=10
                    )
                    
                    if response.status_code == 403:
                        self.log_test("Admin Authentication Required", True, "Admin endpoints correctly require admin authentication")
                        return True
                    else:
                        self.log_test("Admin Authentication Required", False, f"Regular user should be blocked, got HTTP {response.status_code}", response.text)
                        return False
                else:
                    self.log_test("Admin Authentication Required", True, "Admin endpoints correctly require authentication")
                    return True
            else:
                self.log_test("Admin Authentication Required", False, f"Expected 403 without auth, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Authentication Required", False, "Request failed", str(e))
            return False

    # ==================== PAYMENT API TESTS ====================
    
    def test_get_payment_packages(self):
        """Test GET /api/payments/packages endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/api/payments/packages",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "packages" in data and
                    len(data["packages"]) > 0):
                    
                    # Verify package structure
                    package = data["packages"][0]
                    if (package.get("package_id") and 
                        package.get("name") and
                        package.get("amount") and
                        package.get("currency") and
                        package.get("features")):
                        self.log_test("Get Payment Packages", True, f"Retrieved {len(data['packages'])} payment packages")
                        return True
                    else:
                        self.log_test("Get Payment Packages", False, "Invalid package structure", package)
                        return False
                else:
                    self.log_test("Get Payment Packages", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Payment Packages", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Payment Packages", False, "Request failed", str(e))
            return False
    
    def test_calculate_order_total(self):
        """Test POST /api/payments/calculate-total endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            cart_items = [
                {
                    "product_id": "test-product-1",
                    "product_name": "Traditional Liberian Craft",
                    "quantity": 2,
                    "unit_price": 45.99,
                    "total_price": 91.98,
                    "seller_id": self.seller_id or "test-seller-id",
                    "seller_name": "Mary Johnson"
                },
                {
                    "product_id": "test-product-2", 
                    "product_name": "Handmade Jewelry",
                    "quantity": 1,
                    "unit_price": 25.50,
                    "total_price": 25.50,
                    "seller_id": self.seller_id or "test-seller-id",
                    "seller_name": "Mary Johnson"
                }
            ]
            
            # Send as JSON body with shipping_cost as query parameter
            response = requests.post(
                f"{self.base_url}/api/payments/calculate-total?shipping_cost=15.00",
                json=cart_items,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "breakdown" in data and
                    data.get("currency") == "USD"):
                    
                    breakdown = data["breakdown"]
                    if (breakdown.get("subtotal") == 117.48 and  # 91.98 + 25.50
                        breakdown.get("shipping_cost") == 15.00 and
                        breakdown.get("tax_amount") and  # Should have tax calculated
                        breakdown.get("total_amount")):
                        self.log_test("Calculate Order Total", True, f"Order total calculated: ${breakdown['total_amount']}")
                        return True
                    else:
                        self.log_test("Calculate Order Total", False, "Invalid calculation breakdown", breakdown)
                        return False
                else:
                    self.log_test("Calculate Order Total", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Calculate Order Total", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Calculate Order Total", False, "Request failed", str(e))
            return False
    
    def test_calculate_total_requires_auth(self):
        """Test that calculate total requires authentication"""
        try:
            cart_items = [
                {
                    "product_id": "test-product-1",
                    "product_name": "Test Product",
                    "quantity": 1,
                    "unit_price": 10.00,
                    "total_price": 10.00,
                    "seller_id": "test-seller",
                    "seller_name": "Test Seller"
                }
            ]
            
            response = requests.post(
                f"{self.base_url}/api/payments/calculate-total?shipping_cost=5.00",
                json=cart_items,
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                self.log_test("Calculate Total Auth Required", True, "Calculate total correctly requires authentication")
                return True
            else:
                self.log_test("Calculate Total Auth Required", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Calculate Total Auth Required", False, "Request failed", str(e))
            return False
    
    def test_create_checkout_session(self):
        """Test POST /api/payments/checkout/session endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": self.product_id or "test-product-1",
                        "product_name": "Traditional Liberian Craft",
                        "quantity": 1,
                        "unit_price": 45.99,
                        "total_price": 45.99,
                        "seller_id": self.seller_id,
                        "seller_name": "Mary Johnson"
                    }
                ],
                "shipping_details": {
                    "carrier": "DHL",
                    "service": "Express",
                    "cost": 25.00,
                    "estimated_days": 3
                },
                "buyer_info": {
                    "name": "John Smith",
                    "email": "john.smith@email.com",
                    "address": "456 Broadway, New York, NY 10001"
                },
                "payment_method": "stripe",
                "origin_url": self.base_url
            }
            
            response = requests.post(
                f"{self.base_url}/api/payments/checkout/session",
                json=checkout_data,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("payment_id") and
                    data.get("checkout_url") and
                    data.get("session_id")):
                    self.log_test("Create Checkout Session", True, f"Checkout session created with ID: {data['session_id']}")
                    # Store session_id for status check test
                    self.checkout_session_id = data["session_id"]
                    return True
                else:
                    self.log_test("Create Checkout Session", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Checkout Session", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Checkout Session", False, "Request failed", str(e))
            return False
    
    def test_create_package_checkout(self):
        """Test POST /api/payments/package/checkout endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            response = requests.post(
                f"{self.base_url}/api/payments/package/checkout?package_id=express_shipping&origin_url={self.base_url}",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("payment_id") and
                    data.get("checkout_url") and
                    data.get("session_id")):
                    self.log_test("Create Package Checkout", True, f"Package checkout session created with ID: {data['session_id']}")
                    # Store session_id for status check test
                    self.package_session_id = data["session_id"]
                    return True
                else:
                    self.log_test("Create Package Checkout", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Create Package Checkout", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Package Checkout", False, "Request failed", str(e))
            return False
    
    def test_create_package_checkout_invalid_package(self):
        """Test package checkout with invalid package ID"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            response = requests.post(
                f"{self.base_url}/api/payments/package/checkout?package_id=invalid_package_id&origin_url={self.base_url}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 400:  # Should reject invalid package
                self.log_test("Package Checkout Invalid Package", True, "Invalid package ID correctly rejected")
                return True
            else:
                self.log_test("Package Checkout Invalid Package", False, f"Expected 400, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Package Checkout Invalid Package", False, "Request failed", str(e))
            return False
    
    def test_check_payment_status(self):
        """Test GET /api/payments/status/{session_id} endpoint"""
        if not hasattr(self, 'checkout_session_id') or not self.checkout_session_id:
            self.log_test("Check Payment Status", False, "No checkout session ID available", "Checkout session creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/payments/status/{self.checkout_session_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("payment_status") and
                    data.get("session_status") and
                    data.get("amount") and
                    data.get("currency")):
                    self.log_test("Check Payment Status", True, f"Payment status retrieved: {data['payment_status']}")
                    return True
                else:
                    self.log_test("Check Payment Status", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Check Payment Status", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Check Payment Status", False, "Request failed", str(e))
            return False
    
    def test_get_user_transactions(self):
        """Test GET /api/payments/transactions endpoint"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.get(
                f"{self.base_url}/api/payments/transactions?limit=10&skip=0",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "transactions" in data and
                    "total_count" in data and
                    "has_more" in data):
                    
                    # If we have transactions, verify structure
                    if len(data["transactions"]) > 0:
                        transaction = data["transactions"][0]
                        if (transaction.get("id") and 
                            transaction.get("amount") and
                            transaction.get("currency") and
                            transaction.get("payment_status")):
                            self.log_test("Get User Transactions", True, f"Retrieved {len(data['transactions'])} transactions")
                            return True
                        else:
                            self.log_test("Get User Transactions", False, "Invalid transaction structure", transaction)
                            return False
                    else:
                        self.log_test("Get User Transactions", True, "No transactions found (valid for new user)")
                        return True
                else:
                    self.log_test("Get User Transactions", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get User Transactions", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get User Transactions", False, "Request failed", str(e))
            return False
    
    def test_transactions_require_auth(self):
        """Test that transactions endpoint requires authentication"""
        try:
            response = requests.get(
                f"{self.base_url}/api/payments/transactions",
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                self.log_test("Transactions Auth Required", True, "Transactions endpoint correctly requires authentication")
                return True
            else:
                self.log_test("Transactions Auth Required", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Transactions Auth Required", False, "Request failed", str(e))
            return False
    
    def test_payment_status_access_control(self):
        """Test that users can only check their own payment status"""
        if not hasattr(self, 'checkout_session_id') or not self.checkout_session_id:
            self.log_test("Payment Status Access Control", False, "No checkout session ID available", "Checkout session creation may have failed")
            return False
            
        try:
            # Create a second user to test access control
            second_user_data = {
                "firstName": "Second",
                "lastName": "User",
                "email": "second.user.access.test@email.com",
                "password": "SecurePass789!",
                "userType": "buyer",
                "location": "Los Angeles, USA",
                "phone": "+1-555-0777"
            }
            
            # Register second user
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=second_user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                second_user_token = response.json()["token"]
            else:
                # Try to login if user already exists
                login_data = {"email": "second.user.access.test@email.com", "password": "SecurePass789!"}
                response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json=login_data,
                    timeout=10
                )
                if response.status_code == 200:
                    second_user_token = response.json()["token"]
                else:
                    self.log_test("Payment Status Access Control", False, "Failed to create/login second user", response.text)
                    return False
            
            # Try to access payment status with second user's token (should fail)
            headers = {"Authorization": f"Bearer {second_user_token}"}
            response = requests.get(
                f"{self.base_url}/api/payments/status/{self.checkout_session_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 404:  # Should be denied access
                self.log_test("Payment Status Access Control", True, "Users correctly blocked from accessing other users' payment status")
                return True
            else:
                self.log_test("Payment Status Access Control", False, f"Expected 404, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Payment Status Access Control", False, "Request failed", str(e))
            return False
    
    def test_checkout_requires_auth(self):
        """Test that checkout endpoints require authentication"""
        try:
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": "test-product",
                        "product_name": "Test Product",
                        "quantity": 1,
                        "unit_price": 10.00,
                        "total_price": 10.00,
                        "seller_id": "test-seller",
                        "seller_name": "Test Seller"
                    }
                ],
                "shipping_details": {
                    "carrier": "DHL",
                    "service": "Standard",
                    "cost": 10.00,
                    "estimated_days": 5
                },
                "buyer_info": {
                    "name": "Test User",
                    "email": "test@email.com",
                    "address": "Test Address"
                },
                "payment_method": "stripe",
                "origin_url": self.base_url
            }
            
            response = requests.post(
                f"{self.base_url}/api/payments/checkout/session",
                json=checkout_data,
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                self.log_test("Checkout Auth Required", True, "Checkout endpoints correctly require authentication")
                return True
            else:
                self.log_test("Checkout Auth Required", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Checkout Auth Required", False, "Request failed", str(e))
            return False

    # ==================== SHIPPING API TESTS ====================
    
    def test_get_shipping_carriers(self):
        """Test GET /api/shipping/carriers endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/api/shipping/carriers",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "carriers" in data and
                    len(data["carriers"]) == 4 and  # DHL, FedEx, UPS, Aramex
                    "dhl" in data["carriers"] and
                    "fedex" in data["carriers"] and
                    "ups" in data["carriers"] and
                    "aramex" in data["carriers"]):
                    self.log_test("Get Shipping Carriers", True, "All 4 carriers (DHL, FedEx, UPS, Aramex) returned with service details")
                    return True
                else:
                    self.log_test("Get Shipping Carriers", False, "Invalid response format or missing carriers", data)
                    return False
            else:
                self.log_test("Get Shipping Carriers", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Shipping Carriers", False, "Request failed", str(e))
            return False
    
    def test_get_shipping_zones(self):
        """Test GET /api/shipping/zones endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/api/shipping/zones",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "origin_zones" in data and
                    "destination_zones" in data and
                    data["origin_zones"]["country"] == "Liberia" and
                    data["destination_zones"]["country"] == "United States" and
                    len(data["destination_zones"]["states"]) == 51):  # 50 states + DC
                    self.log_test("Get Shipping Zones", True, "Shipping zones returned with Liberia origins and all US states")
                    return True
                else:
                    self.log_test("Get Shipping Zones", False, "Invalid response format or missing zones", data)
                    return False
            else:
                self.log_test("Get Shipping Zones", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Shipping Zones", False, "Request failed", str(e))
            return False
    
    def test_shipping_estimate_no_auth(self):
        """Test POST /api/shipping/estimate endpoint without authentication"""
        try:
            estimate_data = {
                "origin_city": "Monrovia",
                "destination_state": "New York",
                "weight": 2.5,
                "length": 30.0,
                "width": 20.0,
                "height": 15.0,
                "value": 150.0
            }
            
            # Use JSON data with the new request model
            response = requests.post(
                f"{self.base_url}/api/shipping/estimate",
                json=estimate_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "estimates" in data and
                    "customs_breakdown" in data and
                    len(data["estimates"]) >= 4):  # Should have rates from all 4 carriers
                    
                    # Verify each estimate has required fields
                    valid_estimates = True
                    for estimate in data["estimates"]:
                        if not all(key in estimate for key in ["carrier", "service", "shipping_cost", "customs_duties", "total_cost", "transit_days"]):
                            valid_estimates = False
                            break
                    
                    if valid_estimates:
                        self.log_test("Shipping Estimate (No Auth)", True, f"Got {len(data['estimates'])} shipping estimates with customs duties included")
                        return True
                    else:
                        self.log_test("Shipping Estimate (No Auth)", False, "Estimates missing required fields", data["estimates"])
                        return False
                else:
                    self.log_test("Shipping Estimate (No Auth)", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Shipping Estimate (No Auth)", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Estimate (No Auth)", False, "Request failed", str(e))
            return False
    
    def test_shipping_estimate_different_states(self):
        """Test shipping estimates to different US states"""
        try:
            states_to_test = ["California", "Texas", "Florida", "New York"]
            all_passed = True
            
            for state in states_to_test:
                estimate_data = {
                    "origin_city": "Monrovia",
                    "destination_state": state,
                    "weight": 1.0,
                    "length": 20.0,
                    "width": 15.0,
                    "height": 10.0,
                    "value": 100.0
                }
                
                response = requests.post(
                    f"{self.base_url}/api/shipping/estimate",
                    json=estimate_data,  # Use JSON data
                    timeout=10
                )
                
                if response.status_code != 200:
                    all_passed = False
                    break
                
                data = response.json()
                if not (data.get("success") and len(data.get("estimates", [])) >= 4):
                    all_passed = False
                    break
            
            if all_passed:
                self.log_test("Shipping Estimate Different States", True, f"Successfully got estimates for {len(states_to_test)} different US states")
                return True
            else:
                self.log_test("Shipping Estimate Different States", False, f"Failed to get estimates for all states")
                return False
        except Exception as e:
            self.log_test("Shipping Estimate Different States", False, "Request failed", str(e))
            return False
    
    def test_calculate_customs_duties(self):
        """Test POST /api/shipping/calculate-customs endpoint (requires auth)"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            packages_data = [
                {
                    "length": 30.0,
                    "width": 20.0,
                    "height": 15.0,
                    "weight": 2.0,
                    "value": 200.0,
                    "description": "Traditional Liberian craft item"
                },
                {
                    "length": 25.0,
                    "width": 15.0,
                    "height": 10.0,
                    "weight": 1.5,
                    "value": 150.0,
                    "description": "Handmade jewelry"
                }
            ]
            
            # Send packages as a list directly
            response = requests.post(
                f"{self.base_url}/api/shipping/calculate-customs",
                json=packages_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "customs_info" in data and
                    "disclaimer" in data):
                    
                    customs_info = data["customs_info"]
                    if (customs_info.get("declared_value") == 350.0 and  # 200 + 150
                        "estimated_duties" in customs_info and
                        "estimated_taxes" in customs_info and
                        "total_charges" in customs_info):
                        self.log_test("Calculate Customs Duties", True, f"Customs duties calculated: ${customs_info['total_charges']} total charges")
                        return True
                    else:
                        self.log_test("Calculate Customs Duties", False, "Invalid customs calculation", customs_info)
                        return False
                else:
                    self.log_test("Calculate Customs Duties", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Calculate Customs Duties", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Calculate Customs Duties", False, "Request failed", str(e))
            return False
    
    def test_calculate_customs_duties_no_auth(self):
        """Test that customs calculation requires authentication"""
        try:
            packages_data = [
                {
                    "length": 20.0,
                    "width": 15.0,
                    "height": 10.0,
                    "weight": 1.0,
                    "value": 100.0,
                    "description": "Test item"
                }
            ]
            
            response = requests.post(
                f"{self.base_url}/api/shipping/calculate-customs",
                json=packages_data,  # Send as list directly
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                self.log_test("Customs Calculation Auth Required", True, "Customs calculation correctly requires authentication")
                return True
            else:
                self.log_test("Customs Calculation Auth Required", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Customs Calculation Auth Required", False, "Request failed", str(e))
            return False
    
    def test_shipping_rates_full_request(self):
        """Test POST /api/shipping/rates with full shipping request (requires auth)"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            rate_request = {
                "origin": {
                    "name": "Mary Johnson",
                    "address_line_1": "123 Main Street",
                    "city": "Monrovia",
                    "state": "Montserrado",
                    "postal_code": "1000",
                    "country": "LR",
                    "phone": "+231-555-0456"
                },
                "destination": {
                    "name": "John Smith",
                    "address_line_1": "456 Broadway",
                    "city": "New York",
                    "state": "New York",
                    "postal_code": "10001",
                    "country": "US",
                    "phone": "+1-555-0123"
                },
                "packages": [
                    {
                        "length": 30.0,
                        "width": 20.0,
                        "height": 15.0,
                        "weight": 2.5,
                        "value": 250.0,
                        "description": "Traditional Liberian craft"
                    }
                ],
                "currency": "USD"
            }
            
            response = requests.post(
                f"{self.base_url}/api/shipping/rates",
                json=rate_request,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "rates" in data and
                    "request_id" in data and
                    "timestamp" in data and
                    len(data["rates"]) >= 4):  # Should have rates from all 4 carriers
                    
                    # Verify rate structure
                    valid_rates = True
                    carriers_found = set()
                    for rate in data["rates"]:
                        if not all(key in rate for key in ["carrier", "service", "service_name", "rate", "currency", "transit_days"]):
                            valid_rates = False
                            break
                        carriers_found.add(rate["carrier"])
                    
                    expected_carriers = {"dhl", "fedex", "ups", "aramex"}
                    if valid_rates and carriers_found == expected_carriers:
                        self.log_test("Shipping Rates Full Request", True, f"Got {len(data['rates'])} rates from all 4 carriers (DHL, FedEx, UPS, Aramex)")
                        return True
                    else:
                        self.log_test("Shipping Rates Full Request", False, f"Invalid rates or missing carriers. Found: {carriers_found}", data["rates"])
                        return False
                else:
                    self.log_test("Shipping Rates Full Request", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Shipping Rates Full Request", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Rates Full Request", False, "Request failed", str(e))
            return False
    
    def test_shipping_rates_multiple_packages(self):
        """Test shipping rates with multiple packages"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            rate_request = {
                "origin": {
                    "name": "Seller",
                    "address_line_1": "123 Main St",
                    "city": "Monrovia",
                    "state": "Montserrado",
                    "postal_code": "1000",
                    "country": "LR"
                },
                "destination": {
                    "name": "Buyer",
                    "address_line_1": "456 Oak Ave",
                    "city": "Los Angeles",
                    "state": "California",
                    "postal_code": "90210",
                    "country": "US"
                },
                "packages": [
                    {
                        "length": 25.0,
                        "width": 20.0,
                        "height": 15.0,
                        "weight": 1.5,
                        "value": 150.0,
                        "description": "Package 1"
                    },
                    {
                        "length": 30.0,
                        "width": 25.0,
                        "height": 20.0,
                        "weight": 2.0,
                        "value": 200.0,
                        "description": "Package 2"
                    },
                    {
                        "length": 20.0,
                        "width": 15.0,
                        "height": 10.0,
                        "weight": 1.0,
                        "value": 100.0,
                        "description": "Package 3"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/api/shipping/rates",
                json=rate_request,
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    len(data.get("rates", [])) >= 4):
                    
                    # Verify rates are calculated based on total weight (4.5kg)
                    total_weight = 4.5
                    rates_reasonable = True
                    for rate in data["rates"]:
                        # Rates should be higher for multiple packages
                        if rate["rate"] < (total_weight * 15):  # Minimum reasonable rate
                            rates_reasonable = False
                            break
                    
                    if rates_reasonable:
                        self.log_test("Shipping Rates Multiple Packages", True, f"Rates calculated correctly for 3 packages (total weight: {total_weight}kg)")
                        return True
                    else:
                        self.log_test("Shipping Rates Multiple Packages", False, "Rates seem unreasonably low for multiple packages", data["rates"])
                        return False
                else:
                    self.log_test("Shipping Rates Multiple Packages", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Shipping Rates Multiple Packages", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Rates Multiple Packages", False, "Request failed", str(e))
            return False
    
    def test_shipping_rates_origin_validation(self):
        """Test that shipping rates reject non-Liberia origins"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            rate_request = {
                "origin": {
                    "name": "Invalid Seller",
                    "address_line_1": "123 Main St",
                    "city": "Lagos",
                    "state": "Lagos",
                    "postal_code": "100001",
                    "country": "NG"  # Nigeria - should be rejected
                },
                "destination": {
                    "name": "Buyer",
                    "address_line_1": "456 Oak Ave",
                    "city": "New York",
                    "state": "New York",
                    "postal_code": "10001",
                    "country": "US"
                },
                "packages": [
                    {
                        "length": 20.0,
                        "width": 15.0,
                        "height": 10.0,
                        "weight": 1.0,
                        "value": 100.0,
                        "description": "Test package"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/api/shipping/rates",
                json=rate_request,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 400:  # Should reject non-Liberia origin
                self.log_test("Shipping Rates Origin Validation", True, "Non-Liberia origins correctly rejected")
                return True
            else:
                self.log_test("Shipping Rates Origin Validation", False, f"Expected 400 for non-Liberia origin, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Rates Origin Validation", False, "Request failed", str(e))
            return False
    
    def test_shipping_rates_destination_validation(self):
        """Test that shipping rates reject non-USA destinations"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            rate_request = {
                "origin": {
                    "name": "Seller",
                    "address_line_1": "123 Main St",
                    "city": "Monrovia",
                    "state": "Montserrado",
                    "postal_code": "1000",
                    "country": "LR"
                },
                "destination": {
                    "name": "Invalid Buyer",
                    "address_line_1": "456 Oak Ave",
                    "city": "Toronto",
                    "state": "Ontario",
                    "postal_code": "M5V 3A8",
                    "country": "CA"  # Canada - should be rejected
                },
                "packages": [
                    {
                        "length": 20.0,
                        "width": 15.0,
                        "height": 10.0,
                        "weight": 1.0,
                        "value": 100.0,
                        "description": "Test package"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/api/shipping/rates",
                json=rate_request,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 400:  # Should reject non-USA destination
                self.log_test("Shipping Rates Destination Validation", True, "Non-USA destinations correctly rejected")
                return True
            else:
                self.log_test("Shipping Rates Destination Validation", False, f"Expected 400 for non-USA destination, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Rates Destination Validation", False, "Request failed", str(e))
            return False
    
    def test_shipping_rates_no_auth(self):
        """Test that shipping rates require authentication"""
        try:
            rate_request = {
                "origin": {
                    "name": "Seller",
                    "address_line_1": "123 Main St",
                    "city": "Monrovia",
                    "state": "Montserrado",
                    "postal_code": "1000",
                    "country": "LR"
                },
                "destination": {
                    "name": "Buyer",
                    "address_line_1": "456 Oak Ave",
                    "city": "New York",
                    "state": "New York",
                    "postal_code": "10001",
                    "country": "US"
                },
                "packages": [
                    {
                        "length": 20.0,
                        "width": 15.0,
                        "height": 10.0,
                        "weight": 1.0,
                        "value": 100.0,
                        "description": "Test package"
                    }
                ]
            }
            
            response = requests.post(
                f"{self.base_url}/api/shipping/rates",
                json=rate_request,
                timeout=10
            )
            
            if response.status_code == 403:  # Should require authentication
                self.log_test("Shipping Rates Auth Required", True, "Shipping rates correctly require authentication")
                return True
            else:
                self.log_test("Shipping Rates Auth Required", False, f"Expected 403, got HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Shipping Rates Auth Required", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"\n🚀 Starting Backend API Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_health_endpoint,
            self.test_register_buyer,
            self.test_register_seller,
            self.test_location_validation,
            self.test_login_buyer,
            self.test_login_seller,
            self.test_auth_me_endpoint,
            self.test_user_profile_get,
            self.test_user_profile_update,
            self.test_get_sellers,
            self.test_create_product,
            self.test_get_products,
            self.test_get_products_with_filters,
            self.test_get_single_product,
            self.test_get_seller_products,
            self.test_buyer_cannot_create_product,
            self.test_unauthorized_access,
            # New multimedia upload tests
            self.test_media_upload_images,
            self.test_media_upload_video,
            self.test_media_upload_authentication,
            self.test_media_upload_size_limits,
            self.test_media_upload_count_limits,
            self.test_create_product_with_multimedia,
            self.test_get_product_with_multimedia,
            self.test_media_upload_invalid_files,
            # New shipping API tests
            self.test_get_shipping_carriers,
            self.test_get_shipping_zones,
            self.test_shipping_estimate_no_auth,
            self.test_shipping_estimate_different_states,
            self.test_calculate_customs_duties,
            self.test_calculate_customs_duties_no_auth,
            self.test_shipping_rates_full_request,
            self.test_shipping_rates_multiple_packages,
            self.test_shipping_rates_origin_validation,
            self.test_shipping_rates_destination_validation,
            self.test_shipping_rates_no_auth,
            # New chat system tests
            self.test_create_chat_between_users,
            self.test_create_chat_without_product,
            self.test_create_duplicate_chat,
            self.test_get_user_chat_list,
            self.test_send_text_message,
            self.test_send_reply_message,
            self.test_get_chat_messages,
            self.test_mark_messages_read,
            self.test_verify_unread_count_update,
            self.test_chat_report_functionality,
            self.test_get_online_users,
            self.test_chat_access_control,
            self.test_message_encryption_in_database,
            self.test_chat_authentication_required,
            # New admin API tests
            self.test_admin_login,
            self.test_admin_me_endpoint,
            self.test_admin_dashboard_stats,
            self.test_admin_get_users,
            self.test_admin_get_products,
            self.test_admin_get_activities,
            self.test_admin_authentication_required,
            # New seller verification API tests
            self.test_create_verification_profile,
            self.test_get_verification_profile,
            self.test_upload_verification_document,
            self.test_upload_utility_bill_document,
            self.test_get_verification_documents,
            self.test_get_verification_status,
            self.test_get_verification_requirements,
            self.test_verification_buyer_access_denied,
            self.test_admin_get_all_verifications,
            self.test_admin_verification_stats,
            # New payment API tests
            self.test_get_payment_packages,
            self.test_calculate_order_total,
            self.test_calculate_total_requires_auth,
            self.test_create_checkout_session,
            self.test_create_package_checkout,
            self.test_create_package_checkout_invalid_package,
            self.test_check_payment_status,
            self.test_get_user_transactions,
            self.test_transactions_require_auth,
            self.test_payment_status_access_control,
            self.test_checkout_requires_auth
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
        print("=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print("\n🎉 All tests passed! Backend API is working correctly.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        
        return failed == 0

def main():
    """Main function to run backend tests"""
    tester = BackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results to file
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed test results saved to: /app/backend_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())