#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Liberia2USA Express
Tests all FastAPI endpoints with proper authentication and validation
"""

import requests
import json
import sys
import os
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
            self.test_unauthorized_access
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