#!/usr/bin/env python3
"""
Verification API Testing for Liberia2USA Express
Tests only the seller verification endpoints as requested
"""

import requests
import json
import sys
import os
import base64
from datetime import datetime

# Get backend URL
BACKEND_URL = "http://localhost:8001"

class VerificationTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.buyer_token = None
        self.seller_token = None
        self.admin_token = None
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
    
    def setup_tokens(self):
        """Setup buyer, seller, and admin tokens for testing"""
        print("🔧 Setting up test tokens...")
        
        # Register and login buyer
        buyer_data = {
            "firstName": "John",
            "lastName": "Smith",
            "email": "john.smith.verification@email.com",
            "password": "SecurePass123!",
            "userType": "buyer",
            "location": "New York, USA",
            "phone": "+1-555-0123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=buyer_data, timeout=10)
            if response.status_code == 200:
                self.buyer_token = response.json()["token"]
                print("✅ Buyer token obtained")
            else:
                # Try login if already exists
                login_response = requests.post(f"{self.base_url}/api/auth/login", 
                                             json={"email": buyer_data["email"], "password": buyer_data["password"]}, 
                                             timeout=10)
                if login_response.status_code == 200:
                    self.buyer_token = login_response.json()["token"]
                    print("✅ Buyer token obtained (existing user)")
        except Exception as e:
            print(f"❌ Failed to get buyer token: {e}")
        
        # Register and login seller
        seller_data = {
            "firstName": "Mary",
            "lastName": "Johnson",
            "email": "mary.johnson.verification@email.com",
            "password": "SecurePass456!",
            "userType": "seller",
            "location": "Monrovia, Liberia",
            "phone": "+231-555-0456"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register", json=seller_data, timeout=10)
            if response.status_code == 200:
                self.seller_token = response.json()["token"]
                print("✅ Seller token obtained")
            else:
                # Try login if already exists
                login_response = requests.post(f"{self.base_url}/api/auth/login", 
                                             json={"email": seller_data["email"], "password": seller_data["password"]}, 
                                             timeout=10)
                if login_response.status_code == 200:
                    self.seller_token = login_response.json()["token"]
                    print("✅ Seller token obtained (existing user)")
        except Exception as e:
            print(f"❌ Failed to get seller token: {e}")
        
        # Login admin
        admin_data = {
            "email": "admin@liberia2usa.com",
            "password": "Admin@2025!"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/admin/login", json=admin_data, timeout=10)
            if response.status_code == 200:
                self.admin_token = response.json()["token"]
                print("✅ Admin token obtained")
        except Exception as e:
            print(f"❌ Failed to get admin token: {e}")
    
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
            
            # Create a proper base64 encoded PNG image (1x1 pixel)
            import base64
            png_bytes = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==")
            sample_image_b64 = base64.b64encode(png_bytes).decode('utf-8')
            
            document_data = {
                "document_type": "national_id",
                "document_name": "National_ID_Mary_Johnson.png",
                "file_content": sample_image_b64,
                "file_type": "image/png",
                "file_size": len(png_bytes)
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
            
            # Create a proper base64 encoded PDF
            import base64
            pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
            sample_pdf_b64 = base64.b64encode(pdf_content).decode('utf-8')
            
            document_data = {
                "document_type": "utility_bill",
                "document_name": "Utility_Bill_Mary_Johnson.pdf",
                "file_content": sample_pdf_b64,
                "file_type": "application/pdf",
                "file_size": len(pdf_content)
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
    
    def run_verification_tests(self):
        """Run all verification tests"""
        print(f"\n🚀 Starting Seller Verification API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Setup tokens first
        self.setup_tokens()
        print()
        
        # Test sequence
        tests = [
            self.test_get_verification_requirements,  # No auth required
            self.test_create_verification_profile,
            self.test_get_verification_profile,
            self.test_upload_verification_document,
            self.test_upload_utility_bill_document,
            self.test_get_verification_documents,
            self.test_get_verification_status,
            self.test_verification_buyer_access_denied,
            self.test_admin_get_all_verifications,
            self.test_admin_verification_stats,
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
        print(f"📊 VERIFICATION API TEST SUMMARY")
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed == 0:
            print("\n🎉 All verification tests passed! Verification API is working correctly.")
        else:
            print(f"\n⚠️  {failed} test(s) failed. Check the details above.")
        
        return failed == 0

def main():
    """Main function to run verification tests"""
    tester = VerificationTester()
    success = tester.run_verification_tests()
    
    # Save results
    with open('/app/verification_test_results.json', 'w') as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed test results saved to: /app/verification_test_results.json")
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()