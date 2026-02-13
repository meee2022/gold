"""
Gift Voucher API Tests - زينة وخزينة
Tests for digital gift voucher feature:
- POST /api/gifts/voucher - Create gift voucher
- GET /api/gifts/vouchers/sent - Get sent vouchers
- GET /api/gifts/voucher/{code} - Get voucher by code
- POST /api/gifts/voucher/{code}/redeem - Redeem voucher
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER_1 = {"email": "test@example.com", "password": "test12345"}
TEST_USER_2 = {"email": "fatima@example.com", "password": "fatima12345"}


class TestGiftVoucherSetup:
    """Setup tests - ensure users exist"""
    
    @pytest.fixture(scope="class")
    def session(self):
        return requests.Session()
    
    def test_register_test_user_1(self, session):
        """Register test user 1 if not exists"""
        # Try to login first
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code == 200:
            print("Test user 1 already exists")
            return
        
        # Register new user
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": TEST_USER_1["email"],
            "password": TEST_USER_1["password"]
        })
        assert response.status_code in [200, 400], f"Registration failed: {response.text}"
        print(f"Test user 1 registration: {response.status_code}")
    
    def test_register_test_user_2(self, session):
        """Register test user 2 if not exists"""
        # Try to login first
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        if response.status_code == 200:
            print("Test user 2 already exists")
            return
        
        # Register new user
        response = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Fatima Test",
            "email": TEST_USER_2["email"],
            "password": TEST_USER_2["password"]
        })
        assert response.status_code in [200, 400], f"Registration failed: {response.text}"
        print(f"Test user 2 registration: {response.status_code}")


class TestCreateGiftVoucher:
    """Tests for POST /api/gifts/voucher"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Get authenticated session for test user 1"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code != 200:
            # Try to register
            session.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Test User",
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            })
            response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_create_voucher_success(self, auth_session):
        """Test creating a valid gift voucher"""
        payload = {
            "recipient_name": "محمد أحمد",
            "whatsapp_number": "+97412345678",
            "amount_qar": 100.0,
            "message": "هدية عيد ميلاد سعيد!",
            "validity_days": 30
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 200, f"Create voucher failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "voucher" in data
        assert "voucher_code" in data["voucher"]
        assert "voucher_id" in data["voucher"]
        assert data["voucher"]["recipient_name"] == payload["recipient_name"]
        assert data["voucher"]["amount_qar"] == payload["amount_qar"]
        
        # Voucher code should start with ZK
        assert data["voucher"]["voucher_code"].startswith("ZK")
        print(f"Created voucher: {data['voucher']['voucher_code']}")
    
    def test_create_voucher_minimum_amount(self, auth_session):
        """Test creating voucher with minimum amount (50 QAR)"""
        payload = {
            "recipient_name": "Test Min",
            "whatsapp_number": "+97400000001",
            "amount_qar": 50.0,
            "message": "",
            "validity_days": 7
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 200, f"Min amount voucher failed: {response.text}"
        data = response.json()
        assert data["voucher"]["amount_qar"] == 50.0
        print("Minimum amount (50 QAR) voucher created successfully")
    
    def test_create_voucher_below_minimum_fails(self, auth_session):
        """Test that voucher below 50 QAR fails"""
        payload = {
            "recipient_name": "Test Below Min",
            "whatsapp_number": "+97400000002",
            "amount_qar": 49.0,
            "message": "",
            "validity_days": 30
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 400, f"Expected 400 for below minimum, got {response.status_code}"
        data = response.json()
        assert "50" in data.get("detail", ""), "Error should mention minimum amount"
        print("Below minimum amount correctly rejected")
    
    def test_create_voucher_maximum_amount(self, auth_session):
        """Test creating voucher with maximum amount (50,000 QAR)"""
        payload = {
            "recipient_name": "Test Max",
            "whatsapp_number": "+97400000003",
            "amount_qar": 50000.0,
            "message": "هدية كبيرة",
            "validity_days": 90
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 200, f"Max amount voucher failed: {response.text}"
        data = response.json()
        assert data["voucher"]["amount_qar"] == 50000.0
        print("Maximum amount (50,000 QAR) voucher created successfully")
    
    def test_create_voucher_above_maximum_fails(self, auth_session):
        """Test that voucher above 50,000 QAR fails"""
        payload = {
            "recipient_name": "Test Above Max",
            "whatsapp_number": "+97400000004",
            "amount_qar": 50001.0,
            "message": "",
            "validity_days": 30
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 400, f"Expected 400 for above maximum, got {response.status_code}"
        data = response.json()
        assert "50,000" in data.get("detail", "") or "50000" in data.get("detail", ""), "Error should mention maximum amount"
        print("Above maximum amount correctly rejected")
    
    def test_create_voucher_without_auth_fails(self):
        """Test that creating voucher without authentication fails"""
        session = requests.Session()
        payload = {
            "recipient_name": "Test No Auth",
            "whatsapp_number": "+97400000005",
            "amount_qar": 100.0,
            "message": "",
            "validity_days": 30
        }
        
        response = session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated, got {response.status_code}"
        print("Unauthenticated request correctly rejected")


class TestGetSentVouchers:
    """Tests for GET /api/gifts/vouchers/sent"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Get authenticated session for test user 1"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code != 200:
            session.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Test User",
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            })
            response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_get_sent_vouchers(self, auth_session):
        """Test getting list of sent vouchers"""
        response = auth_session.get(f"{BASE_URL}/api/gifts/vouchers/sent")
        
        assert response.status_code == 200, f"Get sent vouchers failed: {response.text}"
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list), "Response should be a list"
        
        # If there are vouchers, validate structure
        if len(data) > 0:
            voucher = data[0]
            assert "voucher_code" in voucher
            assert "recipient_name" in voucher
            assert "amount_qar" in voucher
            assert "status" in voucher
            print(f"Found {len(data)} sent vouchers")
        else:
            print("No sent vouchers found (empty list)")
    
    def test_get_sent_vouchers_without_auth_fails(self):
        """Test that getting sent vouchers without auth fails"""
        session = requests.Session()
        response = session.get(f"{BASE_URL}/api/gifts/vouchers/sent")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Unauthenticated request correctly rejected")


class TestGetVoucherByCode:
    """Tests for GET /api/gifts/voucher/{code}"""
    
    @pytest.fixture(scope="class")
    def auth_session_and_voucher(self):
        """Get authenticated session and create a voucher for testing"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code != 200:
            session.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Test User",
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            })
            response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        # Create a voucher for testing
        payload = {
            "recipient_name": "Test Lookup",
            "whatsapp_number": "+97400000010",
            "amount_qar": 200.0,
            "message": "Test voucher for lookup",
            "validity_days": 30
        }
        create_response = session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        voucher_code = create_response.json()["voucher"]["voucher_code"]
        
        return session, voucher_code
    
    def test_get_voucher_by_code(self, auth_session_and_voucher):
        """Test getting voucher details by code"""
        session, voucher_code = auth_session_and_voucher
        
        # This endpoint doesn't require auth
        response = requests.get(f"{BASE_URL}/api/gifts/voucher/{voucher_code}")
        
        assert response.status_code == 200, f"Get voucher by code failed: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert data["voucher_code"] == voucher_code
        assert "recipient_name" in data
        assert "amount_qar" in data
        assert "status" in data
        assert "expires_at" in data
        print(f"Voucher {voucher_code} retrieved successfully")
    
    def test_get_voucher_invalid_code(self):
        """Test getting voucher with invalid code returns 404"""
        response = requests.get(f"{BASE_URL}/api/gifts/voucher/INVALID123")
        
        assert response.status_code == 404, f"Expected 404 for invalid code, got {response.status_code}"
        print("Invalid voucher code correctly returns 404")


class TestRedeemVoucher:
    """Tests for POST /api/gifts/voucher/{code}/redeem"""
    
    @pytest.fixture(scope="class")
    def setup_redeem_test(self):
        """Setup: Create voucher with user 1, login user 2 for redemption"""
        # Login user 1 and create voucher
        session1 = requests.Session()
        response = session1.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code != 200:
            session1.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Test User",
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            })
            response = session1.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        
        token1 = response.json().get("token")
        session1.headers.update({"Authorization": f"Bearer {token1}"})
        
        # Create voucher
        unique_id = uuid.uuid4().hex[:6]
        payload = {
            "recipient_name": f"Redeem Test {unique_id}",
            "whatsapp_number": "+97400000020",
            "amount_qar": 150.0,
            "message": "Test voucher for redemption",
            "validity_days": 30
        }
        create_response = session1.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        voucher_code = create_response.json()["voucher"]["voucher_code"]
        
        # Login user 2 for redemption
        session2 = requests.Session()
        response = session2.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        if response.status_code != 200:
            session2.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Fatima Test",
                "email": TEST_USER_2["email"],
                "password": TEST_USER_2["password"]
            })
            response = session2.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        
        token2 = response.json().get("token")
        session2.headers.update({"Authorization": f"Bearer {token2}"})
        
        return session2, voucher_code
    
    def test_redeem_voucher_success(self, setup_redeem_test):
        """Test successfully redeeming a voucher"""
        session2, voucher_code = setup_redeem_test
        
        # Get wallet balance before redemption
        wallet_before = session2.get(f"{BASE_URL}/api/wallet").json()
        cash_before = wallet_before.get("cash_qar", 0)
        
        # Redeem voucher
        response = session2.post(f"{BASE_URL}/api/gifts/voucher/{voucher_code}/redeem")
        
        assert response.status_code == 200, f"Redeem voucher failed: {response.text}"
        data = response.json()
        
        assert "amount_added" in data
        assert data["amount_added"] == 150.0
        print(f"Voucher {voucher_code} redeemed successfully, added {data['amount_added']} QAR")
        
        # Verify wallet balance increased
        wallet_after = session2.get(f"{BASE_URL}/api/wallet").json()
        cash_after = wallet_after.get("cash_qar", 0)
        
        assert cash_after == cash_before + 150.0, f"Wallet balance not updated correctly. Before: {cash_before}, After: {cash_after}"
        print(f"Wallet balance verified: {cash_before} -> {cash_after}")
    
    def test_redeem_voucher_twice_fails(self, setup_redeem_test):
        """Test that redeeming same voucher twice fails"""
        session2, voucher_code = setup_redeem_test
        
        # Try to redeem again
        response = session2.post(f"{BASE_URL}/api/gifts/voucher/{voucher_code}/redeem")
        
        assert response.status_code == 400, f"Expected 400 for double redemption, got {response.status_code}"
        data = response.json()
        assert "مسبقاً" in data.get("detail", "") or "redeemed" in data.get("detail", "").lower(), "Error should mention already redeemed"
        print("Double redemption correctly rejected")
    
    def test_redeem_invalid_voucher_fails(self):
        """Test redeeming invalid voucher code fails"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        if response.status_code != 200:
            session.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Fatima Test",
                "email": TEST_USER_2["email"],
                "password": TEST_USER_2["password"]
            })
            response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_2)
        
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = session.post(f"{BASE_URL}/api/gifts/voucher/INVALID999/redeem")
        
        assert response.status_code == 404, f"Expected 404 for invalid voucher, got {response.status_code}"
        print("Invalid voucher redemption correctly rejected")
    
    def test_redeem_without_auth_fails(self):
        """Test that redeeming without authentication fails"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/gifts/voucher/ANYCODE123/redeem")
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated, got {response.status_code}"
        print("Unauthenticated redemption correctly rejected")


