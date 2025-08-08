#!/usr/bin/env python3
"""
Comprehensive Profile System Test
Tests all profile endpoints as requested in the review
"""

import requests
import json
import base64
from datetime import datetime, timedelta

BACKEND_URL = "https://9e2f71ee-c51a-4355-9095-21aac0960698.preview.emergentagent.com"

class ComprehensiveProfileTest:
    def __init__(self):
        self.buyer_token = None
        self.seller_token = None
        self.test_results = []
    
    def log_result(self, test_name, success, message):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        self.test_results.append({"test": test_name, "success": success, "message": message})
    
    def setup_users(self):
        """Setup test users"""
        print("🔧 Setting up test users...")
        
        # Login buyer
        login_data = {"email": "john.profilebuyer@email.com", "password": "SecurePass123!"}
        response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            self.buyer_token = response.json()["token"]
            print("✅ Buyer authenticated")
        else:
            print("❌ Buyer authentication failed")
            return False
        
        # Login seller
        login_data = {"email": "mary.profileseller@email.com", "password": "SecurePass456!"}
        response = requests.post(f"{BACKEND_URL}/api/auth/login", json=login_data, timeout=10)
        if response.status_code == 200:
            self.seller_token = response.json()["token"]
            print("✅ Seller authenticated")
        else:
            print("❌ Seller authentication failed")
            return False
        
        return True
    
    def test_1_get_profile_system_id(self):
        """1. GET /api/profile/profile - Test profile retrieval with system-generated user ID"""
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile/profile", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("success") and 
                data.get("profile") and
                data["profile"].get("system_user_id") and
                data["profile"]["system_user_id"].startswith("LIB2USA-") and
                len(data["profile"]["system_user_id"]) == 16):  # LIB2USA- + 8 chars
                
                self.buyer_system_id = data["profile"]["system_user_id"]
                self.log_result("Profile Retrieval with System ID", True, f"System ID format correct: {self.buyer_system_id}")
                return True
            else:
                self.log_result("Profile Retrieval with System ID", False, "Invalid system_user_id format")
                return False
        else:
            self.log_result("Profile Retrieval with System ID", False, f"HTTP {response.status_code}")
            return False
    
    def test_2_add_address_types(self):
        """2. POST /api/profile/profile/address - Test adding addresses with different types"""
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        
        # Test home address
        address_data = {
            "type": "home",
            "street": "123 Home Street",
            "city": "New York",
            "state": "NY", 
            "country": "USA",
            "postal_code": "10001"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/address", json=address_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            home_address_id = response.json()["address"]["id"]
            is_default = response.json()["address"]["is_default"]
            self.log_result("Add Home Address", True, f"Home address added (default: {is_default})")
        else:
            self.log_result("Add Home Address", False, f"HTTP {response.status_code}")
            return False
        
        # Test work address
        address_data = {
            "type": "work",
            "street": "456 Work Ave",
            "city": "Manhattan",
            "state": "NY",
            "country": "USA", 
            "postal_code": "10002"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/address", json=address_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            work_address_id = response.json()["address"]["id"]
            is_default = response.json()["address"]["is_default"]
            self.work_address_id = work_address_id
            self.log_result("Add Work Address", True, f"Work address added (default: {is_default})")
        else:
            self.log_result("Add Work Address", False, f"HTTP {response.status_code}")
            return False
        
        # Test other address
        address_data = {
            "type": "other",
            "street": "789 Other Blvd",
            "city": "Brooklyn",
            "state": "NY",
            "country": "USA",
            "postal_code": "11201"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/address", json=address_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Add Other Address", True, "Other address added successfully")
            return True
        else:
            self.log_result("Add Other Address", False, f"HTTP {response.status_code}")
            return False
    
    def test_3_add_seller_address_liberia(self):
        """3. Test seller address in Liberia"""
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        
        address_data = {
            "type": "home",
            "street": "15 Broad Street",
            "city": "Monrovia",
            "state": "Montserrado County",
            "country": "Liberia",
            "postal_code": "1000"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/address", json=address_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Add Seller Address (Liberia)", True, "Seller address in Liberia added successfully")
            return True
        else:
            self.log_result("Add Seller Address (Liberia)", False, f"HTTP {response.status_code}")
            return False
    
    def test_4_add_shipping_address(self):
        """4. POST /api/profile/profile/shipping-address - Test shipping address for buyers"""
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
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/shipping-address", json=shipping_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            data = response.json()
            if (data["address"]["recipient_name"] == "John ProfileBuyer" and
                data["address"]["phone"] == "+1-555-0789"):
                self.log_result("Add Shipping Address", True, "Shipping address with recipient and phone validation working")
                return True
            else:
                self.log_result("Add Shipping Address", False, "Missing recipient name or phone validation")
                return False
        else:
            self.log_result("Add Shipping Address", False, f"HTTP {response.status_code}")
            return False
    
    def test_5_add_mobile_wallets(self):
        """5. POST /api/profile/profile/mobile-wallet - Test different mobile money providers"""
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        
        # Test MTN wallet
        wallet_data = {
            "provider": "MTN",
            "phone_number": "+231-777-123456",
            "account_name": "Mary ProfileSeller"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/mobile-wallet", json=wallet_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            mtn_wallet_id = response.json()["wallet"]["id"]
            is_default = response.json()["wallet"]["is_default"]
            self.log_result("Add MTN Mobile Wallet", True, f"MTN wallet added (default: {is_default})")
        else:
            self.log_result("Add MTN Mobile Wallet", False, f"HTTP {response.status_code}")
            return False
        
        # Test Orange wallet
        wallet_data = {
            "provider": "Orange",
            "phone_number": "+231-888-654321",
            "account_name": "Mary ProfileSeller"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/mobile-wallet", json=wallet_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            orange_wallet_id = response.json()["wallet"]["id"]
            is_default = response.json()["wallet"]["is_default"]
            self.orange_wallet_id = orange_wallet_id
            self.log_result("Add Orange Mobile Wallet", True, f"Orange wallet added (default: {is_default})")
        else:
            self.log_result("Add Orange Mobile Wallet", False, f"HTTP {response.status_code}")
            return False
        
        # Test Lonestar wallet
        wallet_data = {
            "provider": "Lonestar",
            "phone_number": "+231-555-987654",
            "account_name": "Mary ProfileSeller"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/mobile-wallet", json=wallet_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Add Lonestar Mobile Wallet", True, "Lonestar wallet added successfully")
            return True
        else:
            self.log_result("Add Lonestar Mobile Wallet", False, f"HTTP {response.status_code}")
            return False
    
    def test_6_add_bank_account(self):
        """6. POST /api/profile/profile/bank-account - Test bank account validation"""
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        
        bank_data = {
            "bank_name": "Chase Bank",
            "account_number": "1234567890",
            "account_name": "John ProfileBuyer",
            "routing_number": "021000021"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/bank-account", json=bank_data, headers=headers, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            data = response.json()
            if (data["bank_account"]["bank_name"] == "Chase Bank" and
                data["bank_account"]["account_number"] == "1234567890" and
                data["bank_account"]["routing_number"] == "021000021"):
                self.log_result("Add Bank Account", True, "Bank account with validation working")
                return True
            else:
                self.log_result("Add Bank Account", False, "Bank account validation failed")
                return False
        else:
            self.log_result("Add Bank Account", False, f"HTTP {response.status_code}")
            return False
    
    def test_7_add_identity_documents(self):
        """7. POST /api/profile/profile/identity-document - Test different document types"""
        headers_buyer = {"Authorization": f"Bearer {self.buyer_token}"}
        headers_seller = {"Authorization": f"Bearer {self.seller_token}"}
        
        # Test passport for buyer
        test_image = base64.b64encode(b"fake_passport_image_data").decode('utf-8')
        expiry_date = (datetime.now() + timedelta(days=365*5)).isoformat()
        
        document_data = {
            "document_type": "passport",
            "document_number": "USA987654321",
            "issuing_authority": "U.S. Department of State",
            "expiry_date": expiry_date,
            "document_image": f"data:image/jpeg;base64,{test_image}"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/identity-document", json=document_data, headers=headers_buyer, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            data = response.json()
            if data["document"]["verification_status"] == "pending":
                self.log_result("Add Passport Document", True, "Passport uploaded with pending status")
            else:
                self.log_result("Add Passport Document", False, "Verification status not set to pending")
                return False
        else:
            self.log_result("Add Passport Document", False, f"HTTP {response.status_code}")
            return False
        
        # Test national ID for seller
        test_image = base64.b64encode(b"fake_national_id_image_data").decode('utf-8')
        
        document_data = {
            "document_type": "national_id",
            "document_number": "LIB123456789",
            "issuing_authority": "National Identification Registry of Liberia",
            "document_image": f"data:image/jpeg;base64,{test_image}"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/identity-document", json=document_data, headers=headers_seller, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            data = response.json()
            if data["document"]["verification_status"] == "pending":
                self.log_result("Add National ID Document", True, "National ID uploaded with pending status")
            else:
                self.log_result("Add National ID Document", False, "Verification status not set to pending")
                return False
        else:
            self.log_result("Add National ID Document", False, f"HTTP {response.status_code}")
            return False
        
        # Test driver's license for buyer
        document_data = {
            "document_type": "drivers_license",
            "document_number": "NY123456789",
            "issuing_authority": "New York State DMV",
            "document_image": f"data:image/jpeg;base64,{test_image}"
        }
        
        response = requests.post(f"{BACKEND_URL}/api/profile/profile/identity-document", json=document_data, headers=headers_buyer, timeout=10)
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Add Driver's License Document", True, "Driver's license uploaded successfully")
            return True
        else:
            self.log_result("Add Driver's License Document", False, f"HTTP {response.status_code}")
            return False
    
    def test_8_delete_address(self):
        """8. DELETE /api/profile/profile/address/{id} - Test deleting address"""
        if not hasattr(self, 'work_address_id'):
            self.log_result("Delete Address", False, "No work address ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        response = requests.delete(f"{BACKEND_URL}/api/profile/profile/address/{self.work_address_id}", headers=headers, timeout=10)
        
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Delete Address", True, "Address deleted successfully")
            return True
        else:
            self.log_result("Delete Address", False, f"HTTP {response.status_code}")
            return False
    
    def test_9_delete_mobile_wallet(self):
        """9. DELETE /api/profile/profile/mobile-wallet/{id} - Test deleting mobile wallet"""
        if not hasattr(self, 'orange_wallet_id'):
            self.log_result("Delete Mobile Wallet", False, "No Orange wallet ID available")
            return False
        
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        response = requests.delete(f"{BACKEND_URL}/api/profile/profile/mobile-wallet/{self.orange_wallet_id}", headers=headers, timeout=10)
        
        if response.status_code == 200 and response.json().get("success"):
            self.log_result("Delete Mobile Wallet", True, "Mobile wallet deleted successfully")
            return True
        else:
            self.log_result("Delete Mobile Wallet", False, f"HTTP {response.status_code}")
            return False
    
    def test_10_set_default_address(self):
        """10. PUT /api/profile/profile/address/{id}/default - Test setting default address"""
        # First get current addresses to find one to set as default
        headers = {"Authorization": f"Bearer {self.buyer_token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile/profile", headers=headers, timeout=10)
        
        if response.status_code == 200:
            addresses = response.json()["profile"]["addresses"]
            if addresses:
                address_id = addresses[0]["id"]
                
                response = requests.put(f"{BACKEND_URL}/api/profile/profile/address/{address_id}/default", headers=headers, timeout=10)
                if response.status_code == 200 and response.json().get("success"):
                    self.log_result("Set Default Address", True, "Default address updated successfully")
                    return True
                else:
                    self.log_result("Set Default Address", False, f"HTTP {response.status_code}")
                    return False
            else:
                self.log_result("Set Default Address", False, "No addresses available")
                return False
        else:
            self.log_result("Set Default Address", False, "Could not retrieve profile")
            return False
    
    def test_11_set_default_wallet(self):
        """11. PUT /api/profile/profile/mobile-wallet/{id}/default - Test setting default wallet"""
        # First get current wallets to find one to set as default
        headers = {"Authorization": f"Bearer {self.seller_token}"}
        response = requests.get(f"{BACKEND_URL}/api/profile/profile", headers=headers, timeout=10)
        
        if response.status_code == 200:
            wallets = response.json()["profile"]["mobile_money_wallets"]
            if wallets:
                wallet_id = wallets[0]["id"]
                
                response = requests.put(f"{BACKEND_URL}/api/profile/profile/mobile-wallet/{wallet_id}/default", headers=headers, timeout=10)
                if response.status_code == 200 and response.json().get("success"):
                    self.log_result("Set Default Wallet", True, "Default wallet updated successfully")
                    return True
                else:
                    self.log_result("Set Default Wallet", False, f"HTTP {response.status_code}")
                    return False
            else:
                self.log_result("Set Default Wallet", False, "No wallets available")
                return False
        else:
            self.log_result("Set Default Wallet", False, "Could not retrieve profile")
            return False
    
    def run_all_tests(self):
        """Run all comprehensive profile tests"""
        print(f"\n🚀 Comprehensive Profile System Testing")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 80)
        
        if not self.setup_users():
            print("❌ Failed to setup users")
            return
        
        tests = [
            self.test_1_get_profile_system_id,
            self.test_2_add_address_types,
            self.test_3_add_seller_address_liberia,
            self.test_4_add_shipping_address,
            self.test_5_add_mobile_wallets,
            self.test_6_add_bank_account,
            self.test_7_add_identity_documents,
            self.test_8_delete_address,
            self.test_9_delete_mobile_wallet,
            self.test_10_set_default_address,
            self.test_11_set_default_wallet
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
        print("=" * 80)
        print(f"📊 COMPREHENSIVE PROFILE TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print(f"\n🎉 All profile system tests passed! The comprehensive profile system is working correctly.")
        else:
            print(f"\n⚠️  {failed} test(s) failed.")
        
        return passed, failed

if __name__ == "__main__":
    tester = ComprehensiveProfileTest()
    tester.run_all_tests()