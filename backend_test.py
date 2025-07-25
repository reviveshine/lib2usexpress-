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
BACKEND_URL = "http://localhost:8001"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.buyer_id = None
        self.seller_id = None
        self.product_id = None
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
            self.test_media_upload_invalid_files
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