#!/usr/bin/env python3
"""
Enhanced Dashboard Functionality Testing
Tests the new dashboard analytics and chunked upload features
"""

import requests
import json
import sys
import os

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

class EnhancedDashboardTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.test_results = []
    
    def log_test(self, test_name, passed, message, details=None):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not passed:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "details": details
        })
    
    def setup_authentication(self):
        """Setup authentication tokens"""
        print("🔐 Setting up authentication...")
        
        # Try to login as buyer
        buyer_login_data = {
            "email": "buyer@example.com",
            "password": "BuyerPass123!"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=buyer_login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("access_token"):
                    self.buyer_token = data["access_token"]
                    print("✅ Buyer authentication successful")
                else:
                    print("❌ Buyer login failed - invalid response format")
            else:
                print(f"❌ Buyer login failed - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Buyer login failed - {str(e)}")
        
        # Try to register and login a new seller
        seller_register_data = {
            "firstName": "Test",
            "lastName": "Seller",
            "email": "testseller@liberia.com",
            "password": "SellerPass123!",
            "userType": "seller",
            "location": "Monrovia, Liberia",
            "phone": "+231-555-0123"
        }
        
        try:
            # Register seller
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=seller_register_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("access_token"):
                    self.seller_token = data["access_token"]
                    print("✅ Seller registration and authentication successful")
                else:
                    print("❌ Seller registration failed - invalid response format")
            else:
                print(f"❌ Seller registration failed - HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Seller registration failed - {str(e)}")
    
    def test_buyer_analytics_comprehensive(self):
        """Test buyer analytics with all periods"""
        if not self.buyer_token:
            self.log_test("Buyer Analytics Comprehensive", False, "No buyer token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        periods = ["week", "month", "year"]
        
        for period in periods:
            try:
                response = requests.get(
                    f"{self.base_url}/api/dashboard/buyer/analytics?period={period}",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and 
                        data.get("period") == period and 
                        "analytics" in data and
                        "overview" in data["analytics"]):
                        
                        overview = data["analytics"]["overview"]
                        required_fields = ["total_spent", "total_orders", "avg_order_value"]
                        
                        if all(field in overview for field in required_fields):
                            self.log_test(f"Buyer Analytics ({period.title()})", True, 
                                        f"Analytics retrieved - Spent: ${overview['total_spent']}, Orders: {overview['total_orders']}")
                        else:
                            missing = [f for f in required_fields if f not in overview]
                            self.log_test(f"Buyer Analytics ({period.title()})", False, 
                                        f"Missing fields: {missing}", data)
                            return False
                    else:
                        self.log_test(f"Buyer Analytics ({period.title()})", False, 
                                    "Invalid response structure", data)
                        return False
                else:
                    self.log_test(f"Buyer Analytics ({period.title()})", False, 
                                f"HTTP {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test(f"Buyer Analytics ({period.title()})", False, 
                            "Request failed", str(e))
                return False
        
        self.log_test("Buyer Analytics Comprehensive", True, 
                    "All buyer analytics periods working correctly")
        return True
    
    def test_seller_analytics_if_available(self):
        """Test seller analytics if seller token is available"""
        if not self.seller_token:
            self.log_test("Seller Analytics", False, "No seller token available - seller authentication failed")
            return False
        
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/api/dashboard/seller/analytics?period=month",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "analytics" in data and
                    "overview" in data["analytics"]):
                    
                    overview = data["analytics"]["overview"]
                    self.log_test("Seller Analytics", True, 
                                f"Seller analytics working - Products: {overview.get('total_products', 0)}, Revenue: ${overview.get('total_revenue', 0)}")
                    return True
                else:
                    self.log_test("Seller Analytics", False, "Invalid response structure", data)
                    return False
            elif response.status_code == 403:
                self.log_test("Seller Analytics", False, "Access denied - seller authentication issue", response.text)
                return False
            else:
                self.log_test("Seller Analytics", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Seller Analytics", False, "Request failed", str(e))
            return False
    
    def test_product_management_if_available(self):
        """Test product management if seller token is available"""
        if not self.seller_token:
            self.log_test("Product Management", False, "No seller token available - seller authentication failed")
            return False
        
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/api/dashboard/products/management",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "products" in data and
                    "pagination" in data):
                    
                    products = data["products"]
                    pagination = data["pagination"]
                    
                    self.log_test("Product Management", True, 
                                f"Product management working - {len(products)} products, Total: {pagination.get('total', 0)}")
                    return True
                else:
                    self.log_test("Product Management", False, "Invalid response structure", data)
                    return False
            elif response.status_code == 403:
                self.log_test("Product Management", False, "Access denied - seller authentication issue", response.text)
                return False
            else:
                self.log_test("Product Management", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Product Management", False, "Request failed", str(e))
            return False
    
    def test_chunked_upload_authentication(self):
        """Test chunked upload authentication"""
        # Test without authentication
        try:
            test_data = b"test_chunk_data"
            files = {"file": ("test_chunk", test_data, "application/octet-stream")}
            data = {
                "chunk_index": 0,
                "total_chunks": 1,
                "file_hash": "test_hash",
                "filename": "test.png"
            }
            
            response = requests.post(
                f"{self.base_url}/api/upload/profile-picture-chunk",
                files=files,
                data=data,
                timeout=10
            )
            
            if response.status_code == 403:
                self.log_test("Chunked Upload Auth", True, "Unauthorized access correctly denied")
            else:
                self.log_test("Chunked Upload Auth", False, f"Expected 403, got {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Chunked Upload Auth", False, "Request failed", str(e))
            return False
        
        # Test with authentication if available
        if self.buyer_token:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            try:
                response = requests.post(
                    f"{self.base_url}/api/upload/profile-picture-chunk",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data_resp = response.json()
                    if data_resp.get("success"):
                        self.log_test("Chunked Upload With Auth", True, "Chunked upload working with authentication")
                    else:
                        self.log_test("Chunked Upload With Auth", False, "Invalid response", data_resp)
                        return False
                else:
                    self.log_test("Chunked Upload With Auth", False, f"HTTP {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test("Chunked Upload With Auth", False, "Request failed", str(e))
                return False
        
        return True
    
    def test_access_control(self):
        """Test access control for dashboard endpoints"""
        if not self.buyer_token:
            self.log_test("Access Control", False, "No buyer token available")
            return False
        
        # Test buyer trying to access seller analytics
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        
        try:
            response = requests.get(
                f"{self.base_url}/api/dashboard/seller/analytics",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403:
                self.log_test("Access Control", True, "Buyer correctly denied access to seller analytics")
                return True
            else:
                self.log_test("Access Control", False, f"Expected 403, got {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Access Control", False, "Request failed", str(e))
            return False
    
    def run_tests(self):
        """Run all enhanced dashboard tests"""
        print(f"\n🚀 Enhanced Dashboard Testing")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Setup authentication
        self.setup_authentication()
        print()
        
        # Run tests
        tests = [
            self.test_buyer_analytics_comprehensive,
            self.test_seller_analytics_if_available,
            self.test_product_management_if_available,
            self.test_chunked_upload_authentication,
            self.test_access_control
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
            print()
        
        # Summary
        print("=" * 60)
        print(f"📊 ENHANCED DASHBOARD TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print("\n🎉 All Enhanced Dashboard tests passed!")
        else:
            print(f"\n⚠️  {failed} test(s) failed.")
        
        return failed == 0

def main():
    """Main function"""
    tester = EnhancedDashboardTester()
    success = tester.run_tests()
    
    # Save results
    with open('/app/enhanced_dashboard_test_results.json', 'w') as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Results saved to: /app/enhanced_dashboard_test_results.json")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())