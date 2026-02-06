"""
Test Quality AI P2 Features - Speeding Detection, Audio Audit, AI Monitoring
Tests for DataPulse Quality & AI Monitoring Module
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

class TestQualityAIBackend:
    """Backend tests for Quality AI P2 features"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Shared requests session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        """Get authentication token"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            data = response.json()
            return data.get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture(scope="class")
    def authenticated_session(self, session, auth_token):
        """Session with auth header"""
        session.headers.update({"Authorization": f"Bearer {auth_token}"})
        return session
    
    @pytest.fixture(scope="class")
    def org_id(self, authenticated_session):
        """Get or create test organization"""
        # Get user's orgs first
        response = authenticated_session.get(f"{BASE_URL}/api/users/me")
        if response.status_code == 200:
            user_data = response.json()
            # Try to get first org member
            org_response = authenticated_session.get(f"{BASE_URL}/api/organizations/my-orgs")
            if org_response.status_code == 200:
                orgs = org_response.json()
                if orgs and len(orgs) > 0:
                    return orgs[0].get("id")
        
        # Create new org if needed
        test_org = {
            "name": f"TEST_Quality_AI_Org_{int(datetime.now().timestamp())}",
            "slug": f"test-quality-ai-{int(datetime.now().timestamp())}"
        }
        response = authenticated_session.post(f"{BASE_URL}/api/organizations", json=test_org)
        if response.status_code in [200, 201]:
            return response.json().get("id")
        pytest.skip("Could not get or create organization")
    
    @pytest.fixture(scope="class")
    def form_id(self, authenticated_session, org_id):
        """Create or get test form for quality AI tests"""
        # First create a project
        project_data = {
            "name": f"TEST_QualityAI_Project_{int(datetime.now().timestamp())}",
            "org_id": org_id,
            "description": "Test project for quality AI features"
        }
        proj_response = authenticated_session.post(f"{BASE_URL}/api/projects", json=project_data)
        
        if proj_response.status_code in [200, 201]:
            project_id = proj_response.json().get("id")
            
            # Create form
            form_data = {
                "name": f"TEST_QualityAI_Form_{int(datetime.now().timestamp())}",
                "project_id": project_id,
                "org_id": org_id,
                "fields": [
                    {"id": "name", "type": "text", "label": "Name", "required": True},
                    {"id": "consent_audio", "type": "audio", "label": "Audio Recording"},
                    {"id": "rating", "type": "number", "label": "Rating", "validation": {"min": 1, "max": 10}}
                ]
            }
            response = authenticated_session.post(f"{BASE_URL}/api/forms", json=form_data)
            if response.status_code in [200, 201]:
                return response.json().get("id")
        
        return f"test_form_{int(datetime.now().timestamp())}"

    # ============ Health Check ============
    def test_api_health(self, session):
        """Test API is healthy"""
        response = session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ API health check passed")

    # ============ Speeding Detection Tests ============
    def test_create_speeding_config(self, authenticated_session, org_id, form_id):
        """Test creating speeding detection configuration"""
        config_data = {
            "org_id": org_id,
            "form_id": form_id,
            "min_completion_time_seconds": 60,
            "warning_threshold_percent": 50,
            "critical_threshold_percent": 25,
            "auto_flag_critical": True,
            "is_active": True
        }
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/speeding/configs",
            json=config_data
        )
        
        assert response.status_code == 200, f"Failed to create speeding config: {response.text}"
        data = response.json()
        assert "config_id" in data
        assert data.get("message") == "Speeding detection configured"
        print(f"✓ Created speeding config: {data.get('config_id')}")
        return data.get("config_id")
    
    def test_list_speeding_configs(self, authenticated_session, org_id):
        """Test listing speeding detection configurations"""
        response = authenticated_session.get(
            f"{BASE_URL}/api/quality-ai/speeding/configs/{org_id}"
        )
        
        assert response.status_code == 200, f"Failed to list speeding configs: {response.text}"
        data = response.json()
        assert "configs" in data
        assert isinstance(data["configs"], list)
        print(f"✓ Listed {len(data['configs'])} speeding configs")

    # ============ Audio Audit Tests ============
    def test_create_audio_audit_config(self, authenticated_session, org_id, form_id):
        """Test creating audio audit configuration"""
        config_data = {
            "org_id": org_id,
            "form_id": form_id,
            "audio_field_id": "consent_audio",
            "min_duration_seconds": 30,
            "sample_percentage": 10.0,
            "is_active": True
        }
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/audio-audit/configs",
            json=config_data
        )
        
        assert response.status_code == 200, f"Failed to create audio audit config: {response.text}"
        data = response.json()
        assert "config_id" in data
        assert data.get("message") == "Audio audit configured"
        print(f"✓ Created audio audit config: {data.get('config_id')}")
        return data.get("config_id")
    
    def test_list_audio_audit_configs(self, authenticated_session, org_id):
        """Test listing audio audit configurations"""
        response = authenticated_session.get(
            f"{BASE_URL}/api/quality-ai/audio-audit/configs/{org_id}"
        )
        
        assert response.status_code == 200, f"Failed to list audio audit configs: {response.text}"
        data = response.json()
        assert "configs" in data
        assert isinstance(data["configs"], list)
        print(f"✓ Listed {len(data['configs'])} audio audit configs")

    # ============ AI Monitoring Tests ============
    def test_create_ai_monitoring_config(self, authenticated_session, org_id):
        """Test creating AI monitoring configuration with GPT-5.2"""
        config_data = {
            "org_id": org_id,
            "detect_speeding": True,
            "detect_straight_lining": True,
            "detect_response_anomalies": True,
            "detect_gps_anomalies": True,
            "detect_duplicates": True,
            "use_ai_analysis": True,
            "ai_analysis_sample_rate": 5.0,
            "anomaly_score_threshold": 0.7,
            "is_active": True
        }
        
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/ai-monitoring/configs",
            json=config_data
        )
        
        assert response.status_code == 200, f"Failed to create AI monitoring config: {response.text}"
        data = response.json()
        assert "config_id" in data
        assert data.get("message") == "AI monitoring configured"
        print(f"✓ Created AI monitoring config with GPT-5.2: {data.get('config_id')}")
        return data.get("config_id")
    
    def test_list_ai_monitoring_configs(self, authenticated_session, org_id):
        """Test listing AI monitoring configurations"""
        response = authenticated_session.get(
            f"{BASE_URL}/api/quality-ai/ai-monitoring/configs/{org_id}"
        )
        
        assert response.status_code == 200, f"Failed to list AI monitoring configs: {response.text}"
        data = response.json()
        assert "configs" in data
        assert isinstance(data["configs"], list)
        print(f"✓ Listed {len(data['configs'])} AI monitoring configs")

    # ============ Quality Alerts Tests ============
    def test_get_quality_alerts(self, authenticated_session, org_id):
        """Test getting quality alerts list"""
        response = authenticated_session.get(
            f"{BASE_URL}/api/quality-ai/alerts/{org_id}"
        )
        
        assert response.status_code == 200, f"Failed to get alerts: {response.text}"
        data = response.json()
        assert "alerts" in data
        assert "total" in data
        assert isinstance(data["alerts"], list)
        print(f"✓ Got {len(data['alerts'])} quality alerts (total: {data['total']})")
    
    def test_get_alerts_summary(self, authenticated_session, org_id):
        """Test getting alerts summary with stats"""
        response = authenticated_session.get(
            f"{BASE_URL}/api/quality-ai/alerts/{org_id}/summary"
        )
        
        assert response.status_code == 200, f"Failed to get alerts summary: {response.text}"
        data = response.json()
        assert "total_open" in data
        assert "total_resolved" in data
        assert "by_type" in data
        assert "by_severity" in data
        print(f"✓ Got alerts summary - Open: {data['total_open']}, Resolved: {data['total_resolved']}")

    # ============ Batch Analysis Test ============
    def test_run_batch_analysis(self, authenticated_session, org_id):
        """Test running batch analysis"""
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/batch-analyze/{org_id}",
            json={"hours": 24}
        )
        
        assert response.status_code == 200, f"Failed to start batch analysis: {response.text}"
        data = response.json()
        assert "message" in data
        assert "submission_count" in data
        print(f"✓ Batch analysis started for {data['submission_count']} submissions")


