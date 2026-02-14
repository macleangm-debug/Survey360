"""
Survey360 Backend API Tests - Iteration 28
Tests for Survey360 Survey Management Product APIs:
- Authentication (login, register)
- Dashboard (stats, activity)
- Surveys (CRUD, publish, duplicate)
- Responses (list, submit via public endpoint)
- Public survey access
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SURVEY360_API = f"{BASE_URL}/api/survey360"

# Test credentials
TEST_EMAIL = "demo@survey360.io"
TEST_PASSWORD = "Test123!"

class TestSurvey360Auth:
    """Survey360 Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        assert data["user"]["name"] == "Demo User"
        assert "org_id" in data["user"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
    
    def test_auth_me_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # Login first
        login_res = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        token = login_res.json()["access_token"]
        
        # Get current user
        response = requests.get(f"{SURVEY360_API}/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_EMAIL
    
    def test_auth_me_without_token(self):
        """Test /auth/me without token returns 401"""
        response = requests.get(f"{SURVEY360_API}/auth/me")
        assert response.status_code == 401


class TestSurvey360Dashboard:
    """Survey360 Dashboard endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_dashboard_stats(self, auth_token):
        """Test dashboard stats endpoint"""
        response = requests.get(f"{SURVEY360_API}/dashboard/stats", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_surveys" in data
        assert "active_surveys" in data
        assert "total_responses" in data
        assert "response_rate" in data
        assert isinstance(data["total_surveys"], int)
    
    def test_dashboard_activity(self, auth_token):
        """Test dashboard activity endpoint"""
        response = requests.get(f"{SURVEY360_API}/dashboard/activity?limit=5", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Each activity item should have expected fields
        if len(data) > 0:
            item = data[0]
            assert "user_name" in item
            assert "survey_name" in item
            assert "status" in item


class TestSurvey360Surveys:
    """Survey360 Surveys CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_surveys(self, auth_token):
        """Test listing surveys"""
        response = requests.get(f"{SURVEY360_API}/surveys", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            survey = data[0]
            assert "id" in survey
            assert "name" in survey
            assert "status" in survey
            assert "question_count" in survey
            assert "response_count" in survey
    
    def test_create_survey(self, auth_token):
        """Test creating a new survey"""
        test_name = f"TEST_Survey_{uuid.uuid4().hex[:8]}"
        response = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Test survey description",
            "questions": []
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data["name"] == test_name
        assert data["status"] == "draft"
        assert data["question_count"] == 0
        
        # Cleanup - delete the test survey
        requests.delete(f"{SURVEY360_API}/surveys/{data['id']}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
    
    def test_get_survey_by_id(self, auth_token):
        """Test getting a specific survey"""
        # First get list of surveys
        list_res = requests.get(f"{SURVEY360_API}/surveys", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        surveys = list_res.json()
        if len(surveys) == 0:
            pytest.skip("No surveys available to test")
        
        survey_id = surveys[0]["id"]
        response = requests.get(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == survey_id
        assert "name" in data
        assert "questions" in data
    
    def test_update_survey(self, auth_token):
        """Test updating a survey"""
        # Create a test survey first
        test_name = f"TEST_Update_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Original description",
            "questions": []
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Update the survey
        updated_name = f"TEST_Updated_{uuid.uuid4().hex[:8]}"
        response = requests.put(f"{SURVEY360_API}/surveys/{survey_id}", json={
            "name": updated_name,
            "description": "Updated description"
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == updated_name
        assert data["description"] == "Updated description"
        
        # Verify persistence with GET
        get_res = requests.get(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert get_res.json()["name"] == updated_name
        
        # Cleanup
        requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
    
    def test_publish_survey(self, auth_token):
        """Test publishing a survey"""
        # Create a test survey
        test_name = f"TEST_Publish_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Test survey for publishing",
            "questions": [{
                "id": str(uuid.uuid4()),
                "type": "short_text",
                "title": "Test Question",
                "required": True
            }]
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Publish the survey
        response = requests.post(f"{SURVEY360_API}/surveys/{survey_id}/publish", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        
        # Cleanup
        requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
    
    def test_duplicate_survey(self, auth_token):
        """Test duplicating a survey"""
        # Create a test survey
        test_name = f"TEST_Duplicate_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Test survey for duplication",
            "questions": []
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Duplicate the survey
        response = requests.post(f"{SURVEY360_API}/surveys/{survey_id}/duplicate", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == f"{test_name} (Copy)"
        assert data["status"] == "draft"
        assert data["id"] != survey_id
        
        # Cleanup both surveys
        requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        requests.delete(f"{SURVEY360_API}/surveys/{data['id']}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
    
    def test_delete_survey(self, auth_token):
        """Test deleting a survey"""
        # Create a test survey
        test_name = f"TEST_Delete_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Test survey for deletion",
            "questions": []
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Delete the survey
        response = requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        
        # Verify deletion
        get_res = requests.get(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert get_res.status_code == 404


class TestSurvey360Responses:
    """Survey360 Response management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_survey_responses(self, auth_token):
        """Test listing responses for a survey"""
        # Get a survey with responses
        surveys_res = requests.get(f"{SURVEY360_API}/surveys", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        surveys = surveys_res.json()
        if len(surveys) == 0:
            pytest.skip("No surveys available")
        
        survey_id = surveys[0]["id"]
        response = requests.get(f"{SURVEY360_API}/surveys/{survey_id}/responses", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            resp = data[0]
            assert "id" in resp
            assert "survey_id" in resp
            assert "status" in resp
            assert "answers" in resp


class TestSurvey360PublicEndpoints:
    """Survey360 Public endpoint tests (no auth required)"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for setup"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_public_get_published_survey(self, auth_token):
        """Test public access to a published survey"""
        # Get a published survey
        surveys_res = requests.get(f"{SURVEY360_API}/surveys", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        surveys = surveys_res.json()
        published_survey = next((s for s in surveys if s["status"] == "published"), None)
        if not published_survey:
            pytest.skip("No published surveys available")
        
        # Access via public endpoint (no auth)
        response = requests.get(f"{SURVEY360_API}/public/surveys/{published_survey['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "published"
        assert data["name"] == published_survey["name"]
    
    def test_public_submit_response(self, auth_token):
        """Test submitting a response via public endpoint"""
        # First create and publish a test survey
        test_name = f"TEST_Public_{uuid.uuid4().hex[:8]}"
        question_id = str(uuid.uuid4())
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Test survey for public submission",
            "questions": [{
                "id": question_id,
                "type": "short_text",
                "title": "What is your name?",
                "required": True
            }]
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Publish it
        requests.post(f"{SURVEY360_API}/surveys/{survey_id}/publish", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        # Submit response via public endpoint (no auth)
        response = requests.post(f"{SURVEY360_API}/public/surveys/{survey_id}/responses", json={
            "respondent_name": "Test User",
            "respondent_email": "test@example.com",
            "answers": {question_id: "John Doe"},
            "completion_time": 45
        })
        assert response.status_code == 200, f"Submit failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert data["message"] == "Response submitted successfully"
        
        # Verify response was saved
        responses_res = requests.get(f"{SURVEY360_API}/surveys/{survey_id}/responses", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        responses = responses_res.json()
        assert len(responses) > 0
        submitted_response = next((r for r in responses if r["id"] == data["id"]), None)
        assert submitted_response is not None
        assert submitted_response["respondent_name"] == "Test User"
        
        # Cleanup
        requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
    
    def test_public_access_draft_survey_returns_404(self, auth_token):
        """Test that draft surveys are not accessible via public endpoint"""
        # Create a draft survey
        test_name = f"TEST_Draft_{uuid.uuid4().hex[:8]}"
        create_res = requests.post(f"{SURVEY360_API}/surveys", json={
            "name": test_name,
            "description": "Draft survey",
            "questions": []
        }, headers={
            "Authorization": f"Bearer {auth_token}"
        })
        survey_id = create_res.json()["id"]
        
        # Try to access via public endpoint
        response = requests.get(f"{SURVEY360_API}/public/surveys/{survey_id}")
        assert response.status_code == 404
        
        # Cleanup
        requests.delete(f"{SURVEY360_API}/surveys/{survey_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })


class TestSurvey360Organizations:
    """Survey360 Organization endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{SURVEY360_API}/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_list_organizations(self, auth_token):
        """Test listing organizations"""
        response = requests.get(f"{SURVEY360_API}/organizations", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            org = data[0]
            assert "id" in org
            assert "name" in org


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
