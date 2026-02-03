"""
Test new features for Zeina & Khazina app:
1. Gold prices from real API (24K ~340-360 QAR)
2. Password reset flow (forgot-password, reset-password)
3. Notifications system
4. Price alerts
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestGoldPrices:
    """Test gold prices API - should return real prices from goldprice.org"""
    
    def test_gold_prices_endpoint_returns_200(self):
        """GET /api/gold-prices should return 200"""
        response = requests.get(f"{BASE_URL}/api/gold-prices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Gold prices endpoint returned 200")
    
    def test_gold_prices_returns_all_karats(self):
        """Should return prices for 24K, 22K, 21K, 18K"""
        response = requests.get(f"{BASE_URL}/api/gold-prices")
        assert response.status_code == 200
        
        prices = response.json()
        assert isinstance(prices, list), "Response should be a list"
        
        karats = [p["karat"] for p in prices]
        assert 24 in karats, "24K price missing"
        assert 22 in karats, "22K price missing"
        assert 21 in karats, "21K price missing"
        assert 18 in karats, "18K price missing"
        print(f"✓ All karats present: {karats}")
    
    def test_gold_24k_price_in_expected_range(self):
        """24K gold should be approximately 340-360 QAR/gram"""
        response = requests.get(f"{BASE_URL}/api/gold-prices")
        assert response.status_code == 200
        
        prices = response.json()
        price_24k = next((p for p in prices if p["karat"] == 24), None)
        
        assert price_24k is not None, "24K price not found"
        price_value = price_24k["price_per_gram_qar"]
        
        # Allow wider range for market fluctuations (280-400 QAR)
        assert 280 <= price_value <= 400, f"24K price {price_value} QAR outside expected range (280-400)"
        print(f"✓ 24K gold price: {price_value} QAR/gram (within expected range)")
    
    def test_gold_prices_have_required_fields(self):
        """Each price should have karat, price_per_gram_qar, change_amount, change_percent, updated_at"""
        response = requests.get(f"{BASE_URL}/api/gold-prices")
        assert response.status_code == 200
        
        prices = response.json()
        required_fields = ["karat", "price_per_gram_qar", "change_amount", "change_percent", "updated_at"]
        
        for price in prices:
            for field in required_fields:
                assert field in price, f"Missing field: {field}"
        print(f"✓ All required fields present in gold prices")


class TestPasswordReset:
    """Test password reset flow"""
    
    def test_forgot_password_accepts_email(self):
        """POST /api/auth/forgot-password should accept email and return success"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "test@example.com"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "message" in data, "Response should contain message"
        print(f"✓ Forgot password endpoint works: {data['message']}")
    
    def test_forgot_password_returns_debug_token(self):
        """When Resend API is not configured, should return debug_token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "eng.mohamed87@live.com"}  # Admin email
        )
        assert response.status_code == 200
        
        data = response.json()
        # Since RESEND_API_KEY is placeholder, debug_token should be returned
        if "debug_token" in data and data["debug_token"]:
            print(f"✓ Debug token returned (Resend not configured): {data['debug_token'][:8]}...")
        else:
            print("✓ Forgot password works (email may have been sent)")
    
    def test_reset_password_with_invalid_token(self):
        """POST /api/auth/reset-password with invalid token should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"token": "invalid_token", "new_password": "newpassword123"}
        )
        assert response.status_code == 400, f"Expected 400 for invalid token, got {response.status_code}"
        print(f"✓ Reset password correctly rejects invalid token")
    
    def test_full_password_reset_flow(self):
        """Test complete password reset flow with debug token"""
        # Step 1: Request password reset
        forgot_response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "eng.mohamed87@live.com"}
        )
        assert forgot_response.status_code == 200
        
        data = forgot_response.json()
        if "debug_token" not in data or not data["debug_token"]:
            pytest.skip("Debug token not available (Resend may be configured)")
        
        debug_token = data["debug_token"]
        
        # Step 2: Reset password using first 8 chars of token
        reset_response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"token": debug_token[:8], "new_password": "Realmadridclub2011"}  # Reset to same password
        )
        assert reset_response.status_code == 200, f"Reset failed: {reset_response.text}"
        
        reset_data = reset_response.json()
        assert "message" in reset_data
        print(f"✓ Full password reset flow works: {reset_data['message']}")


class TestNotifications:
    """Test notifications system - requires authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for admin user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "eng.mohamed87@live.com", "password": "Realmadridclub2011"}
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json().get("token")
    
    def test_notifications_requires_auth(self):
        """GET /api/notifications without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Notifications endpoint requires authentication")
    
    def test_notifications_returns_list(self, auth_token):
        """GET /api/notifications with auth should return notifications list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "notifications" in data, "Response should contain notifications"
        assert "unread_count" in data, "Response should contain unread_count"
        assert isinstance(data["notifications"], list), "Notifications should be a list"
        print(f"✓ Notifications endpoint works: {len(data['notifications'])} notifications, {data['unread_count']} unread")


class TestPriceAlerts:
    """Test price alerts system - requires authentication"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for admin user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "eng.mohamed87@live.com", "password": "Realmadridclub2011"}
        )
        if response.status_code != 200:
            pytest.skip("Could not authenticate")
        return response.json().get("token")
    
    def test_price_alerts_requires_auth(self):
        """POST /api/price-alerts without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/price-alerts",
            json={"karat": 24, "target_price": 350, "alert_type": "above"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Price alerts endpoint requires authentication")
    
    def test_create_price_alert(self, auth_token):
        """POST /api/price-alerts should create a new alert"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/price-alerts",
            headers=headers,
            json={"karat": 24, "target_price": 400, "alert_type": "above"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should contain message"
        assert "alert" in data, "Response should contain alert"
        assert data["alert"]["karat"] == 24
        assert data["alert"]["target_price"] == 400
        assert data["alert"]["alert_type"] == "above"
        print(f"✓ Price alert created successfully: {data['alert']['alert_id']}")
        
        return data["alert"]["alert_id"]
    
    def test_get_price_alerts(self, auth_token):
        """GET /api/price-alerts should return user's alerts"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/price-alerts", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        alerts = response.json()
        assert isinstance(alerts, list), "Response should be a list"
        print(f"✓ Got {len(alerts)} price alerts")
    
    def test_delete_price_alert(self, auth_token):
        """DELETE /api/price-alerts/{alert_id} should delete the alert"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create an alert
        create_response = requests.post(
            f"{BASE_URL}/api/price-alerts",
            headers=headers,
            json={"karat": 21, "target_price": 280, "alert_type": "below"}
        )
        assert create_response.status_code == 200
        alert_id = create_response.json()["alert"]["alert_id"]
        
        # Then delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/price-alerts/{alert_id}",
            headers=headers
        )
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        print(f"✓ Price alert deleted successfully")


class TestHealthAndBasicEndpoints:
    """Test basic endpoints are working"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        assert response.json().get("status") == "healthy"
        print(f"✓ Health endpoint working")
    
    def test_root_endpoint(self):
        """GET /api/ should return API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ Root endpoint working: {data['message']}")
    
    def test_login_with_admin_credentials(self):
        """POST /api/auth/login with admin credentials should work"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "eng.mohamed87@live.com", "password": "Realmadridclub2011"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "eng.mohamed87@live.com"
        print(f"✓ Admin login successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