class TestQualityAIEdgeCases:
    """Edge case tests for Quality AI"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Shared requests session"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        """Get authentication token"""
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    @pytest.fixture(scope="class")
    def authenticated_session(self, session, auth_token):
        """Session with auth header"""
        session.headers.update({"Authorization": f"Bearer {auth_token}"})
        return session
    
    def test_analyze_nonexistent_submission_speed(self, authenticated_session):
        """Test analyzing non-existent submission returns 404"""
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/speeding/analyze/nonexistent_submission_12345"
        )
        assert response.status_code == 404
        print("✓ Non-existent submission returns 404 for speeding analysis")
    
    def test_audio_check_nonexistent_submission(self, authenticated_session):
        """Test audio check on non-existent submission returns 404"""
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/audio-audit/check/nonexistent_submission_12345"
        )
        assert response.status_code == 404
        print("✓ Non-existent submission returns 404 for audio check")
    
    def test_ai_analyze_nonexistent_submission(self, authenticated_session):
        """Test AI analysis on non-existent submission returns 404"""
        response = authenticated_session.post(
            f"{BASE_URL}/api/quality-ai/ai-monitoring/analyze/nonexistent_submission_12345"
        )
        assert response.status_code == 404
        print("✓ Non-existent submission returns 404 for AI analysis")
    
    def test_resolve_nonexistent_alert(self, authenticated_session):
        """Test resolving non-existent alert returns 404"""
        response = authenticated_session.put(
            f"{BASE_URL}/api/quality-ai/alerts/nonexistent_alert_12345/resolve",
            json={"resolution": "Test resolution"}
        )
        assert response.status_code == 404
        print("✓ Non-existent alert returns 404 for resolve")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
