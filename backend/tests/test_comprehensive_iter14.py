"""
DataPulse Comprehensive E2E Test Suite - Iteration 14
Tests all major modules: Auth, Dashboard, Organizations, Projects, Forms, 
CATI, Backcheck, Token Surveys, Quality AI, Preload/Writeback, Datasets,
Security, RBAC, Analytics, Workflows, Translations, Admin
"""
import pytest
import requests
import os
from datetime import datetime
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@datapulse.io"
TEST_PASSWORD = "password123"

class TestAuthentication:
    """Authentication module tests"""
    
    def test_login_success(self):
        """Test successful login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == TEST_EMAIL
        
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        
    def test_get_current_user(self):
        """Test getting current user info"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = login_resp.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL


@pytest.fixture(scope="class")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Authentication failed - skipping tests")


@pytest.fixture(scope="class")
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


@pytest.fixture(scope="class")
def test_org_id(auth_headers):
    """Create or get test organization"""
    # Try to list existing orgs
    response = requests.get(f"{BASE_URL}/api/organizations", headers=auth_headers)
    if response.status_code == 200:
        orgs = response.json()
        if orgs:
            return orgs[0]["id"]
    
    # Create new org
    unique_name = f"TEST_Org_{uuid.uuid4().hex[:8]}"
    response = requests.post(f"{BASE_URL}/api/organizations", json={
        "name": unique_name,
        "description": "Test organization for automated testing"
    }, headers=auth_headers)
    
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip("Could not create test organization")


@pytest.fixture(scope="class")
def test_project_id(auth_headers, test_org_id):
    """Create or get test project"""
    # Try to list existing projects
    response = requests.get(f"{BASE_URL}/api/projects?org_id={test_org_id}", headers=auth_headers)
    if response.status_code == 200:
        projects = response.json()
        if projects:
            return projects[0]["id"]
    
    # Create new project
    unique_name = f"TEST_Project_{uuid.uuid4().hex[:8]}"
    response = requests.post(f"{BASE_URL}/api/projects", json={
        "name": unique_name,
        "org_id": test_org_id,
        "description": "Test project for automated testing"
    }, headers=auth_headers)
    
    if response.status_code == 200:
        return response.json()["id"]
    pytest.skip("Could not create test project")