class TestVoucherEdgeCases:
    """Edge case tests for gift vouchers"""
    
    @pytest.fixture(scope="class")
    def auth_session(self):
        """Get authenticated session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        if response.status_code != 200:
            session.post(f"{BASE_URL}/api/auth/register", json={
                "name": "Test User",
                "email": TEST_USER_1["email"],
                "password": TEST_USER_1["password"]
            })
            response = session.post(f"{BASE_URL}/api/auth/login", json=TEST_USER_1)
        
        token = response.json().get("token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        return session
    
    def test_voucher_with_empty_message(self, auth_session):
        """Test creating voucher with empty message"""
        payload = {
            "recipient_name": "Test Empty Msg",
            "whatsapp_number": "+97400000030",
            "amount_qar": 100.0,
            "message": "",
            "validity_days": 30
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 200, f"Empty message voucher failed: {response.text}"
        print("Voucher with empty message created successfully")
    
    def test_voucher_with_arabic_message(self, auth_session):
        """Test creating voucher with Arabic message"""
        payload = {
            "recipient_name": "أحمد محمد",
            "whatsapp_number": "+97400000031",
            "amount_qar": 500.0,
            "message": "مبروك على النجاح! 🎉 أتمنى لك كل التوفيق في حياتك",
            "validity_days": 60
        }
        
        response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
        
        assert response.status_code == 200, f"Arabic message voucher failed: {response.text}"
        data = response.json()
        assert data["voucher"]["recipient_name"] == "أحمد محمد"
        print("Voucher with Arabic message created successfully")
    
    def test_voucher_different_validity_periods(self, auth_session):
        """Test creating vouchers with different validity periods"""
        validity_periods = [7, 14, 30, 60, 90]
        
        for days in validity_periods:
            payload = {
                "recipient_name": f"Test {days} days",
                "whatsapp_number": f"+9740000004{days}",
                "amount_qar": 100.0,
                "message": "",
                "validity_days": days
            }
            
            response = auth_session.post(f"{BASE_URL}/api/gifts/voucher", json=payload)
            
            assert response.status_code == 200, f"Voucher with {days} days validity failed: {response.text}"
            print(f"Voucher with {days} days validity created successfully")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
