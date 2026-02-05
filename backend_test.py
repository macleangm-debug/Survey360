#!/usr/bin/env python3
"""
DataPulse Backend API Testing Suite
Tests all major endpoints with provided test data
"""
import requests
import json
import sys
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class DataPulseAPITester:
    def __init__(self, base_url: str = "https://enumerator-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.token = None
        self.user_info = None
        
        # Test results tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data provided by main agent
        self.test_user_email = "test@datapulse.io"
        self.test_user_password = "Test123!"
        self.test_org_id = "a07e901a-bd5f-450d-8533-ed4f7ec629a5"
        self.test_project_id = "dcb2adc9-c5e2-4413-8470-09c02a52b437"
        self.test_form_id = "205a0b57-cf27-495a-a046-398d02fe23dc"
    
    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })
        
        if details:
            print(f"   Details: {details}")
        print()
    
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            return success, response.status_code, response_data, response
            
        except Exception as e:
            return False, 0, str(e), None
    
    def set_auth_token(self, token: str):
        """Set authorization header"""
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def test_health_check(self):
        """Test basic health check"""
        success, status_code, data, _ = self.make_request('GET', '/health')
        self.log_test("Health Check", success and status_code == 200, 
                     f"Status: {status_code}, Response: {data}")
    
    def test_user_registration(self):
        """Test user registration with new user"""
        # Use timestamp to make email unique
        timestamp = int(datetime.now().timestamp())
        reg_data = {
            "email": f"testuser_{timestamp}@datapulse.io",
            "password": "TestPassword123!",
            "name": f"Test User {timestamp}"
        }
        
        success, status_code, data, _ = self.make_request('POST', '/auth/register', reg_data, 200)
        
        if success and isinstance(data, dict) and 'access_token' in data:
            self.log_test("User Registration", True, f"New user registered successfully")
            return data.get('access_token')
        else:
            self.log_test("User Registration", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_user_login(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, status_code, data, _ = self.make_request('POST', '/auth/login', login_data)
        
        if success and isinstance(data, dict) and 'access_token' in data:
            token = data['access_token']
            user = data.get('user', {})
            self.set_auth_token(token)
            self.user_info = user
            self.log_test("User Login", True, 
                         f"Login successful for {user.get('email', 'N/A')}")
            return token
        else:
            self.log_test("User Login", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_get_current_user(self):
        """Test getting current user info"""
        success, status_code, data, _ = self.make_request('GET', '/auth/me')
        
        if success and isinstance(data, dict):
            self.log_test("Get Current User", True, 
                         f"User: {data.get('email', 'N/A')}")
        else:
            self.log_test("Get Current User", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_list_organizations(self):
        """Test listing user's organizations"""
        success, status_code, data, _ = self.make_request('GET', '/organizations')
        
        if success and isinstance(data, list):
            org_count = len(data)
            self.log_test("List Organizations", True, 
                         f"Found {org_count} organizations")
            return data
        else:
            self.log_test("List Organizations", False, 
                         f"Status: {status_code}, Response: {data}")
            return []
    
    def test_get_organization(self, org_id: str):
        """Test getting specific organization"""
        success, status_code, data, _ = self.make_request('GET', f'/organizations/{org_id}')
        
        if success and isinstance(data, dict):
            self.log_test("Get Organization", True, 
                         f"Org: {data.get('name', 'N/A')}")
        else:
            self.log_test("Get Organization", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_create_organization(self):
        """Test creating a new organization"""
        timestamp = int(datetime.now().timestamp())
        org_data = {
            "name": f"Test Organization {timestamp}",
            "slug": f"test-org-{timestamp}",
            "description": "Test organization for API testing"
        }
        
        success, status_code, data, _ = self.make_request('POST', '/organizations', org_data, 200)
        
        if success and isinstance(data, dict):
            self.log_test("Create Organization", True, 
                         f"Created: {data.get('name', 'N/A')}")
            return data.get('id')
        else:
            self.log_test("Create Organization", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_list_projects(self, org_id: str):
        """Test listing projects in organization"""
        success, status_code, data, _ = self.make_request('GET', f'/projects?org_id={org_id}')
        
        if success and isinstance(data, list):
            project_count = len(data)
            self.log_test("List Projects", True, 
                         f"Found {project_count} projects")
            return data
        else:
            self.log_test("List Projects", False, 
                         f"Status: {status_code}, Response: {data}")
            return []
    
    def test_create_project(self, org_id: str):
        """Test creating a new project"""
        timestamp = int(datetime.now().timestamp())
        project_data = {
            "name": f"Test Project {timestamp}",
            "description": "Test project for API testing",
            "org_id": org_id,
            "settings": {"test": True}
        }
        
        success, status_code, data, _ = self.make_request('POST', '/projects', project_data, 201)
        
        if success and isinstance(data, dict):
            self.log_test("Create Project", True, 
                         f"Created: {data.get('name', 'N/A')}")
            return data.get('id')
        else:
            self.log_test("Create Project", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_get_project(self, project_id: str):
        """Test getting specific project"""
        success, status_code, data, _ = self.make_request('GET', f'/projects/{project_id}')
        
        if success and isinstance(data, dict):
            self.log_test("Get Project", True, 
                         f"Project: {data.get('name', 'N/A')}")
        else:
            self.log_test("Get Project", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_list_forms(self, project_id: str):
        """Test listing forms in project"""
        success, status_code, data, _ = self.make_request('GET', f'/forms?project_id={project_id}')
        
        if success and isinstance(data, list):
            form_count = len(data)
            self.log_test("List Forms", True, 
                         f"Found {form_count} forms")
            return data
        else:
            self.log_test("List Forms", False, 
                         f"Status: {status_code}, Response: {data}")
            return []
    
    def test_create_form(self, project_id: str):
        """Test creating a new form with fields"""
        timestamp = int(datetime.now().timestamp())
        form_data = {
            "name": f"Test Form {timestamp}",
            "description": "Test form for API testing",
            "project_id": project_id,
            "default_language": "en",
            "languages": ["en", "sw"],
            "fields": [
                {
                    "type": "text",
                    "name": "respondent_name",
                    "label": "Respondent Name",
                    "validation": {"required": True}
                },
                {
                    "type": "number",
                    "name": "age",
                    "label": "Age",
                    "validation": {"required": True, "min_value": 0, "max_value": 150}
                },
                {
                    "type": "select",
                    "name": "gender",
                    "label": "Gender",
                    "options": [
                        {"value": "male", "label": "Male"},
                        {"value": "female", "label": "Female"},
                        {"value": "other", "label": "Other"}
                    ],
                    "validation": {"required": True}
                }
            ]
        }
        
        success, status_code, data, _ = self.make_request('POST', '/forms', form_data, 201)
        
        if success and isinstance(data, dict):
            self.log_test("Create Form", True, 
                         f"Created: {data.get('name', 'N/A')} with {data.get('field_count', 0)} fields")
            return data.get('id')
        else:
            self.log_test("Create Form", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_get_form(self, form_id: str):
        """Test getting specific form with details"""
        success, status_code, data, _ = self.make_request('GET', f'/forms/{form_id}')
        
        if success and isinstance(data, dict):
            field_count = len(data.get('fields', []))
            self.log_test("Get Form", True, 
                         f"Form: {data.get('name', 'N/A')} with {field_count} fields")
        else:
            self.log_test("Get Form", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_publish_form(self, form_id: str):
        """Test publishing a form"""
        success, status_code, data, _ = self.make_request('POST', f'/forms/{form_id}/publish')
        
        if success:
            self.log_test("Publish Form", True, 
                         f"Published version: {data.get('version', 'N/A')}")
        else:
            self.log_test("Publish Form", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_create_submission(self, form_id: str):
        """Test creating a form submission"""
        submission_data = {
            "form_id": form_id,
            "form_version": 1,
            "data": {
                "respondent_name": "John Doe Test",
                "age": 30,
                "gender": "male",
                "_gps": {
                    "latitude": -1.2921,
                    "longitude": 36.8219,
                    "accuracy": 10.5
                }
            },
            "device_id": "test-device-001",
            "device_info": {
                "platform": "web",
                "version": "test-1.0"
            }
        }
        
        success, status_code, data, _ = self.make_request('POST', '/submissions', submission_data, 201)
        
        if success and isinstance(data, dict):
            quality_score = data.get('quality_score', 'N/A')
            self.log_test("Create Submission", True, 
                         f"Submitted with quality score: {quality_score}")
            return data.get('id')
        else:
            self.log_test("Create Submission", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_list_submissions(self, form_id: str):
        """Test listing form submissions"""
        success, status_code, data, _ = self.make_request('GET', f'/submissions?form_id={form_id}')
        
        if success and isinstance(data, list):
            submission_count = len(data)
            self.log_test("List Submissions", True, 
                         f"Found {submission_count} submissions")
            return data
        else:
            self.log_test("List Submissions", False, 
                         f"Status: {status_code}, Response: {data}")
            return []
    
    def test_dashboard_stats(self, org_id: str):
        """Test dashboard statistics endpoint"""
        success, status_code, data, _ = self.make_request('GET', f'/dashboard/stats?org_id={org_id}')
        
        if success and isinstance(data, dict):
            projects = data.get('total_projects', 0)
            forms = data.get('total_forms', 0)
            submissions = data.get('total_submissions', 0)
            self.log_test("Dashboard Stats", True, 
                         f"Projects: {projects}, Forms: {forms}, Submissions: {submissions}")
        else:
            self.log_test("Dashboard Stats", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_submission_trends(self, org_id: str):
        """Test submission trends endpoint"""
        success, status_code, data, _ = self.make_request('GET', f'/dashboard/submission-trends?org_id={org_id}&days=7')
        
        if success and isinstance(data, list):
            self.log_test("Submission Trends", True, 
                         f"Got {len(data)} data points")
        else:
            self.log_test("Submission Trends", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def test_quality_metrics(self, org_id: str):
        """Test data quality metrics endpoint"""
        success, status_code, data, _ = self.make_request('GET', f'/dashboard/quality-metrics?org_id={org_id}')
        
        if success and isinstance(data, dict):
            avg_score = data.get('avg_quality_score', 0)
            flagged = data.get('flagged_count', 0)
            self.log_test("Quality Metrics", True, 
                         f"Avg Score: {avg_score}%, Flagged: {flagged}")
        else:
            self.log_test("Quality Metrics", False, 
                         f"Status: {status_code}, Response: {data}")
    
    def run_full_test_suite(self):
        """Run complete test suite"""
        print("🚀 Starting DataPulse Backend API Test Suite")
        print("=" * 60)
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        token = self.test_user_login()
        
        if not token:
            print("❌ Cannot proceed without authentication")
            return False
        
        self.test_get_current_user()
        
        # Organization tests
        organizations = self.test_list_organizations()
        
        # Use provided org ID or create new one
        test_org_id = None
        if organizations:
            # Try to find the test organization
            for org in organizations:
                if org.get('id') == self.test_org_id:
                    test_org_id = self.test_org_id
                    break
            
            if not test_org_id:
                test_org_id = organizations[0].get('id')
        
        if not test_org_id:
            test_org_id = self.test_create_organization()
        
        if test_org_id:
            self.test_get_organization(test_org_id)
            
            # Project tests
            projects = self.test_list_projects(test_org_id)
            
            # Use provided project ID or create new one
            test_project_id = None
            if projects:
                for project in projects:
                    if project.get('id') == self.test_project_id:
                        test_project_id = self.test_project_id
                        break
                
                if not test_project_id:
                    test_project_id = projects[0].get('id')
            
            if not test_project_id:
                test_project_id = self.test_create_project(test_org_id)
            
            if test_project_id:
                self.test_get_project(test_project_id)
                
                # Form tests
                forms = self.test_list_forms(test_project_id)
                
                # Use provided form ID or create new one
                test_form_id = None
                if forms:
                    for form in forms:
                        if form.get('id') == self.test_form_id:
                            test_form_id = self.test_form_id
                            break
                    
                    if not test_form_id:
                        test_form_id = forms[0].get('id')
                
                if not test_form_id:
                    test_form_id = self.test_create_form(test_project_id)
                
                if test_form_id:
                    self.test_get_form(test_form_id)
                    self.test_publish_form(test_form_id)
                    
                    # Submission tests
                    submission_id = self.test_create_submission(test_form_id)
                    self.test_list_submissions(test_form_id)
            
            # Dashboard tests
            self.test_dashboard_stats(test_org_id)
            self.test_submission_trends(test_org_id)
            self.test_quality_metrics(test_org_id)
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results Summary:")
        print(f"   Total Tests: {self.tests_run}")
        print(f"   Passed: {self.tests_passed}")
        print(f"   Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print(f"\n❌ Some tests failed. Check details above.")
            return False
        else:
            print(f"\n✅ All tests passed successfully!")
            return True

def main():
    """Main test runner"""
    tester = DataPulseAPITester()
    success = tester.run_full_test_suite()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())