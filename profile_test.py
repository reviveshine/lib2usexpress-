#!/usr/bin/env python3
"""
Profile System Testing for Liberia2USA Express
Tests the comprehensive profile management system
"""

import requests
import json
import sys
import os
import base64
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

class ProfileTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.buyer_id = None
        self.seller_id = None
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
        """Setup test users for profile testing"""
        print("🔧 Setting up test users...")
        
        # Register buyer
        buyer_data = {
            "firstName": "John",
            "lastName": "ProfileBuyer",
            "email": "john.profilebuyer@email.com",
            "password": "SecurePass123!",
            "userType": "buyer",
            "location": "New York, USA",
            "phone": "+1-555-0123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=buyer_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.buyer_token = data["token"]
                self.buyer_id = data["user"]["id"]
                print(f"✅ Buyer registered: {self.buyer_id}")
            else:
                # Try to login if already exists
                login_data = {"email": buyer_data["email"], "password": buyer_data["password"]}
                response = requests.post(f"{self.base_url}/api/auth/login", json=login_data, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.buyer_token = data["token"]
                    # Get user ID
                    headers = {"Authorization": f"Bearer {self.buyer_token}"}
                    me_response = requests.get(f"{self.base_url}/api/auth/me", headers=headers, timeout=10)
                    if me_response.status_code == 200:
                        self.buyer_id = me_response.json()["user"]["id"]
                    print(f"✅ Buyer logged in: {self.buyer_id}")
        except Exception as e:
            print(f"❌ Failed to setup buyer: {e}")
            return False
        
        # Register seller
        seller_data = {
            "firstName": "Mary",
            "lastName": "ProfileSeller",
            "email": "mary.profileseller@email.com",
            "password": "SecurePass456!",
            "userType": "seller",
            "location": "Monrovia, Liberia",
            "phone": "+231-555-0456"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=seller_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.seller_token = data["token"]
                self.seller_id = data["user"]["id"]
                print(f"✅ Seller registered: {self.seller_id}")
            else:
                # Try to login if already exists
                login_data = {"email": seller_data["email"], "password": seller_data["password"]}
                response = requests.post(f"{self.base_url}/api/auth/login", json=login_data, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    self.seller_token = data["token"]
                    # Get user ID
                    headers = {"Authorization": f"Bearer {self.seller_token}"}
                    me_response = requests.get(f"{self.base_url}/api/auth/me", headers=headers, timeout=10)
                    if me_response.status_code == 200:
                        self.seller_id = me_response.json()["user"]["id"]
                    print(f"✅ Seller logged in: {self.seller_id}")
        except Exception as e:
            print(f"❌ Failed to setup seller: {e}")
            return False
        
        return self.buyer_token and self.seller_token
    
    def test_get_profile_creates_default(self):
        """Test GET /api/profile/profile - creates default profile with system-generated user ID"""
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
                    data.get("user") and
                    data["profile"].get("system_user_id") and
                    data["profile"]["system_user_id"].startswith("LIB2USA-")):
                    
                    # Store system_user_id for other tests
                    self.buyer_system_id = data["profile"]["system_user_id"]
                    self.log_test("Get Profile - Default Creation", True, f"Default profile created with system ID: {self.buyer_system_id}")
                    return True
                else:
                    self.log_test("Get Profile - Default Creation", False, "Invalid response format or missing system_user_id", data)
                    return False
            else:
                self.log_test("Get Profile - Default Creation", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Profile - Default Creation", False, "Request failed", str(e))
            return False
    
    def test_add_address_home(self):
        """Test POST /api/profile/profile/address - add home address"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            address_data = {
                "type": "home",
                "street": "123 Main Street",
                "city": "New York",
                "state": "NY",
                "country": "USA",
                "postal_code": "10001"
            }
            
            response = requests.post(
                f"{self.base_url}/api/profile/profile/address",
                json=address_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("address") and
                    data["address"]["id"] and
                    data["address"]["is_default"] == True):  # First address should be default
                    
                    self.buyer_address_id = data["address"]["id"]
                    self.log_test("Add Address - Home", True, f"Home address added successfully (ID: {self.buyer_address_id}, default: True)")
                    return True
                else:
                    self.log_test("Add Address - Home", False, "Invalid response format or not set as default", data)
                    return False
            else:
                self.log_test("Add Address - Home", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Address - Home", False, "Request failed", str(e))
            return False
    
    def test_add_shipping_address(self):
        """Test POST /api/profile/profile/shipping-address - add shipping address for buyer"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            shipping_data = {
                "recipient_name": "John ProfileBuyer",
                "street": "789 Delivery Lane",
                "city": "Brooklyn",
                "state": "NY",
                "country": "USA",
                "postal_code": "11201",
                "phone": "+1-555-0789"
            }
            
            response = requests.post(
                f"{self.base_url}/api/profile/profile/shipping-address",
                json=shipping_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("address") and
                    data["address"]["id"] and
                    data["address"]["recipient_name"] == "John ProfileBuyer" and
                    data["address"]["is_default"] == True):  # First shipping address should be default
                    
                    self.buyer_shipping_id = data["address"]["id"]
                    self.log_test("Add Shipping Address", True, f"Shipping address added successfully (ID: {self.buyer_shipping_id}, default: True)")
                    return True
                else:
                    self.log_test("Add Shipping Address", False, "Invalid response format or not set as default", data)
                    return False
            else:
                self.log_test("Add Shipping Address", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Shipping Address", False, "Request failed", str(e))
            return False
    
    def test_add_mobile_wallet_mtn(self):
        """Test POST /api/profile/profile/mobile-wallet - add MTN mobile wallet"""
        try:
            headers = {"Authorization": f"Bearer {self.seller_token}"}
            wallet_data = {
                "provider": "MTN",
                "phone_number": "+231-777-123456",
                "account_name": "Mary ProfileSeller"
            }
            
            response = requests.post(
                f"{self.base_url}/api/profile/profile/mobile-wallet",
                json=wallet_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("wallet") and
                    data["wallet"]["id"] and
                    data["wallet"]["provider"] == "MTN" and
                    data["wallet"]["is_default"] == True):  # First wallet should be default
                    
                    self.seller_wallet_id = data["wallet"]["id"]
                    self.log_test("Add Mobile Wallet - MTN", True, f"MTN wallet added successfully (ID: {self.seller_wallet_id}, default: True)")
                    return True
                else:
                    self.log_test("Add Mobile Wallet - MTN", False, "Invalid response format or not set as default", data)
                    return False
            else:
                self.log_test("Add Mobile Wallet - MTN", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Mobile Wallet - MTN", False, "Request failed", str(e))
            return False
    
    def test_add_bank_account(self):
        """Test POST /api/profile/profile/bank-account - add bank account"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            bank_data = {
                "bank_name": "Chase Bank",
                "account_number": "1234567890",
                "account_name": "John ProfileBuyer",
                "routing_number": "021000021"
            }
            
            response = requests.post(
                f"{self.base_url}/api/profile/profile/bank-account",
                json=bank_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("bank_account") and
                    data["bank_account"]["id"] and
                    data["bank_account"]["bank_name"] == "Chase Bank" and
                    data["bank_account"]["is_default"] == True):  # First bank account should be default
                    
                    self.buyer_bank_id = data["bank_account"]["id"]
                    self.log_test("Add Bank Account", True, f"Bank account added successfully (ID: {self.buyer_bank_id}, default: True)")
                    return True
                else:
                    self.log_test("Add Bank Account", False, "Invalid response format or not set as default", data)
                    return False
            else:
                self.log_test("Add Bank Account", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Bank Account", False, "Request failed", str(e))
            return False
    
    def test_add_identity_document_passport(self):
        """Test POST /api/profile/profile/identity-document - add passport"""
        try:
            headers = {"Authorization": f"Bearer {self.buyer_token}"}
            
            # Create a simple base64 encoded image for testing
            test_image = base64.b64encode(b"fake_passport_image_data").decode('utf-8')
            
            from datetime import datetime, timedelta
            expiry_date = (datetime.now() + timedelta(days=365*5)).isoformat()  # 5 years from now
            
            document_data = {
                "document_type": "passport",
                "document_number": "USA987654321",
                "issuing_authority": "U.S. Department of State",
                "expiry_date": expiry_date,
                "document_image": f"data:image/jpeg;base64,{test_image}"
            }
            
            response = requests.post(
                f"{self.base_url}/api/profile/profile/identity-document",
                json=document_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and 
                    data.get("document") and
                    data["document"]["id"] and
                    data["document"]["document_type"] == "passport" and
                    data["document"]["verification_status"] == "pending"):
                    
                    self.buyer_document_id = data["document"]["id"]
                    self.log_test("Add Identity Document - Passport", True, f"Passport uploaded successfully (ID: {self.buyer_document_id}, status: pending)")
                    return True
                else:
                    self.log_test("Add Identity Document - Passport", False, "Invalid response format or incorrect verification status", data)
                    return False
            else:
                self.log_test("Add Identity Document - Passport", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Identity Document - Passport", False, "Request failed", str(e))
            return False
    
    def test_get_complete_profile(self):
        """Test GET /api/profile/profile - verify complete profile with all data"""
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
                    data.get("user")):
                    
                    profile = data["profile"]
                    user = data["user"]
                    
                    # Verify system user ID format
                    if not (profile.get("system_user_id") and profile["system_user_id"].startswith("LIB2USA-")):
                        self.log_test("Get Complete Profile", False, "Invalid system_user_id format", profile.get("system_user_id"))
                        return False
                    
                    # Verify addresses
                    addresses = profile.get("addresses", [])
                    if len(addresses) < 1:
                        self.log_test("Get Complete Profile", False, f"Expected at least 1 address, found {len(addresses)}", addresses)
                        return False
                    
                    # Verify shipping addresses
                    shipping_addresses = profile.get("shipping_addresses", [])
                    if len(shipping_addresses) < 1:
                        self.log_test("Get Complete Profile", False, f"Expected at least 1 shipping address, found {len(shipping_addresses)}", shipping_addresses)
                        return False
                    
                    # Verify bank accounts
                    bank_accounts = profile.get("bank_accounts", [])
                    if len(bank_accounts) < 1:
                        self.log_test("Get Complete Profile", False, f"Expected at least 1 bank account, found {len(bank_accounts)}", bank_accounts)
                        return False
                    
                    # Verify identity documents
                    identity_docs = profile.get("identity_documents", [])
                    if len(identity_docs) < 1:
                        self.log_test("Get Complete Profile", False, f"Expected at least 1 identity document, found {len(identity_docs)}", identity_docs)
                        return False
                    
                    # Verify user info
                    if not (user.get("firstName") and user.get("lastName") and user.get("email")):
                        self.log_test("Get Complete Profile", False, "Missing user information", user)
                        return False
                    
                    self.log_test("Get Complete Profile", True, f"Complete profile retrieved successfully - System ID: {profile['system_user_id']}, Addresses: {len(addresses)}, Shipping: {len(shipping_addresses)}, Banks: {len(bank_accounts)}, Documents: {len(identity_docs)}")
                    return True
                else:
                    self.log_test("Get Complete Profile", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Complete Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Complete Profile", False, "Request failed", str(e))
            return False
    
    def run_profile_tests(self):
        """Run all profile system tests"""
        print(f"\n🚀 Starting Profile System Tests for Liberia2USA Express")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Setup test users
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Exiting.")
            return
        
        # Test sequence
        tests = [
            self.test_get_profile_creates_default,
            self.test_add_address_home,
            self.test_add_shipping_address,
            self.test_add_mobile_wallet_mtn,
            self.test_add_bank_account,
            self.test_add_identity_document_passport,
            self.test_get_complete_profile
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
        print(f"📊 PROFILE SYSTEM TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        else:
            print(f"\n🎉 All profile system tests passed!")
        
        return passed, failed

if __name__ == "__main__":
    tester = ProfileTester()
    passed, failed = tester.run_profile_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)