class TestHealthCheck:
    """Health check endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"


class TestOrganizations:
    """Organization management tests"""
    
    def test_list_organizations(self, auth_headers):
        """Test listing organizations"""
        response = requests.get(f"{BASE_URL}/api/organizations", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_organization(self, auth_headers):
        """Test creating organization"""
        unique_name = f"TEST_Org_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/organizations", json={
            "name": unique_name,
            "description": "Test organization"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == unique_name
        assert "id" in data
        
    def test_get_organization(self, auth_headers, test_org_id):
        """Test getting single organization"""
        response = requests.get(f"{BASE_URL}/api/organizations/{test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_org_id
        
    def test_get_org_members(self, auth_headers, test_org_id):
        """Test getting organization members"""
        response = requests.get(f"{BASE_URL}/api/organizations/{test_org_id}/members", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestProjects:
    """Project management tests"""
    
    def test_list_projects(self, auth_headers, test_org_id):
        """Test listing projects"""
        response = requests.get(f"{BASE_URL}/api/projects?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_project(self, auth_headers, test_org_id):
        """Test creating project"""
        unique_name = f"TEST_Project_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/projects", json={
            "name": unique_name,
            "org_id": test_org_id,
            "description": "Test project"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == unique_name
        assert "id" in data
        
    def test_get_project(self, auth_headers, test_project_id):
        """Test getting single project"""
        response = requests.get(f"{BASE_URL}/api/projects/{test_project_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project_id


class TestForms:
    """Form management tests"""
    
    def test_list_forms(self, auth_headers, test_org_id):
        """Test listing forms"""
        response = requests.get(f"{BASE_URL}/api/forms?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_form(self, auth_headers, test_project_id):
        """Test creating form"""
        unique_name = f"TEST_Form_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/forms", json={
            "name": unique_name,
            "project_id": test_project_id,
            "description": "Test form",
            "fields": [
                {"id": "q1", "type": "text", "label": "Name", "required": True},
                {"id": "q2", "type": "number", "label": "Age"}
            ]
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == unique_name
        assert "id" in data


class TestDashboard:
    """Dashboard and analytics tests"""
    
    def test_get_dashboard_stats(self, auth_headers, test_org_id):
        """Test getting dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_projects" in data
        assert "total_forms" in data
        assert "total_submissions" in data
        
    def test_get_submission_trends(self, auth_headers, test_org_id):
        """Test getting submission trends"""
        response = requests.get(f"{BASE_URL}/api/dashboard/submission-trends?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            assert "date" in data[0]
            assert "count" in data[0]
            
    def test_get_quality_metrics(self, auth_headers, test_org_id):
        """Test getting quality metrics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/quality-metrics?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "avg_quality_score" in data
        assert "total_count" in data


class TestCATI:
    """CATI (Computer-Assisted Telephone Interviewing) tests"""
    
    def test_list_cati_projects(self, auth_headers, test_org_id):
        """Test listing CATI projects"""
        response = requests.get(f"{BASE_URL}/api/cati/projects?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_cati_project(self, auth_headers, test_org_id, test_project_id):
        """Test creating CATI project"""
        # First need a form
        form_name = f"TEST_CATIForm_{uuid.uuid4().hex[:8]}"
        form_resp = requests.post(f"{BASE_URL}/api/forms", json={
            "name": form_name,
            "project_id": test_project_id,
            "fields": [{"id": "phone", "type": "text", "label": "Phone"}]
        }, headers=auth_headers)
        
        if form_resp.status_code != 200:
            pytest.skip("Could not create form for CATI test")
            
        form_id = form_resp.json()["id"]
        
        unique_name = f"TEST_CATI_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/cati/projects", json={
            "org_id": test_org_id,
            "name": unique_name,
            "form_id": form_id,
            "description": "Test CATI project"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        
    def test_get_cati_workstation(self, auth_headers, test_org_id):
        """Test CATI workstation endpoint"""
        response = requests.get(f"{BASE_URL}/api/cati/workstation/status", headers=auth_headers)
        # May return empty data but should be valid endpoint
        assert response.status_code in [200, 404]


class TestBackcheck:
    """Back-check module tests"""
    
    def test_list_backcheck_configs(self, auth_headers, test_org_id):
        """Test listing back-check configurations"""
        response = requests.get(f"{BASE_URL}/api/backcheck/configs?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_backcheck_config(self, auth_headers, test_org_id, test_project_id):
        """Test creating back-check configuration"""
        unique_name = f"TEST_Backcheck_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/backcheck/configs", json={
            "org_id": test_org_id,
            "project_id": test_project_id,
            "name": unique_name,
            "sample_rate": 10,
            "sampling_method": "random",
            "questions_to_verify": ["q1", "q2"],
            "discrepancy_threshold": 20
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        
    def test_get_enumerator_quality(self, auth_headers, test_org_id):
        """Test getting enumerator quality stats"""
        response = requests.get(f"{BASE_URL}/api/backcheck/enumerators/quality?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestTokenSurveys:
    """Token/Panel survey distribution tests"""
    
    def test_list_distributions(self, auth_headers, test_org_id):
        """Test listing survey distributions"""
        response = requests.get(f"{BASE_URL}/api/surveys/distributions?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_distribution(self, auth_headers, test_org_id, test_project_id):
        """Test creating survey distribution"""
        # First create a form
        form_name = f"TEST_SurveyForm_{uuid.uuid4().hex[:8]}"
        form_resp = requests.post(f"{BASE_URL}/api/forms", json={
            "name": form_name,
            "project_id": test_project_id,
            "fields": [{"id": "q1", "type": "text", "label": "Question 1"}]
        }, headers=auth_headers)
        
        if form_resp.status_code != 200:
            pytest.skip("Could not create form for distribution test")
            
        form_id = form_resp.json()["id"]
        
        unique_name = f"TEST_Dist_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/surveys/distributions", json={
            "org_id": test_org_id,
            "name": unique_name,
            "form_id": form_id,
            "distribution_type": "email",
            "token_type": "unique"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data


class TestQualityAI:
    """Quality AI monitoring tests"""
    
    def test_create_speeding_config(self, auth_headers, test_org_id, test_project_id):
        """Test creating speeding detection config"""
        # Create a form first
        form_name = f"TEST_AIForm_{uuid.uuid4().hex[:8]}"
        form_resp = requests.post(f"{BASE_URL}/api/forms", json={
            "name": form_name,
            "project_id": test_project_id,
            "fields": [{"id": "q1", "type": "text", "label": "Q1"}]
        }, headers=auth_headers)
        
        if form_resp.status_code != 200:
            pytest.skip("Could not create form")
            
        form_id = form_resp.json()["id"]
        
        response = requests.post(f"{BASE_URL}/api/quality-ai/speeding/configs", json={
            "org_id": test_org_id,
            "form_id": form_id,
            "min_expected_time": 60,
            "warning_threshold": 0.7,
            "critical_threshold": 0.5
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        
    def test_get_speeding_configs(self, auth_headers, test_org_id):
        """Test listing speeding configs"""
        response = requests.get(f"{BASE_URL}/api/quality-ai/speeding/configs/{test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_create_audio_audit_config(self, auth_headers, test_org_id, test_project_id):
        """Test creating audio audit config"""
        form_name = f"TEST_AudioForm_{uuid.uuid4().hex[:8]}"
        form_resp = requests.post(f"{BASE_URL}/api/forms", json={
            "name": form_name,
            "project_id": test_project_id,
            "fields": [{"id": "audio_q", "type": "audio", "label": "Audio"}]
        }, headers=auth_headers)
        
        if form_resp.status_code != 200:
            pytest.skip("Could not create form")
            
        form_id = form_resp.json()["id"]
        
        response = requests.post(f"{BASE_URL}/api/quality-ai/audio-audit/configs", json={
            "org_id": test_org_id,
            "form_id": form_id,
            "audio_field_id": "audio_q",
            "min_duration_seconds": 30,
            "sample_rate": 10
        }, headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_quality_alerts(self, auth_headers, test_org_id):
        """Test getting quality alerts"""
        response = requests.get(f"{BASE_URL}/api/quality-ai/alerts/{test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_alert_summary(self, auth_headers, test_org_id):
        """Test getting alert summary"""
        response = requests.get(f"{BASE_URL}/api/quality-ai/alerts/{test_org_id}/summary", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_open" in data or "open" in data or isinstance(data, dict)


class TestPreloadWriteback:
    """Preload/Writeback configuration tests"""
    
    def test_list_preload_configs(self, auth_headers, test_org_id):
        """Test listing preload configs"""
        response = requests.get(f"{BASE_URL}/api/preload/configs?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_list_writeback_configs(self, auth_headers, test_org_id):
        """Test listing writeback configs"""
        response = requests.get(f"{BASE_URL}/api/preload/writeback-configs?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestDatasets:
    """Lookup datasets tests"""
    
    def test_list_datasets(self, auth_headers, test_org_id):
        """Test listing datasets"""
        response = requests.get(f"{BASE_URL}/api/datasets?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        
    def test_create_dataset(self, auth_headers, test_org_id):
        """Test creating dataset"""
        unique_name = f"TEST_Dataset_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/datasets", json={
            "org_id": test_org_id,
            "name": unique_name,
            "description": "Test dataset",
            "schema": [
                {"name": "id", "type": "string", "required": True},
                {"name": "value", "type": "number"}
            ]
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data


class TestAnalytics:
    """Analytics module tests"""
    
    def test_get_analytics_overview(self, auth_headers, test_org_id):
        """Test getting analytics overview"""
        response = requests.get(f"{BASE_URL}/api/analytics/overview?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_form_analytics(self, auth_headers, test_org_id):
        """Test getting form analytics"""
        response = requests.get(f"{BASE_URL}/api/analytics/forms?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestRBAC:
    """Role-based access control tests"""
    
    def test_list_roles(self, auth_headers, test_org_id):
        """Test listing roles"""
        response = requests.get(f"{BASE_URL}/api/rbac/roles?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_permissions(self, auth_headers, test_org_id):
        """Test getting permissions"""
        response = requests.get(f"{BASE_URL}/api/rbac/permissions?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestWorkflows:
    """Workflow automation tests"""
    
    def test_list_workflows(self, auth_headers, test_org_id):
        """Test listing workflows"""
        response = requests.get(f"{BASE_URL}/api/workflows?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_create_workflow(self, auth_headers, test_org_id):
        """Test creating workflow"""
        unique_name = f"TEST_Workflow_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{BASE_URL}/api/workflows", json={
            "org_id": test_org_id,
            "name": unique_name,
            "trigger_type": "form_submit",
            "actions": [{"type": "notify", "config": {"channel": "email"}}]
        }, headers=auth_headers)
        assert response.status_code == 200


class TestTranslations:
    """Translation management tests"""
    
    def test_list_translation_projects(self, auth_headers, test_org_id):
        """Test listing translation projects"""
        response = requests.get(f"{BASE_URL}/api/translations/projects?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_supported_languages(self, auth_headers):
        """Test getting supported languages"""
        response = requests.get(f"{BASE_URL}/api/translations/languages", headers=auth_headers)
        assert response.status_code == 200


class TestSecurity:
    """Security and API key management tests"""
    
    def test_list_api_keys(self, auth_headers, test_org_id):
        """Test listing API keys"""
        response = requests.get(f"{BASE_URL}/api/security/api-keys?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200
        
    def test_get_audit_logs(self, auth_headers, test_org_id):
        """Test getting audit logs"""
        response = requests.get(f"{BASE_URL}/api/security/audit-logs?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestAdmin:
    """Super admin tests (may require superadmin role)"""
    
    def test_admin_dashboard(self, auth_headers):
        """Test admin dashboard endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=auth_headers)
        # May return 403 if not superadmin, but endpoint should exist
        assert response.status_code in [200, 403]
        
    def test_admin_organizations(self, auth_headers):
        """Test admin orgs listing"""
        response = requests.get(f"{BASE_URL}/api/admin/organizations", headers=auth_headers)
        assert response.status_code in [200, 403]


class TestParadata:
    """Paradata (field operation metadata) tests"""
    
    def test_list_paradata_sessions(self, auth_headers, test_org_id):
        """Test listing paradata sessions"""
        response = requests.get(f"{BASE_URL}/api/paradata/sessions?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


class TestRevisions:
    """Submission revision tests"""
    
    def test_list_correction_requests(self, auth_headers, test_org_id):
        """Test listing correction requests"""
        response = requests.get(f"{BASE_URL}/api/revisions/correction-requests?org_id={test_org_id}", headers=auth_headers)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
