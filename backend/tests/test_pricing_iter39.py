"""
Survey360 Pricing API Tests - Iteration 39
Tests for competitive pricing model with 80% profit margin

Pricing tiers: Free ($0), Starter ($19/mo), Pro ($49/mo), Business ($99/mo), Enterprise (custom)
Features: monthly/annual billing (33% annual discount), 14-day Pro trial (no credit card), AI gated to Pro+
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token for demo@survey360.io"""
    response = api_client.post(f"{BASE_URL}/api/survey360/auth/login", json={
        "email": "demo@survey360.io",
        "password": "Test123!"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestPricingPlansPublic:
    """Public pricing endpoints - no auth required"""
    
    def test_get_all_pricing_plans(self, api_client):
        """GET /api/survey360/pricing/plans - returns all 5 pricing tiers"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        
        assert response.status_code == 200
        plans = response.json()
        
        # Verify 5 tiers exist
        assert len(plans) == 5
        
        plan_ids = [p["id"] for p in plans]
        assert "free" in plan_ids
        assert "starter" in plan_ids
        assert "pro" in plan_ids
        assert "business" in plan_ids
        assert "enterprise" in plan_ids
    
    def test_free_plan_pricing(self, api_client):
        """Free plan has correct price ($0)"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        free_plan = next(p for p in plans if p["id"] == "free")
        
        assert free_plan["monthly_price"] == 0
        assert free_plan["monthly_price_display"] == "$0"
        assert free_plan["annual_price"] == 0
    
    def test_starter_plan_pricing(self, api_client):
        """Starter plan has correct price ($19/mo)"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        starter_plan = next(p for p in plans if p["id"] == "starter")
        
        assert starter_plan["monthly_price"] == 1900  # In cents
        assert starter_plan["monthly_price_display"] == "$19"
        assert starter_plan["savings_percent"] == 33  # Annual discount
    
    def test_pro_plan_pricing(self, api_client):
        """Pro plan has correct price ($49/mo) and is marked popular"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        pro_plan = next(p for p in plans if p["id"] == "pro")
        
        assert pro_plan["monthly_price"] == 4900  # In cents
        assert pro_plan["monthly_price_display"] == "$49"
        assert pro_plan["popular"] == True  # Most Popular badge
        assert pro_plan["savings_percent"] == 33
    
    def test_business_plan_pricing(self, api_client):
        """Business plan has correct price ($99/mo)"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        business_plan = next(p for p in plans if p["id"] == "business")
        
        assert business_plan["monthly_price"] == 9900  # In cents
        assert business_plan["monthly_price_display"] == "$99"
        assert business_plan["savings_percent"] == 33
    
    def test_enterprise_plan_custom_pricing(self, api_client):
        """Enterprise plan shows custom pricing"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        enterprise_plan = next(p for p in plans if p["id"] == "enterprise")
        
        assert enterprise_plan["monthly_price"] == -1  # Custom pricing
        assert enterprise_plan["monthly_price_display"] == "Custom"
        assert enterprise_plan["is_custom"] == True
    
    def test_annual_discount_33_percent(self, api_client):
        """All paid plans have 33% annual discount"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        
        for plan in plans:
            if plan["monthly_price"] > 0:  # Only paid plans
                assert plan["savings_percent"] == 33, f"{plan['name']} should have 33% discount"


class TestTrialInfo:
    """Trial configuration tests"""
    
    def test_get_trial_info(self, api_client):
        """GET /api/survey360/pricing/trial-info - returns 14-day Pro trial info"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/trial-info")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["enabled"] == True
        assert data["plan"] == "pro"
        assert data["plan_name"] == "Pro"
        assert data["duration_days"] == 14
        assert data["credit_card_required"] == False
    
    def test_trial_includes_pro_features(self, api_client):
        """Trial info includes Pro plan features"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/trial-info")
        data = response.json()
        
        assert "features" in data
        assert len(data["features"]) > 0
        # Check AI Assistant is included
        assert any("AI Assistant" in f for f in data["features"])


class TestCompareMatrix:
    """Feature comparison matrix tests"""
    
    def test_get_compare_matrix(self, api_client):
        """GET /api/survey360/pricing/compare - returns feature comparison matrix"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/compare")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "features" in data
        assert "plans" in data
        
        # Verify all plans are in comparison
        assert "free" in data["plans"]
        assert "starter" in data["plans"]
        assert "pro" in data["plans"]
        assert "business" in data["plans"]
        assert "enterprise" in data["plans"]
    
    def test_ai_assistant_gated_to_pro_plus(self, api_client):
        """AI Assistant is only available on Pro+ plans"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/compare")
        data = response.json()
        
        # Free and Starter should NOT have AI
        assert data["plans"]["free"]["ai_assistant"] == False
        assert data["plans"]["starter"]["ai_assistant"] == False
        
        # Pro, Business, Enterprise should have AI
        assert data["plans"]["pro"]["ai_assistant"] == True
        assert data["plans"]["business"]["ai_assistant"] == True
        assert data["plans"]["enterprise"]["ai_assistant"] == True


class TestSubscriptionAuthenticated:
    """Subscription endpoints requiring authentication"""
    
    def test_get_subscription_requires_auth(self, api_client):
        """GET /api/survey360/pricing/subscription requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/subscription")
        assert response.status_code == 401
    
    def test_get_subscription_with_auth(self, authenticated_client):
        """GET /api/survey360/pricing/subscription returns subscription status"""
        response = authenticated_client.get(f"{BASE_URL}/api/survey360/pricing/subscription")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "plan" in data
        assert "billing_cycle" in data
        assert "status" in data
        assert "current_period_start" in data
        assert "current_period_end" in data
    
    def test_get_usage_requires_auth(self, api_client):
        """GET /api/survey360/pricing/usage requires authentication"""
        # Clear auth header for this test
        headers = {"Content-Type": "application/json"}
        response = requests.get(f"{BASE_URL}/api/survey360/pricing/usage", headers=headers)
        assert response.status_code == 401
    
    def test_get_usage_with_auth(self, authenticated_client):
        """GET /api/survey360/pricing/usage returns usage details"""
        response = authenticated_client.get(f"{BASE_URL}/api/survey360/pricing/usage")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all usage fields
        assert "plan" in data
        assert "users_used" in data
        assert "users_limit" in data
        assert "surveys_used" in data
        assert "surveys_limit" in data
        assert "responses_used" in data
        assert "responses_limit" in data
        assert "has_ai_assistant" in data
        assert "has_custom_branding" in data


