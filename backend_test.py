#!/usr/bin/env python3
"""
Backend API Testing for Zeina & Khazina Gold Trading App
Tests all API endpoints using the public URL
"""

import requests
import sys
import json
from datetime import datetime

class ZeinaKhazinaAPITester:
    def __init__(self):
        self.base_url = "https://qatari-jewelry.preview.emergentagent.com/api"
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        self.run_test("API Root", "GET", "/", 200)
        self.run_test("Health Check", "GET", "/health", 200)

    def test_gold_prices(self):
        """Test gold prices endpoints"""
        print("\n🔍 Testing Gold Prices...")
        success, data = self.run_test("Get Gold Prices", "GET", "/gold-prices", 200)
        
        if success and data:
            # Verify price structure
            if isinstance(data, list) and len(data) > 0:
                price = data[0]
                required_fields = ['karat', 'price_per_gram_qar', 'change_amount', 'change_percent']
                has_all_fields = all(field in price for field in required_fields)
                self.log_test("Gold Prices Structure", has_all_fields, 
                            f"Fields present: {list(price.keys())}")
            else:
                self.log_test("Gold Prices Data", False, "Empty or invalid response")

    def test_products_endpoints(self):
        """Test products endpoints"""
        print("\n🔍 Testing Products...")
        
        # Test get all products
        success, products = self.run_test("Get All Products", "GET", "/products", 200)
        
        if success and products:
            # Test specific product types
            self.run_test("Get Jewelry Products", "GET", "/products?type=jewelry", 200)
            self.run_test("Get Investment Products", "GET", "/products?type=investment_bar", 200)
            self.run_test("Get Gift Products", "GET", "/products?type=gift", 200)
            self.run_test("Get Qatari Products", "GET", "/products?type=qatari", 200)
            
            # Test get specific product
            if len(products) > 0:
                product_id = products[0]['product_id']
                self.run_test("Get Specific Product", "GET", f"/products/{product_id}", 200)
            
            # Test non-existent product
            self.run_test("Get Non-existent Product", "GET", "/products/invalid_id", 404)

    def test_merchants_endpoint(self):
        """Test merchants endpoint"""
        print("\n🔍 Testing Merchants...")
        success, merchants = self.run_test("Get Merchants", "GET", "/merchants", 200)
        
        if success and merchants:
            if isinstance(merchants, list) and len(merchants) > 0:
                merchant = merchants[0]
                required_fields = ['merchant_id', 'name', 'logo_url']
                has_all_fields = all(field in merchant for field in required_fields)
                self.log_test("Merchants Structure", has_all_fields,
                            f"Fields present: {list(merchant.keys())}")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test admin login
        admin_data = {
            "email": "eng.mohamed87@live.com",
            "password": "Realmadridclub2011"
        }
        
        success, response = self.run_test("Admin Login", "POST", "/auth/login", 200, admin_data)
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.token = self.admin_token  # Use admin token for subsequent tests
            self.log_test("Admin Token Received", True, "Token obtained successfully")
            
            # Test get current user
            self.run_test("Get Current User", "GET", "/auth/me", 200)
        else:
            self.log_test("Admin Token Received", False, "No token in response")

        # Test invalid login
        invalid_data = {
            "email": "invalid@email.com",
            "password": "wrongpassword"
        }
        self.run_test("Invalid Login", "POST", "/auth/login", 401, invalid_data)

        # Test registration with new user
        test_user_data = {
            "name": "Test User",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPassword123!"
        }
        self.run_test("User Registration", "POST", "/auth/register", 200, test_user_data)

    def test_protected_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("\n⚠️ Skipping protected endpoints - no auth token")
            return
            
        print("\n🔍 Testing Protected Endpoints...")
        
        # Test wallet endpoints
        self.run_test("Get Wallet", "GET", "/wallet", 200)
        
        # Test cart endpoints
        self.run_test("Get Cart", "GET", "/cart", 200)
        
        # Test transactions
        self.run_test("Get Transactions", "GET", "/transactions", 200)
        
        # Test sharia acceptance
        self.run_test("Get Sharia Acceptance", "GET", "/sharia-acceptance", 200)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.admin_token:
            print("\n⚠️ Skipping admin endpoints - no admin token")
            return
            
        print("\n🔍 Testing Admin Endpoints...")
        
        # Ensure we're using admin token
        original_token = self.token
        self.token = self.admin_token
        
        # Test admin stats
        self.run_test("Admin Stats", "GET", "/admin/stats", 200)
        
        # Test admin orders
        self.run_test("Admin Get Orders", "GET", "/admin/orders", 200)
        
        # Test admin users
        self.run_test("Admin Get Users", "GET", "/admin/users", 200)
        
        # Restore original token
        self.token = original_token

    def test_cart_functionality(self):
        """Test cart operations"""
        if not self.token:
            print("\n⚠️ Skipping cart tests - no auth token")
            return
            
        print("\n🔍 Testing Cart Functionality...")
        
        # Get products first
        success, products = self.run_test("Get Products for Cart", "GET", "/products", 200)
        
        if success and products and len(products) > 0:
            product_id = products[0]['product_id']
            
            # Add to cart
            cart_item = {"product_id": product_id, "quantity": 1}
            self.run_test("Add to Cart", "POST", "/cart/add", 200, cart_item)
            
            # Get cart
            success, cart = self.run_test("Get Cart After Add", "GET", "/cart", 200)
            
            if success and cart.get('items'):
                # Update cart item
                update_item = {"product_id": product_id, "quantity": 2}
                self.run_test("Update Cart Item", "PUT", "/cart/update", 200, update_item)
                
                # Remove from cart
                self.run_test("Remove from Cart", "DELETE", f"/cart/remove/{product_id}", 200)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Zeina & Khazina API Tests...")
        print(f"📍 Testing against: {self.base_url}")
        
        # Run test suites
        self.test_health_endpoints()
        self.test_gold_prices()
        self.test_products_endpoints()
        self.test_merchants_endpoint()
        self.test_auth_endpoints()
        self.test_protected_endpoints()
        self.test_admin_endpoints()
        self.test_cart_functionality()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ZeinaKhazinaAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'tests_run': tester.tests_run,
                'tests_passed': tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0
            },
            'results': tester.test_results,
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())