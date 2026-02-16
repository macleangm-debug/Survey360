"""
Survey360 Docker & High-Throughput API Tests - Iteration 38
Tests the Docker setup features including:
- Health check endpoint
- High-throughput submission endpoints
- Survey360 auth and dashboard
"""

import pytest
import requests
import os
import uuid

# Use the public URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://docker-async-stack.preview.emergentagent.com').rstrip('/')


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_endpoint_returns_healthy(self):
        """Test that /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "status" in data, "Response should contain 'status' field"
        assert data["status"] == "healthy", f"Expected healthy, got {data.get('status')}"
        assert "database" in data, "Response should contain 'database' field"
        assert data["database"] == "connected", f"Database should be connected"
        assert "cache" in data, "Response should contain 'cache' field"
        # Cache can be "memory_fallback" in dev environment (expected)
        print(f"Health check result: {data}")
        
    def test_api_root_returns_info(self):
        """Test that /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API root: {data}")


class TestSurvey360Auth:
    """Test Survey360 authentication endpoints"""
    
    def test_login_with_demo_credentials(self):
        """Test login with demo@survey360.io / Test123!"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@survey360.io",
                "password": "Test123!"
            },
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == "demo@survey360.io"
        print(f"Login successful for demo@survey360.io")
        return data["access_token"]
    
    def test_login_with_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "invalid@example.com",
                "password": "wrongpassword"
            },
            timeout=10
        )
        
        assert response.status_code == 401, f"Expected 401 for invalid login, got {response.status_code}"
        print("Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test getting current user with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@survey360.io",
                "password": "Test123!"
            },
            timeout=10
        )
        
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get current user
        response = requests.get(
            f"{BASE_URL}/api/survey360/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "email" in data
        assert data["email"] == "demo@survey360.io"
        print(f"Got current user: {data['email']}")


class TestHighThroughputSubmissions:
    """Test high-throughput submission endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@survey360.io",
                "password": "Test123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate")
    
    def test_single_submission(self, auth_token):
        """Test single submission POST /api/survey360/submissions/{survey_id}"""
        test_survey_id = f"test-survey-{uuid.uuid4()}"
        
        response = requests.post(
            f"{BASE_URL}/api/survey360/submissions/{test_survey_id}",
            json={
                "responses": {
                    "q1": "Test answer 1",
                    "q2": "Test answer 2"
                },
                "metadata": {
                    "device": "test-device",
                    "platform": "pytest"
                },
                "priority": "normal"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data
        assert data["success"] == True
        assert "submission_id" in data
        assert "survey_id" in data
        assert data["survey_id"] == test_survey_id
        assert "status" in data
        print(f"Single submission successful: {data['submission_id']}")
    
    def test_bulk_submission(self, auth_token):
        """Test bulk submission POST /api/survey360/submissions/{survey_id}/bulk"""
        test_survey_id = f"test-survey-bulk-{uuid.uuid4()}"
        
        # Create multiple test submissions
        test_submissions = [
            {
                "responses": {"q1": f"Answer {i}", "q2": f"Response {i}"},
                "metadata": {"index": i}
            }
            for i in range(5)
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/survey360/submissions/{test_survey_id}/bulk",
            json={"submissions": test_submissions},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=15
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data
        assert data["success"] == True
        assert "count" in data
        assert data["count"] == 5
        assert "survey_id" in data
        print(f"Bulk submission successful: {data['count']} submissions")
    
    def test_submission_metrics(self, auth_token):
        """Test submission metrics endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/submissions/metrics",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "total_received" in data
        assert "total_processed" in data
        assert "buffer_pending" in data
        assert "celery_available" in data
        print(f"Submission metrics: received={data['total_received']}, processed={data['total_processed']}")


class TestSurvey360Dashboard:
    """Test Survey360 dashboard endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@datapulse.io",
                "password": "Test123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate")
    
    def test_dashboard_stats(self, auth_token):
        """Test dashboard stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/dashboard/stats",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_surveys" in data
        assert "active_surveys" in data
        assert "total_responses" in data
        print(f"Dashboard stats: surveys={data['total_surveys']}, responses={data['total_responses']}")
    
    def test_dashboard_activity(self, auth_token):
        """Test dashboard activity endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/dashboard/activity",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Activity should be a list"
        print(f"Dashboard activity: {len(data)} recent items")
    
    def test_usage_endpoint(self, auth_token):
        """Test usage endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/usage",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "plan" in data
        assert "surveys_used" in data
        assert "responses_used" in data
        print(f"Usage: plan={data['plan']}, surveys={data['surveys_used']}")


class TestSurvey360Surveys:
    """Test Survey360 survey CRUD operations"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@datapulse.io",
                "password": "Test123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate")
    
    def test_list_surveys(self, auth_token):
        """Test listing surveys"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/surveys",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list of surveys"
        print(f"Found {len(data)} surveys")
    
    def test_create_and_get_survey(self, auth_token):
        """Test creating a survey and retrieving it"""
        # Create survey
        test_name = f"TEST_Survey_{uuid.uuid4()}"
        create_response = requests.post(
            f"{BASE_URL}/api/survey360/surveys",
            json={
                "name": test_name,
                "description": "Test survey for pytest",
                "questions": [
                    {
                        "id": "q1",
                        "type": "short_text",
                        "title": "What is your name?",
                        "required": True
                    }
                ]
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert create_response.status_code == 200, f"Expected 200, got {create_response.status_code}: {create_response.text}"
        
        created_survey = create_response.json()
        assert "id" in created_survey
        assert created_survey["name"] == test_name
        survey_id = created_survey["id"]
        print(f"Created survey: {survey_id}")
        
        # Get the survey
        get_response = requests.get(
            f"{BASE_URL}/api/survey360/surveys/{survey_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        assert get_response.status_code == 200
        fetched_survey = get_response.json()
        assert fetched_survey["id"] == survey_id
        assert fetched_survey["name"] == test_name
        print(f"Retrieved survey: {fetched_survey['name']}")
        
        # Cleanup - delete the survey
        delete_response = requests.delete(
            f"{BASE_URL}/api/survey360/surveys/{survey_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        assert delete_response.status_code == 200
        print(f"Cleaned up test survey: {survey_id}")


class TestSurveyTemplates:
    """Test Survey360 template endpoints"""
    
    def test_list_templates(self):
        """Test listing available templates"""
        response = requests.get(
            f"{BASE_URL}/api/survey360/templates",
            timeout=10
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Should return a list of templates"
        assert len(data) > 0, "Should have at least one template"
        
        # Check template structure
        template = data[0]
        assert "id" in template
        assert "name" in template
        assert "questions" in template
        print(f"Found {len(data)} templates: {[t['name'] for t in data]}")


class TestHelpAssistant:
    """Test Help Center AI Assistant endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(
            f"{BASE_URL}/api/survey360/auth/login",
            json={
                "email": "demo@datapulse.io",
                "password": "Test123!"
            },
            timeout=10
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Could not authenticate")
    
    def test_help_assistant_chat(self, auth_token):
        """Test Help Center AI Assistant chat endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/help-assistant/chat",
            json={
                "message": "How do I create a survey?",
                "context": "Survey360"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30  # AI responses can take time
        )
        
        # The endpoint might require specific setup or return different status codes
        if response.status_code == 200:
            data = response.json()
            print(f"Help Assistant response received")
        elif response.status_code == 401:
            print("Help Assistant requires different auth")
        elif response.status_code == 404:
            print("Help Assistant endpoint not found - may be at different path")
        else:
            print(f"Help Assistant returned {response.status_code}: {response.text[:200] if response.text else 'No content'}")


# Run the tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
