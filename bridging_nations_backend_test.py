#!/usr/bin/env python3
"""
Focused Backend Testing for Bridging Nations Frontend Integration
Tests specific areas mentioned in the review request
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

class BridgingNationsBackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
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
    
    def test_health_check_endpoint(self):
        """Test health check endpoint - Critical for Hostinger deployment"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK":
                    db_status = "connected" if data.get("database_connected") else "disconnected"
                    self.log_test("Health Check Endpoint", True, f"API running, database {db_status}")
                    return True
                else:
                    self.log_test("Health Check Endpoint", False, "Invalid health status", data)
                    return False
            else:
                self.log_test("Health Check Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check Endpoint", False, "Connection failed", str(e))
            return False
    
    def test_api_connectivity(self):
        """Test basic API connectivity via health endpoint"""
        try:
            # Test via health endpoint since root is served by frontend
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("message") and "Liberia2USA Express API" in data["message"]:
                    self.log_test("API Connectivity", True, "Backend API accessible and responding")
                    return True
                else:
                    self.log_test("API Connectivity", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("API Connectivity", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("API Connectivity", False, "Connection failed", str(e))
            return False
    
    def test_backend_server_status(self):
        """Test backend server status and configuration"""
        try:
            # Test debug endpoint
            response = requests.get(f"{self.base_url}/api/debug/network", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK" and data.get("cors_configured"):
                    self.log_test("Backend Server Status", True, "Server running with proper CORS configuration")
                    return True
                else:
                    self.log_test("Backend Server Status", False, "Server configuration issues", data)
                    return False
            else:
                self.log_test("Backend Server Status", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Backend Server Status", False, "Server status check failed", str(e))
            return False
    
    def test_readiness_probe(self):
        """Test Kubernetes readiness probe endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/ready", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "READY" and data.get("database_connected"):
                    self.log_test("Readiness Probe", True, "Application ready to serve requests")
                    return True
                else:
                    self.log_test("Readiness Probe", False, "Application not ready", data)
                    return False
            elif response.status_code == 503:
                self.log_test("Readiness Probe", False, "Database not connected", response.text)
                return False
            else:
                self.log_test("Readiness Probe", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Readiness Probe", False, "Readiness check failed", str(e))
            return False
    
    def test_navigation_route_handling(self):
        """Test that backend can handle frontend navigation requests"""
        routes_to_test = [
            ("/api/products", "Marketplace route"),
            ("/api/shipping/zones", "Shipping route"),
            ("/api/auth/login", "Login route"),
            ("/api/auth/register", "Register route")
        ]
        
        all_passed = True
        for route, description in routes_to_test:
            try:
                if route == "/api/auth/login" or route == "/api/auth/register":
                    # These are POST endpoints, test with OPTIONS for CORS
                    response = requests.options(f"{self.base_url}{route}", timeout=10)
                    expected_status = 200  # OPTIONS should return 200
                else:
                    # These are GET endpoints
                    response = requests.get(f"{self.base_url}{route}", timeout=10)
                    expected_status = 200  # GET should return 200
                
                if response.status_code == expected_status:
                    self.log_test(f"Navigation Route - {description}", True, f"Route {route} accessible")
                else:
                    self.log_test(f"Navigation Route - {description}", False, f"HTTP {response.status_code}", response.text[:200])
                    all_passed = False
            except Exception as e:
                self.log_test(f"Navigation Route - {description}", False, "Route test failed", str(e))
                all_passed = False
        
        return all_passed
    
    def test_frontend_backend_integration(self):
        """Test key endpoints that the Bridging Nations frontend will use"""
        integration_tests = [
            ("/api/products", "GET", "Product listing for marketplace"),
            ("/api/users/sellers", "GET", "Seller listing"),
            ("/api/shipping/zones", "GET", "Shipping zones"),
            ("/api/shipping/carriers", "GET", "Shipping carriers"),
            ("/api/payments/packages", "GET", "Payment packages")
        ]
        
        all_passed = True
        for endpoint, method, description in integration_tests:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                else:
                    response = requests.post(f"{self.base_url}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") is not False:  # Allow success=True or no success field
                        self.log_test(f"Frontend Integration - {description}", True, f"{endpoint} working correctly")
                    else:
                        self.log_test(f"Frontend Integration - {description}", False, "API returned success=false", data)
                        all_passed = False
                else:
                    self.log_test(f"Frontend Integration - {description}", False, f"HTTP {response.status_code}", response.text[:200])
                    all_passed = False
            except Exception as e:
                self.log_test(f"Frontend Integration - {description}", False, "Integration test failed", str(e))
                all_passed = False
        
        return all_passed
    
    def test_cors_configuration(self):
        """Test CORS configuration for frontend requests"""
        try:
            headers = {
                'Origin': 'https://e4816979-3661-47e6-8b76-f1266abdc0f3.preview.emergentagent.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = requests.options(f"{self.base_url}/api/auth/login", headers=headers, timeout=10)
            
            if response.status_code == 200:
                cors_headers = response.headers
                if ('Access-Control-Allow-Origin' in cors_headers and 
                    'Access-Control-Allow-Methods' in cors_headers):
                    self.log_test("CORS Configuration", True, "CORS properly configured for frontend requests")
                    return True
                else:
                    self.log_test("CORS Configuration", False, "Missing CORS headers", dict(cors_headers))
                    return False
            else:
                self.log_test("CORS Configuration", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("CORS Configuration", False, "CORS test failed", str(e))
            return False
    
    def test_authentication_endpoints(self):
        """Test authentication endpoints that frontend will use"""
        auth_tests = [
            ("POST", "/api/auth/register", {"firstName": "Test", "lastName": "User", "email": "test@example.com", "password": "Test123!", "userType": "buyer", "location": "New York, USA", "phone": "+1-555-0123"}),
            ("POST", "/api/auth/login", {"email": "test@example.com", "password": "Test123!"}),
        ]
        
        all_passed = True
        for method, endpoint, data in auth_tests:
            try:
                if method == "POST":
                    response = requests.post(f"{self.base_url}{endpoint}", json=data, timeout=10)
                
                # For registration, we might get 400 if email exists, which is OK
                # For login, we expect 200 or 401
                if response.status_code in [200, 400, 401]:
                    response_data = response.json()
                    if response.status_code == 200 and response_data.get("success"):
                        self.log_test(f"Auth Endpoint - {endpoint}", True, "Authentication endpoint working")
                    elif response.status_code == 400 and "already registered" in response_data.get("detail", ""):
                        self.log_test(f"Auth Endpoint - {endpoint}", True, "Authentication endpoint working (user exists)")
                    elif response.status_code == 401:
                        self.log_test(f"Auth Endpoint - {endpoint}", True, "Authentication endpoint working (invalid credentials)")
                    else:
                        self.log_test(f"Auth Endpoint - {endpoint}", False, f"Unexpected response", response_data)
                        all_passed = False
                else:
                    self.log_test(f"Auth Endpoint - {endpoint}", False, f"HTTP {response.status_code}", response.text[:200])
                    all_passed = False
            except Exception as e:
                self.log_test(f"Auth Endpoint - {endpoint}", False, "Auth test failed", str(e))
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Run all focused tests for Bridging Nations frontend integration"""
        print("🚀 Starting Bridging Nations Backend Integration Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        tests = [
            self.test_health_check_endpoint,
            self.test_api_connectivity,
            self.test_backend_server_status,
            self.test_readiness_probe,
            self.test_navigation_route_handling,
            self.test_frontend_backend_integration,
            self.test_cors_configuration,
            self.test_authentication_endpoints
        ]
        
        passed = 0
        total = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                total += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Test execution failed: {str(e)}")
                total += 1
        
        print("=" * 60)
        print("📊 BRIDGING NATIONS BACKEND TEST SUMMARY")
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Backend is ready for Bridging Nations frontend.")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the details above.")
        
        return passed == total

if __name__ == "__main__":
    tester = BridgingNationsBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)