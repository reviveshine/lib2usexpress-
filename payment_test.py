#!/usr/bin/env python3
"""
Focused Payment API Testing for Liberia2USA Express
Tests all payment endpoints as requested in the review
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://c70051fd-5d81-4932-80e9-45f66884f42e.preview.emergentagent.com"

class PaymentTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.buyer_id = None
        self.seller_id = None
        self.product_id = None
        self.product_name = None
        self.product_price = None
        self.seller_id = None
        self.seller_name = None
        self.checkout_session_id = None
        self.package_session_id = None
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
    
    def setup_test_users(self):
        """Setup test users for payment testing"""
        print("🔧 Setting up test users...")
        
        # Register buyer
        buyer_data = {
            "firstName": "John",
            "lastName": "Smith",
            "email": f"john.payment.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@email.com",
            "password": "SecurePass123!",
            "userType": "buyer",
            "location": "New York, USA",
            "phone": "+1-555-0123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=buyer_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.buyer_token = data["token"]
                    self.buyer_id = data["user"]["id"]
                    print(f"✅ Buyer registered: {self.buyer_id}")
                else:
                    print(f"❌ Buyer registration failed: {data}")
                    return False
            else:
                print(f"❌ Buyer registration HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Buyer registration error: {e}")
            return False
        
        # Register seller
        seller_data = {
            "firstName": "Mary",
            "lastName": "Johnson",
            "email": f"mary.payment.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@email.com",
            "password": "SecurePass456!",
            "userType": "seller",
            "location": "Monrovia, Liberia",
            "phone": "+231-555-0456"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=seller_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.seller_token = data["token"]
                    self.seller_id = data["user"]["id"]
                    print(f"✅ Seller registered: {self.seller_id}")
                    return True
                else:
                    print(f"❌ Seller registration failed: {data}")
                    return False
            else:
                print(f"❌ Seller registration HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Seller registration error: {e}")
            return False
    
    def create_test_product(self):
        """Get an existing product for payment testing"""
        print("🛍️ Getting existing product for testing...")
        
        try:
            # Get existing products
            response = requests.get(f"{self.base_url}/api/products?limit=1", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data") and len(data["data"]) > 0:
                    product = data["data"][0]
                    self.product_id = product["id"]
                    self.product_name = product["name"]
                    self.product_price = product["price"]
                    self.seller_id = product["seller_id"]
                    self.seller_name = product["seller_name"]
                    print(f"✅ Using existing product: {self.product_id}")
                    return True
                else:
                    print(f"❌ No products available: {data}")
                    return False
            else:
                print(f"❌ Product fetch HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Product fetch error: {e}")
            return False
    
    def test_get_payment_packages(self):
        """Test GET /api/payments/packages - should return 3 payment packages"""
        try:
            response = requests.get(f"{self.base_url}/api/payments/packages", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "packages" in data and
                    len(data["packages"]) == 3):
                    
                    # Verify package structure
                    package = data["packages"][0]
                    if (package.get("package_id") and 
                        package.get("name") and
                        package.get("amount") and
                        package.get("currency") and
                        package.get("features")):
                        self.log_test("GET /api/payments/packages", True, f"Retrieved {len(data['packages'])} payment packages")
                        return True
                    else:
                        self.log_test("GET /api/payments/packages", False, "Invalid package structure", package)
                        return False
                else:
                    self.log_test("GET /api/payments/packages", False, "Invalid response format or wrong package count", data)
                    return False
            else:
                self.log_test("GET /api/payments/packages", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/payments/packages", False, "Request failed", str(e))
            return False
    
    def test_calculate_total(self):
        """Test POST /api/payments/calculate-total - should calculate order totals"""
        if not self.product_id:
            self.log_test("POST /api/payments/calculate-total", False, "No product ID available", "Product creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            cart_items = [
                {
                    "product_id": self.product_id,
                    "product_name": self.product_name,
                    "quantity": 2,
                    "unit_price": self.product_price,
                    "total_price": self.product_price * 2,
                    "seller_id": self.seller_id,
                    "seller_name": self.seller_name
                }
            ]
            
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
                    "subtotal" in data["breakdown"] and
                    "shipping_cost" in data["breakdown"] and
                    "tax_amount" in data["breakdown"] and
                    "total_amount" in data["breakdown"]):
                    self.log_test("POST /api/payments/calculate-total", True, f"Order total calculated: ${data['breakdown']['total_amount']}")
                    return True
                else:
                    self.log_test("POST /api/payments/calculate-total", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("POST /api/payments/calculate-total", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/payments/calculate-total", False, "Request failed", str(e))
            return False
    
    def test_create_checkout_session(self):
        """Test POST /api/payments/checkout/session - should create Stripe checkout sessions"""
        if not self.product_id:
            self.log_test("POST /api/payments/checkout/session", False, "No product ID available", "Product creation may have failed")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            checkout_data = {
                "cart_items": [
                    {
                        "product_id": self.product_id,
                        "product_name": self.product_name,
                        "quantity": 1,
                        "unit_price": self.product_price,
                        "total_price": self.product_price,
                        "seller_id": self.seller_id,
                        "seller_name": self.seller_name
                    }
                ],
                "shipping_details": {
                    "carrier": "DHL",
                    "service": "Express",
                    "cost": 25.0,
                    "estimated_days": 3
                },
                "buyer_info": {
                    "name": "John Smith",
                    "email": f"john.payment.test.{datetime.now().strftime('%Y%m%d%H%M%S')}@email.com",
                    "phone": "+1-555-0123"
                },
                "payment_method": "stripe",
                "origin_url": "https://example.com/checkout"
            }
            
            response = requests.post(
                f"{self.base_url}/api/payments/checkout/session",
                json=checkout_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "payment_id" in data and
                    "checkout_url" in data and
                    "session_id" in data):
                    self.checkout_session_id = data["session_id"]
                    self.log_test("POST /api/payments/checkout/session", True, f"Checkout session created: {data['session_id']}")
                    return True
                else:
                    self.log_test("POST /api/payments/checkout/session", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("POST /api/payments/checkout/session", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/payments/checkout/session", False, "Request failed", str(e))
            return False
    
    def test_get_transactions(self):
        """Test GET /api/payments/transactions - should return user payment history"""
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
                    self.log_test("GET /api/payments/transactions", True, f"Retrieved {len(data['transactions'])} transactions")
                    return True
                else:
                    self.log_test("GET /api/payments/transactions", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("GET /api/payments/transactions", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/payments/transactions", False, "Request failed", str(e))
            return False
    
    def test_package_checkout(self):
        """Test POST /api/payments/package/checkout - should create package checkout sessions"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            response = requests.post(
                f"{self.base_url}/api/payments/package/checkout?package_id=express_shipping&origin_url=https://example.com",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    "payment_id" in data and
                    "checkout_url" in data and
                    "session_id" in data):
                    self.package_session_id = data["session_id"]
                    self.log_test("POST /api/payments/package/checkout", True, f"Package checkout session created: {data['session_id']}")
                    return True
                else:
                    self.log_test("POST /api/payments/package/checkout", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("POST /api/payments/package/checkout", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/payments/package/checkout", False, "Request failed", str(e))
            return False
    
    def test_payment_status(self):
        """Test GET /api/payments/status/{session_id} - should retrieve payment status"""
        if not self.checkout_session_id:
            self.log_test("GET /api/payments/status/{session_id}", False, "No session ID available", "Checkout session creation may have failed")
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
                    "payment_status" in data and
                    "session_status" in data):
                    self.log_test("GET /api/payments/status/{session_id}", True, f"Payment status retrieved: {data['payment_status']}")
                    return True
                else:
                    self.log_test("GET /api/payments/status/{session_id}", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("GET /api/payments/status/{session_id}", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/payments/status/{session_id}", False, "Request failed", str(e))
            return False
    
    def test_authentication_and_authorization(self):
        """Test that payment endpoints enforce proper authentication and authorization"""
        print("\n🔐 Testing authentication and authorization...")
        
        # Test without authentication
        try:
            response = requests.get(f"{self.base_url}/api/payments/transactions", timeout=10)
            if response.status_code == 403:
                self.log_test("Payment Authentication", True, "Protected endpoints correctly require authentication")
            else:
                self.log_test("Payment Authentication", False, f"Expected 403, got HTTP {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Payment Authentication", False, "Request failed", str(e))
        
        # Test access control - user can only access their own data
        if self.checkout_session_id and self.seller_token:
            try:
                headers = {"Authorization": f"Bearer {self.seller_token}"}
                response = requests.get(
                    f"{self.base_url}/api/payments/status/{self.checkout_session_id}",
                    headers=headers,
                    timeout=10
                )
                if response.status_code in [403, 404]:  # Both are valid access control responses
                    self.log_test("Payment Access Control", True, "Users correctly blocked from accessing other users' payment data")
                else:
                    self.log_test("Payment Access Control", False, f"Expected 403/404, got HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Payment Access Control", False, "Request failed", str(e))
    
    def run_all_tests(self):
        """Run all payment API tests"""
        print("🚀 Starting Payment API Testing...")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Aborting tests.")
            return
        
        if not self.create_test_product():
            print("❌ Failed to get test product. Some tests may fail.")
        
        print("\n💳 Testing Payment API Endpoints...")
        print("-" * 40)
        
        # Run payment tests
        self.test_get_payment_packages()
        self.test_calculate_total()
        self.test_create_checkout_session()
        self.test_get_transactions()
        self.test_package_checkout()
        self.test_payment_status()
        self.test_authentication_and_authorization()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 PAYMENT API TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print(f"\n⚠️  {failed_tests} test(s) failed. Check the details above.")
        else:
            print("\n🎉 All payment API tests passed!")
        
        return success_rate >= 80

if __name__ == "__main__":
    tester = PaymentTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)