class TestStartTrial:
    """Trial start endpoint tests"""
    
    def test_start_trial_requires_auth(self, api_client):
        """POST /api/survey360/pricing/start-trial requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/survey360/pricing/start-trial")
        assert response.status_code == 401
    
    def test_start_trial_with_auth(self):
        """POST /api/survey360/pricing/start-trial starts 14-day trial"""
        # Get fresh token for demo user
        session = requests.Session()
        session.headers.update({"Content-Type": "application/json"})
        
        login_response = session.post(f"{BASE_URL}/api/survey360/auth/login", json={
            "email": "demo@survey360.io",
            "password": "Test123!"
        })
        
        if login_response.status_code != 200:
            pytest.skip("Login failed")
        
        token = login_response.json().get("access_token")
        session.headers.update({"Authorization": f"Bearer {token}"})
        
        response = session.post(f"{BASE_URL}/api/survey360/pricing/start-trial")
        
        # Could be 200 (success) or 400 (trial already used)
        assert response.status_code in [200, 400]
        
        data = response.json()
        if response.status_code == 200:
            assert data["success"] == True
            assert "14-day" in data["message"] or "Pro" in data["message"]
            assert "trial_end" in data
        else:
            # Trial already used
            assert "already used" in data["detail"].lower() or "upgrade" in data["detail"].lower()


class TestPlanFeatures:
    """Verify specific plan features"""
    
    def test_free_plan_features(self, api_client):
        """Free plan has correct feature set"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        free_plan = next(p for p in plans if p["id"] == "free")
        
        assert free_plan["users"] == 1
        assert free_plan["responses_per_month"] == 100
        assert free_plan["surveys"] == 3
        assert "AI Assistant" in free_plan["disabled_features"]
    
    def test_pro_plan_features(self, api_client):
        """Pro plan includes AI Assistant"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        pro_plan = next(p for p in plans if p["id"] == "pro")
        
        assert pro_plan["users"] == 10
        assert pro_plan["responses_per_month"] == 10000
        assert any("AI Assistant" in f for f in pro_plan["features"])
    
    def test_enterprise_unlimited(self, api_client):
        """Enterprise plan has unlimited resources"""
        response = api_client.get(f"{BASE_URL}/api/survey360/pricing/plans")
        plans = response.json()
        enterprise_plan = next(p for p in plans if p["id"] == "enterprise")
        
        assert enterprise_plan["users"] == -1  # Unlimited
        assert enterprise_plan["responses_per_month"] == -1
        assert enterprise_plan["surveys"] == -1


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
