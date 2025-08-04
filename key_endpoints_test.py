#!/usr/bin/env python3
"""
Key Backend Endpoints Testing for Liberia2USA Express
Tests the key endpoints mentioned in the review request
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

class KeyEndpointsTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.admin_token = None
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
    
    def setup_authentication(self):
        """Setup authentication tokens for testing"""
        try:
            # Register and login buyer
            buyer_data = {
                "firstName": "TestBuyer",
                "lastName": "KeyTest",
                "email": f"testbuyer.key.{datetime.now().timestamp()}@email.com",
                "password": "SecurePass123!",
                "userType": "buyer",
                "location": "New York, USA",
                "phone": "+1-555-0123"
            }
            
            response = requests.post(f"{self.base_url}/api/auth/register", json=buyer_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.buyer_token = data.get("token")
                self.buyer_id = data.get("user", {}).get("id")
            
            # Register and login seller
            seller_data = {
                "firstName": "TestSeller",
                "lastName": "KeyTest",
                "email": f"testseller.key.{datetime.now().timestamp()}@email.com",
                "password": "SecurePass456!",
                "userType": "seller",
                "location": "Monrovia, Liberia",
                "phone": "+231-555-0456"
            }
            
            response = requests.post(f"{self.base_url}/api/auth/register", json=seller_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.seller_token = data.get("token")
                self.seller_id = data.get("user", {}).get("id")
            
            # Login admin
            admin_data = {
                "email": "admin@liberia2usa.com",
                "password": "Admin@2025!"
            }
            
            response = requests.post(f"{self.base_url}/api/admin/login", json=admin_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("token")
            
            return self.buyer_token and self.seller_token
        except Exception as e:
            print(f"Setup failed: {str(e)}")
            return False
    
    def test_product_endpoints(self):
        """Test product management endpoints (both authenticated and non-authenticated)"""
        try:
            # Test public product listing (no auth required)
            response = requests.get(f"{self.base_url}/api/products?page=1&limit=5", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    product_count = len(data["data"])
                    
                    # Test authenticated product listing
                    headers = {"Authorization": f"Bearer {self.buyer_token}"}
                    auth_response = requests.get(f"{self.base_url}/api/products?page=1&limit=5", headers=headers, timeout=10)
                    
                    if auth_response.status_code == 200:
                        auth_data = auth_response.json()
                        if auth_data.get("success") and "data" in auth_data:
                            # Test seller product creation
                            seller_headers = {"Authorization": f"Bearer {self.seller_token}"}
                            product_data = {
                                "name": "Test Product for Key Endpoints",
                                "description": "Testing product creation with authentication improvements",
                                "price": 29.99,
                                "category": "Test Category",
                                "stock": 10,
                                "tags": ["test", "authentication"],
                                "weight": 0.5,
                                "dimensions": {"length": 20, "width": 15, "height": 10}
                            }
                            
                            create_response = requests.post(
                                f"{self.base_url}/api/products",
                                json=product_data,
                                headers=seller_headers,
                                timeout=10
                            )
                            
                            if create_response.status_code == 200:
                                create_data = create_response.json()
                                if create_data.get("success") and create_data.get("product"):
                                    self.product_id = create_data["product"]["id"]
                                    self.log_test("Product Endpoints", True, f"Public listing ({product_count} products), authenticated listing, and seller creation all working")
                                    return True
                                else:
                                    self.log_test("Product Endpoints", False, "Product creation failed", create_data)
                                    return False
                            else:
                                self.log_test("Product Endpoints", False, f"Product creation HTTP {create_response.status_code}", create_response.text)
                                return False
                        else:
                            self.log_test("Product Endpoints", False, "Authenticated product listing failed", auth_data)
                            return False
                    else:
                        self.log_test("Product Endpoints", False, f"Authenticated listing HTTP {auth_response.status_code}", auth_response.text)
                        return False
                else:
                    self.log_test("Product Endpoints", False, "Public product listing failed", data)
                    return False
            else:
                self.log_test("Product Endpoints", False, f"Public listing HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Product Endpoints", False, "Request failed", str(e))
            return False
    
    def test_seller_specific_functionality(self):
        """Test seller-specific functionality"""
        try:
            if not self.seller_token:
                self.log_test("Seller Specific Functionality", False, "No seller token available", "Setup may have failed")
                return False
            
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            
            # Test seller products listing
            response = requests.get(
                f"{self.base_url}/api/products/seller/my-products?page=1&limit=10",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    product_count = len(data["data"])
                    
                    # Test buyer cannot access seller endpoints
                    buyer_headers = {"Authorization": f"Bearer {self.buyer_token}"}
                    buyer_response = requests.get(
                        f"{self.base_url}/api/products/seller/my-products?page=1&limit=10",
                        headers=buyer_headers,
                        timeout=10
                    )
                    
                    if buyer_response.status_code == 403:
                        self.log_test("Seller Specific Functionality", True, f"Seller can access products ({product_count} found), buyer properly blocked")
                        return True
                    else:
                        self.log_test("Seller Specific Functionality", False, f"Buyer should be blocked, got HTTP {buyer_response.status_code}", buyer_response.text)
                        return False
                else:
                    self.log_test("Seller Specific Functionality", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Seller Specific Functionality", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Specific Functionality", False, "Request failed", str(e))
            return False
    
    def test_payment_system(self):
        """Test payment system endpoints"""
        try:
            if not self.buyer_token:
                self.log_test("Payment System", False, "No buyer token available", "Setup may have failed")
                return False
            
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            # Test payment packages
            packages_response = requests.get(f"{self.base_url}/api/payments/packages", headers=headers, timeout=10)
            
            if packages_response.status_code == 200:
                packages_data = packages_response.json()
                if packages_data.get("success") and "packages" in packages_data:
                    package_count = len(packages_data["packages"])
                    
                    # Test order total calculation
                    calc_data = {
                        "cart_items": [
                            {
                                "product_id": "test-product-id",
                                "name": "Test Product",
                                "price": 25.99,
                                "quantity": 2,
                                "seller_id": "test-seller-id"
                            }
                        ]
                    }
                    
                    calc_response = requests.post(
                        f"{self.base_url}/api/payments/calculate-total?shipping_cost=15.00",
                        json=calc_data,
                        headers=headers,
                        timeout=10
                    )
                    
                    if calc_response.status_code == 200:
                        calc_result = calc_response.json()
                        if calc_result.get("success") and "total_amount" in calc_result:
                            # Test user transactions
                            transactions_response = requests.get(
                                f"{self.base_url}/api/payments/transactions?limit=10",
                                headers=headers,
                                timeout=10
                            )
                            
                            if transactions_response.status_code == 200:
                                trans_data = transactions_response.json()
                                if trans_data.get("success") and "transactions" in trans_data:
                                    trans_count = len(trans_data["transactions"])
                                    self.log_test("Payment System", True, f"Packages ({package_count}), calculation, and transactions ({trans_count}) all working")
                                    return True
                                else:
                                    self.log_test("Payment System", False, "Transactions endpoint failed", trans_data)
                                    return False
                            else:
                                self.log_test("Payment System", False, f"Transactions HTTP {transactions_response.status_code}", transactions_response.text)
                                return False
                        else:
                            self.log_test("Payment System", False, "Order calculation failed", calc_result)
                            return False
                    else:
                        self.log_test("Payment System", False, f"Calculation HTTP {calc_response.status_code}", calc_response.text)
                        return False
                else:
                    self.log_test("Payment System", False, "Packages endpoint failed", packages_data)
                    return False
            else:
                self.log_test("Payment System", False, f"Packages HTTP {packages_response.status_code}", packages_response.text)
                return False
        except Exception as e:
            self.log_test("Payment System", False, "Request failed", str(e))
            return False
    
    def test_shipping_system(self):
        """Test shipping system endpoints"""
        try:
            # Test public shipping endpoints (no auth required)
            carriers_response = requests.get(f"{self.base_url}/api/shipping/carriers", timeout=10)
            
            if carriers_response.status_code == 200:
                carriers_data = carriers_response.json()
                if carriers_data.get("success") and "carriers" in carriers_data:
                    carrier_count = len(carriers_data["carriers"])
                    
                    # Test shipping zones
                    zones_response = requests.get(f"{self.base_url}/api/shipping/zones", timeout=10)
                    
                    if zones_response.status_code == 200:
                        zones_data = zones_response.json()
                        if zones_data.get("success") and "zones" in zones_data:
                            # Test shipping estimate (no auth required)
                            estimate_data = {
                                "packages": [
                                    {
                                        "weight": 1.0,
                                        "dimensions": {"length": 20, "width": 15, "height": 10},
                                        "value": 50.00
                                    }
                                ],
                                "origin": {"country": "LR", "city": "Monrovia"},
                                "destination": {"country": "US", "state": "NY", "city": "New York"}
                            }
                            
                            estimate_response = requests.post(
                                f"{self.base_url}/api/shipping/estimate",
                                json=estimate_data,
                                timeout=10
                            )
                            
                            if estimate_response.status_code == 200:
                                estimate_result = estimate_response.json()
                                if estimate_result.get("success") and "rates" in estimate_result:
                                    rate_count = len(estimate_result["rates"])
                                    self.log_test("Shipping System", True, f"Carriers ({carrier_count}), zones, and estimates ({rate_count} rates) all working")
                                    return True
                                else:
                                    self.log_test("Shipping System", False, "Shipping estimate failed", estimate_result)
                                    return False
                            else:
                                self.log_test("Shipping System", False, f"Estimate HTTP {estimate_response.status_code}", estimate_response.text)
                                return False
                        else:
                            self.log_test("Shipping System", False, "Zones endpoint failed", zones_data)
                            return False
                    else:
                        self.log_test("Shipping System", False, f"Zones HTTP {zones_response.status_code}", zones_response.text)
                        return False
                else:
                    self.log_test("Shipping System", False, "Carriers endpoint failed", carriers_data)
                    return False
            else:
                self.log_test("Shipping System", False, f"Carriers HTTP {carriers_response.status_code}", carriers_response.text)
                return False
        except Exception as e:
            self.log_test("Shipping System", False, "Request failed", str(e))
            return False
    
    def test_admin_functionality(self):
        """Test admin functionality"""
        try:
            if not self.admin_token:
                self.log_test("Admin Functionality", False, "No admin token available", "Admin login may have failed")
                return False
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test admin dashboard stats
            stats_response = requests.get(f"{self.base_url}/api/admin/dashboard/stats", headers=headers, timeout=10)
            
            if stats_response.status_code == 200:
                stats_data = stats_response.json()
                if stats_data.get("success") and "stats" in stats_data:
                    stats = stats_data["stats"]
                    user_count = stats.get("total_users", 0)
                    product_count = stats.get("total_products", 0)
                    
                    # Test admin users endpoint
                    users_response = requests.get(
                        f"{self.base_url}/api/admin/users?page=1&limit=10",
                        headers=headers,
                        timeout=10
                    )
                    
                    if users_response.status_code == 200:
                        users_data = users_response.json()
                        if users_data.get("success") and "users" in users_data:
                            retrieved_users = len(users_data["users"])
                            
                            # Test regular user cannot access admin endpoints
                            buyer_headers = {"Authorization": f"Bearer {self.buyer_token}"}
                            unauthorized_response = requests.get(
                                f"{self.base_url}/api/admin/dashboard/stats",
                                headers=buyer_headers,
                                timeout=10
                            )
                            
                            if unauthorized_response.status_code == 403:
                                self.log_test("Admin Functionality", True, f"Stats ({user_count} users, {product_count} products), user management ({retrieved_users} users), and access control all working")
                                return True
                            else:
                                self.log_test("Admin Functionality", False, f"Regular user should be blocked, got HTTP {unauthorized_response.status_code}", unauthorized_response.text)
                                return False
                        else:
                            self.log_test("Admin Functionality", False, "Users endpoint failed", users_data)
                            return False
                    else:
                        self.log_test("Admin Functionality", False, f"Users HTTP {users_response.status_code}", users_response.text)
                        return False
                else:
                    self.log_test("Admin Functionality", False, "Stats endpoint failed", stats_data)
                    return False
            else:
                self.log_test("Admin Functionality", False, f"Stats HTTP {stats_response.status_code}", stats_response.text)
                return False
        except Exception as e:
            self.log_test("Admin Functionality", False, "Request failed", str(e))
            return False
    
    def test_user_status_and_profile(self):
        """Test user status and profile systems"""
        try:
            if not self.buyer_token:
                self.log_test("User Status and Profile", False, "No buyer token available", "Setup may have failed")
                return False
            
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            # Test user profile
            profile_response = requests.get(f"{self.base_url}/api/users/profile", headers=headers, timeout=10)
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                if profile_data.get("success") and "user" in profile_data:
                    # Test user status update
                    status_data = {"status": "online"}
                    status_response = requests.post(
                        f"{self.base_url}/api/user/status",
                        json=status_data,
                        headers=headers,
                        timeout=10
                    )
                    
                    if status_response.status_code == 200:
                        status_result = status_response.json()
                        if status_result.get("success"):
                            # Test get user status
                            get_status_response = requests.get(
                                f"{self.base_url}/api/user/status/{self.buyer_id}",
                                timeout=10
                            )
                            
                            if get_status_response.status_code == 200:
                                get_status_data = get_status_response.json()
                                if get_status_data.get("status") == "online":
                                    # Test online users list
                                    online_response = requests.get(f"{self.base_url}/api/user/online-users", timeout=10)
                                    
                                    if online_response.status_code == 200:
                                        online_data = online_response.json()
                                        if online_data.get("success") and "users" in online_data:
                                            online_count = len(online_data["users"])
                                            self.log_test("User Status and Profile", True, f"Profile, status updates, status retrieval, and online users ({online_count}) all working")
                                            return True
                                        else:
                                            self.log_test("User Status and Profile", False, "Online users failed", online_data)
                                            return False
                                    else:
                                        self.log_test("User Status and Profile", False, f"Online users HTTP {online_response.status_code}", online_response.text)
                                        return False
                                else:
                                    self.log_test("User Status and Profile", False, f"Status not updated correctly: {get_status_data.get('status')}", get_status_data)
                                    return False
                            else:
                                self.log_test("User Status and Profile", False, f"Get status HTTP {get_status_response.status_code}", get_status_response.text)
                                return False
                        else:
                            self.log_test("User Status and Profile", False, "Status update failed", status_result)
                            return False
                    else:
                        self.log_test("User Status and Profile", False, f"Status update HTTP {status_response.status_code}", status_response.text)
                        return False
                else:
                    self.log_test("User Status and Profile", False, "Profile endpoint failed", profile_data)
                    return False
            else:
                self.log_test("User Status and Profile", False, f"Profile HTTP {profile_response.status_code}", profile_response.text)
                return False
        except Exception as e:
            self.log_test("User Status and Profile", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all key endpoint tests"""
        print("🔧 Starting Key Backend Endpoints Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Setup authentication
        print("🔐 Setting up authentication...")
        if not self.setup_authentication():
            print("❌ Authentication setup failed. Cannot proceed with tests.")
            return 0, 1
        
        print("✅ Authentication setup completed")
        print()
        
        tests = [
            self.test_product_endpoints,
            self.test_seller_specific_functionality,
            self.test_payment_system,
            self.test_shipping_system,
            self.test_admin_functionality,
            self.test_user_status_and_profile
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
        print("📊 KEY ENDPOINTS TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        else:
            print("\n🎉 All key endpoint tests passed!")
        
        return passed, failed

if __name__ == "__main__":
    tester = KeyEndpointsTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if tests failed
    sys.exit(1 if failed > 0 else 0)