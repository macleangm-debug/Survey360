"""
Test suite for Iteration 10 features:
- API Security (API Keys, Rate Limits, Audit Logs, Security Settings)
- Super Admin Dashboard (Organizations, Billing Plans, Alerts, Invoices)
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@datapulse.io"
TEST_PASSWORD = "password123"


class TestAuth:
    """Authentication setup for tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed - cannot proceed with tests")

    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Get auth headers"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json",
            "X-Super-Admin": "true"
        }

    @pytest.fixture(scope="class")
    def org_id(self, auth_headers):
        """Get an organization ID for testing"""
        response = requests.get(f"{BASE_URL}/api/organizations", headers=auth_headers)
        if response.status_code == 200:
            orgs = response.json()
            if orgs and len(orgs) > 0:
                return orgs[0].get("id")
        # Create a test org
        response = requests.post(f"{BASE_URL}/api/organizations", headers=auth_headers, json={
            "name": "TEST_Org_Security",
            "slug": "test-org-security"
        })
        if response.status_code in [200, 201]:
            return response.json().get("id")
        pytest.skip("Could not get/create organization for testing")


class TestSecurityAPIKeys(TestAuth):
    """Test Security API - API Key Management"""
    
    created_key_id = None

    def test_create_api_key(self, auth_headers, org_id):
        """POST /api/security/api-keys/{org_id} - Create API key"""
        params = {
            "name": "TEST_API_Key",
            "tier": "free"
        }
        response = requests.post(
            f"{BASE_URL}/api/security/api-keys/{org_id}",
            headers=auth_headers,
            params=params,
            json={"scopes": ["read", "write"]}
        )
        
        assert response.status_code == 200, f"Failed to create API key: {response.text}"
        
        data = response.json()
        assert "key" in data, "API key not returned"
        assert "key_prefix" in data
        assert data["name"] == "TEST_API_Key"
        assert data["tier"] == "free"
        assert "read" in data["scopes"]
        
        # Store the key id for later tests
        TestSecurityAPIKeys.created_key_id = data.get("id")
        print(f"Created API key: {data['key_prefix']}... (id: {data['id']})")

    def test_list_api_keys(self, auth_headers, org_id):
        """GET /api/security/api-keys/{org_id} - List API keys"""
        response = requests.get(
            f"{BASE_URL}/api/security/api-keys/{org_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to list API keys: {response.text}"
        
        data = response.json()
        assert "keys" in data
        assert isinstance(data["keys"], list)
        print(f"Found {len(data['keys'])} API keys")

    def test_update_api_key(self, auth_headers, org_id):
        """PUT /api/security/api-keys/{org_id}/{key_id} - Update API key"""
        if not TestSecurityAPIKeys.created_key_id:
            pytest.skip("No API key created to update")
        
        response = requests.put(
            f"{BASE_URL}/api/security/api-keys/{org_id}/{TestSecurityAPIKeys.created_key_id}",
            headers=auth_headers,
            json={
                "name": "TEST_API_Key_Updated",
                "scopes": ["read", "write", "admin"]
            }
        )
        
        assert response.status_code == 200, f"Failed to update API key: {response.text}"
        data = response.json()
        assert data.get("message") == "API key updated"
        print(f"Updated API key: {TestSecurityAPIKeys.created_key_id}")

    def test_delete_api_key(self, auth_headers, org_id):
        """DELETE /api/security/api-keys/{org_id}/{key_id} - Delete API key"""
        if not TestSecurityAPIKeys.created_key_id:
            pytest.skip("No API key created to delete")
        
        response = requests.delete(
            f"{BASE_URL}/api/security/api-keys/{org_id}/{TestSecurityAPIKeys.created_key_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to delete API key: {response.text}"
        data = response.json()
        assert data.get("message") == "API key revoked"
        print(f"Deleted API key: {TestSecurityAPIKeys.created_key_id}")


class TestSecurityRateLimits(TestAuth):
    """Test Security API - Rate Limits"""

    def test_get_rate_limits_tiers(self, auth_headers):
        """GET /api/security/rate-limits - Get rate limit tiers"""
        response = requests.get(
            f"{BASE_URL}/api/security/rate-limits",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get rate limits: {response.text}"
        
        data = response.json()
        assert "tiers" in data
        assert len(data["tiers"]) >= 3  # free, pro, enterprise at minimum
        
        tier_ids = [t["id"] for t in data["tiers"]]
        assert "free" in tier_ids
        assert "pro" in tier_ids
        assert "enterprise" in tier_ids
        
        print(f"Available rate limit tiers: {tier_ids}")

    def test_get_rate_limit_status(self, auth_headers, org_id):
        """GET /api/security/rate-limits/{org_id}/status - Get rate limit status"""
        response = requests.get(
            f"{BASE_URL}/api/security/rate-limits/{org_id}/status",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get rate limit status: {response.text}"
        
        data = response.json()
        assert "tier" in data
        assert "limit_per_minute" in data
        assert "current_usage" in data
        assert "reset_at" in data
        
        print(f"Rate limit status: tier={data['tier']}, usage={data['current_usage']}/{data['limit_per_minute']}")


class TestSecurityAuditLogs(TestAuth):
    """Test Security API - Audit Logs"""

    def test_get_audit_logs(self, auth_headers, org_id):
        """GET /api/security/audit-logs/{org_id} - Get audit logs"""
        response = requests.get(
            f"{BASE_URL}/api/security/audit-logs/{org_id}",
            headers=auth_headers,
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Failed to get audit logs: {response.text}"
        
        data = response.json()
        assert "logs" in data
        assert "total" in data
        assert isinstance(data["logs"], list)
        
        print(f"Found {data['total']} audit logs (showing {len(data['logs'])})")

    def test_get_audit_logs_with_filters(self, auth_headers, org_id):
        """GET /api/security/audit-logs/{org_id} - Get audit logs with filters"""
        response = requests.get(
            f"{BASE_URL}/api/security/audit-logs/{org_id}",
            headers=auth_headers,
            params={
                "limit": 10,
                "method": "GET",
                "path_contains": "api"
            }
        )
        
        assert response.status_code == 200, f"Failed to get filtered audit logs: {response.text}"
        
        data = response.json()
        assert "logs" in data
        print(f"Filtered audit logs: {len(data['logs'])} results")

    def test_get_audit_stats(self, auth_headers, org_id):
        """GET /api/security/audit-logs/{org_id}/stats - Get audit statistics"""
        response = requests.get(
            f"{BASE_URL}/api/security/audit-logs/{org_id}/stats",
            headers=auth_headers,
            params={"days": 7}
        )
        
        assert response.status_code == 200, f"Failed to get audit stats: {response.text}"
        
        data = response.json()
        assert "daily_stats" in data
        assert "error_stats" in data
        assert "period_days" in data
        
        print(f"Audit stats for {data['period_days']} days: errors={data['error_stats'].get('errors', 0)}")


class TestSecuritySettings(TestAuth):
    """Test Security API - Security Settings"""

    def test_get_security_settings(self, auth_headers, org_id):
        """GET /api/security/settings/{org_id} - Get security settings"""
        response = requests.get(
            f"{BASE_URL}/api/security/settings/{org_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get security settings: {response.text}"
        
        data = response.json()
        assert "two_factor_required" in data
        assert "session_timeout_minutes" in data
        assert "password_min_length" in data
        assert "max_failed_logins" in data
        
        print(f"Security settings: 2FA={data['two_factor_required']}, session_timeout={data['session_timeout_minutes']}min")

    def test_update_security_settings(self, auth_headers, org_id):
        """PUT /api/security/settings/{org_id} - Update security settings"""
        response = requests.put(
            f"{BASE_URL}/api/security/settings/{org_id}",
            headers=auth_headers,
            json={
                "session_timeout_minutes": 120,
                "password_min_length": 10
            }
        )
        
        assert response.status_code == 200, f"Failed to update security settings: {response.text}"
        
        data = response.json()
        assert data.get("message") == "Security settings updated"
        print("Security settings updated successfully")


class TestIPWhitelist(TestAuth):
    """Test Security API - IP Whitelist"""

    def test_get_ip_whitelist(self, auth_headers, org_id):
        """GET /api/security/ip-whitelist/{org_id} - Get IP whitelist"""
        response = requests.get(
            f"{BASE_URL}/api/security/ip-whitelist/{org_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get IP whitelist: {response.text}"
        
        data = response.json()
        assert "ips" in data
        assert "enabled" in data
        
        print(f"IP whitelist: enabled={data['enabled']}, ips={len(data['ips'])}")

    def test_update_ip_whitelist(self, auth_headers, org_id):
        """PUT /api/security/ip-whitelist/{org_id} - Update IP whitelist"""
        response = requests.put(
            f"{BASE_URL}/api/security/ip-whitelist/{org_id}",
            headers=auth_headers,
            params={
                "ips": ["192.168.1.1", "10.0.0.1"],
                "enabled": False
            }
        )
        
        assert response.status_code == 200, f"Failed to update IP whitelist: {response.text}"
        
        data = response.json()
        assert data.get("message") == "IP whitelist updated"
        print("IP whitelist updated successfully")


class TestAdminDashboard(TestAuth):
    """Test Super Admin API - Dashboard"""

    def test_get_admin_dashboard(self, auth_headers):
        """GET /api/admin/dashboard - Get admin dashboard stats"""
        response = requests.get(
            f"{BASE_URL}/api/admin/dashboard",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get admin dashboard: {response.text}"
        
        data = response.json()
        assert "stats" in data
        assert "billing_distribution" in data
        assert "recent_organizations" in data
        
        stats = data["stats"]
        assert "total_organizations" in stats
        assert "total_users" in stats
        assert "total_submissions" in stats
        assert "monthly_revenue" in stats
        
        print(f"Admin dashboard: {stats['total_organizations']} orgs, {stats['total_users']} users, ${stats['monthly_revenue']} revenue")


class TestAdminOrganizations(TestAuth):
    """Test Super Admin API - Organization Management"""

    def test_list_all_organizations(self, auth_headers):
        """GET /api/admin/organizations - List all organizations"""
        response = requests.get(
            f"{BASE_URL}/api/admin/organizations",
            headers=auth_headers,
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Failed to list organizations: {response.text}"
        
        data = response.json()
        assert "organizations" in data
        assert "total" in data
        assert isinstance(data["organizations"], list)
        
        # Check org has usage data enrichment
        if len(data["organizations"]) > 0:
            org = data["organizations"][0]
            assert "usage" in org, "Organization should have usage data"
        
        print(f"Admin: Found {data['total']} organizations")

    def test_list_organizations_with_filters(self, auth_headers):
        """GET /api/admin/organizations - List with filters"""
        response = requests.get(
            f"{BASE_URL}/api/admin/organizations",
            headers=auth_headers,
            params={
                "limit": 10,
                "tier": "free",
                "sort_by": "created_at",
                "sort_order": "desc"
            }
        )
        
        assert response.status_code == 200, f"Failed to filter organizations: {response.text}"
        
        data = response.json()
        assert "organizations" in data
        print(f"Filtered organizations: {len(data['organizations'])} results")

    def test_get_organization_details(self, auth_headers, org_id):
        """GET /api/admin/organizations/{org_id} - Get org details"""
        response = requests.get(
            f"{BASE_URL}/api/admin/organizations/{org_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get org details: {response.text}"
        
        data = response.json()
        assert "organization" in data
        assert "usage" in data
        assert "current_plan" in data
        assert "monthly_submissions" in data
        
        print(f"Org details: plan={data['current_plan']['name']}, usage={data['usage']}")

    def test_update_organization_tier(self, auth_headers, org_id):
        """PUT /api/admin/organizations/{org_id}/tier - Update org tier"""
        # First get current tier
        response = requests.get(
            f"{BASE_URL}/api/admin/organizations/{org_id}",
            headers=auth_headers
        )
        original_tier = response.json()["current_plan"]["id"]
        
        # Update to pro
        response = requests.put(
            f"{BASE_URL}/api/admin/organizations/{org_id}/tier",
            headers=auth_headers,
            json={"tier": "pro"}
        )
        
        assert response.status_code == 200, f"Failed to update tier: {response.text}"
        
        data = response.json()
        assert "plan" in data
        assert data["plan"]["id"] == "pro"
        
        # Reset back to original
        requests.put(
            f"{BASE_URL}/api/admin/organizations/{org_id}/tier",
            headers=auth_headers,
            json={"tier": original_tier}
        )
        
        print(f"Updated org tier: {original_tier} -> pro -> {original_tier}")


class TestAdminBillingPlans(TestAuth):
    """Test Super Admin API - Billing Plans"""

    def test_get_billing_plans(self, auth_headers):
        """GET /api/admin/billing/plans - Get billing plans"""
        response = requests.get(
            f"{BASE_URL}/api/admin/billing/plans",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get billing plans: {response.text}"
        
        data = response.json()
        assert "plans" in data
        assert len(data["plans"]) >= 3  # free, pro, enterprise
        
        plan_ids = [p["id"] for p in data["plans"]]
        assert "free" in plan_ids
        assert "pro" in plan_ids
        assert "enterprise" in plan_ids
        
        # Check plan structure
        pro_plan = next(p for p in data["plans"] if p["id"] == "pro")
        assert "price_monthly" in pro_plan
        assert "features" in pro_plan
        assert "max_users" in pro_plan["features"]
        assert "max_submissions_per_month" in pro_plan["features"]
        
        print(f"Billing plans: {[f'{p['name']}=${p['price_monthly']}' for p in data['plans']]}")


class TestAdminAlerts(TestAuth):
    """Test Super Admin API - Usage Alerts"""

    def test_get_usage_alerts(self, auth_headers):
        """GET /api/admin/alerts - Get usage alerts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/alerts",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get alerts: {response.text}"
        
        data = response.json()
        assert "alerts" in data
        assert "total" in data
        
        # Check alert structure if any alerts exist
        if len(data["alerts"]) > 0:
            alert = data["alerts"][0]
            assert "org_id" in alert
            assert "type" in alert
            assert "usage_percentage" in alert
            assert "severity" in alert
        
        print(f"Usage alerts: {data['total']} total ({len([a for a in data['alerts'] if a['severity'] == 'critical'])} critical)")


class TestAdminInvoices(TestAuth):
    """Test Super Admin API - Invoice Management"""

    def test_list_invoices(self, auth_headers):
        """GET /api/admin/invoices - List all invoices"""
        response = requests.get(
            f"{BASE_URL}/api/admin/invoices",
            headers=auth_headers,
            params={"limit": 10}
        )
        
        assert response.status_code == 200, f"Failed to list invoices: {response.text}"
        
        data = response.json()
        assert "invoices" in data
        assert "total" in data
        
        print(f"Invoices: {data['total']} total")


class TestAdminSystemStats(TestAuth):
    """Test Super Admin API - System Statistics"""

    def test_get_system_stats(self, auth_headers):
        """GET /api/admin/system/stats - Get system statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/system/stats",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Failed to get system stats: {response.text}"
        
        data = response.json()
        assert "daily_submissions" in data
        assert "daily_new_users" in data
        assert "api_calls_today" in data
        
        # Check structure
        assert isinstance(data["daily_submissions"], list)
        if len(data["daily_submissions"]) > 0:
            assert "date" in data["daily_submissions"][0]
            assert "count" in data["daily_submissions"][0]
        
        print(f"System stats: {data['api_calls_today']} API calls today, {len(data['daily_submissions'])} days of submission data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
