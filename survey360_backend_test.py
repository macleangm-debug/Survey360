#!/usr/bin/env python3
"""
Survey360 Template Library Backend API Testing Suite
Tests the template-related endpoints for Survey360
"""
import requests
import json
import sys
from datetime import datetime, timezone
from typing import Dict, Any, Optional

class Survey360TemplateAPITester:
    def __init__(self, base_url: str = "https://survey-demo.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.token = None
        self.user_info = None
        
        # Test results tracking
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test credentials provided
        self.test_user_email = "demo@survey360.io"
        self.test_user_password = "Test123!"
    
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
    
    def test_survey360_login(self):
        """Test Survey360 user login"""
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, status_code, data, _ = self.make_request('POST', '/survey360/auth/login', login_data)
        
        if success and isinstance(data, dict) and 'access_token' in data:
            token = data['access_token']
            user = data.get('user', {})
            self.set_auth_token(token)
            self.user_info = user
            self.log_test("Survey360 Login", True, 
                         f"Login successful for {user.get('email', 'N/A')}")
            return token
        else:
            self.log_test("Survey360 Login", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_get_templates_list(self):
        """Test GET /api/survey360/templates - should return list of 6 templates"""
        success, status_code, data, _ = self.make_request('GET', '/survey360/templates')
        
        if success and isinstance(data, list):
            if len(data) == 6:
                self.log_test("Get Templates List", True, 
                             f"Found {len(data)} templates as expected")
                
                # Verify template structure
                expected_templates = [
                    "customer-satisfaction", "employee-feedback", "event-registration",
                    "product-feedback", "market-research", "website-feedback"
                ]
                
                found_templates = [t.get('id') for t in data]
                missing_templates = [t for t in expected_templates if t not in found_templates]
                
                if missing_templates:
                    self.log_test("Template Structure", False, 
                                 f"Missing templates: {missing_templates}")
                else:
                    self.log_test("Template Structure", True, 
                                 "All expected templates found")
                
                return data
            else:
                self.log_test("Get Templates List", False, 
                             f"Expected 6 templates, got {len(data)}")
                return data
        else:
            self.log_test("Get Templates List", False, 
                         f"Status: {status_code}, Response: {data}")
            return []
    
    def test_get_specific_template(self, template_id: str = "customer-satisfaction"):
        """Test GET /api/survey360/templates/{id} - should return specific template"""
        success, status_code, data, _ = self.make_request('GET', f'/survey360/templates/{template_id}')
        
        if success and isinstance(data, dict):
            if data.get('id') == template_id:
                questions_count = len(data.get('questions', []))
                self.log_test(f"Get Specific Template ({template_id})", True, 
                             f"Template found with {questions_count} questions")
                
                # Verify required fields
                required_fields = ['id', 'name', 'description', 'category', 'questions']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Template Fields Validation", False, 
                                 f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Template Fields Validation", True, 
                                 "All required fields present")
                
                return data
            else:
                self.log_test(f"Get Specific Template ({template_id})", False, 
                             f"Wrong template ID returned: {data.get('id')}")
                return None
        else:
            self.log_test(f"Get Specific Template ({template_id})", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_create_survey_from_template(self, template_id: str = "customer-satisfaction"):
        """Test POST /api/survey360/templates/{id}/create - should create survey from template"""
        if not self.token:
            self.log_test("Create Survey From Template", False, 
                         "No authentication token available")
            return None
        
        success, status_code, data, _ = self.make_request('POST', f'/survey360/templates/{template_id}/create')
        
        if success and isinstance(data, dict):
            survey_id = data.get('id')
            survey_name = data.get('name')
            question_count = data.get('question_count', 0)
            
            self.log_test("Create Survey From Template", True, 
                         f"Survey created: {survey_name} with {question_count} questions")
            
            # Verify survey structure
            required_fields = ['id', 'name', 'description', 'questions', 'status']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Survey Creation Fields", False, 
                             f"Missing fields in created survey: {missing_fields}")
            else:
                self.log_test("Survey Creation Fields", True, 
                             "Created survey has all required fields")
            
            return survey_id
        else:
            self.log_test("Create Survey From Template", False, 
                         f"Status: {status_code}, Response: {data}")
            return None
    
    def test_template_categories(self, templates: list):
        """Test that templates have correct categories"""
        if not templates:
            self.log_test("Template Categories", False, "No templates to check")
            return
        
        expected_categories = ['feedback', 'hr', 'events', 'research']
        found_categories = set()
        
        for template in templates:
            category = template.get('category')
            if category:
                found_categories.add(category)
        
        missing_categories = [cat for cat in expected_categories if cat not in found_categories]
        
        if missing_categories:
            self.log_test("Template Categories", False, 
                         f"Missing categories: {missing_categories}")
        else:
            self.log_test("Template Categories", True, 
                         f"All expected categories found: {list(found_categories)}")
    
    def test_template_question_structure(self, template_data: dict):
        """Test that template questions have proper structure"""
        if not template_data:
            self.log_test("Template Question Structure", False, "No template data")
            return
        
        questions = template_data.get('questions', [])
        if not questions:
            self.log_test("Template Question Structure", False, "No questions in template")
            return
        
        valid_questions = 0
        required_question_fields = ['id', 'type', 'title', 'required']
        
        for i, question in enumerate(questions):
            missing_fields = [field for field in required_question_fields if field not in question]
            if not missing_fields:
                valid_questions += 1
            else:
                print(f"   Question {i+1} missing fields: {missing_fields}")
        
        if valid_questions == len(questions):
            self.log_test("Template Question Structure", True, 
                         f"All {len(questions)} questions have valid structure")
        else:
            self.log_test("Template Question Structure", False, 
                         f"Only {valid_questions}/{len(questions)} questions have valid structure")
    
    def run_template_test_suite(self):
        """Run complete template test suite"""
        print("🚀 Starting Survey360 Template Library Backend Test Suite")
        print("=" * 70)
        
        # Authentication
        token = self.test_survey360_login()
        
        if not token:
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test template endpoints
        templates = self.test_get_templates_list()
        
        if templates:
            # Test categories
            self.test_template_categories(templates)
            
            # Test specific template (customer-satisfaction)
            template_data = self.test_get_specific_template("customer-satisfaction")
            
            if template_data:
                # Test question structure
                self.test_template_question_structure(template_data)
                
                # Test creating survey from template
                survey_id = self.test_create_survey_from_template("customer-satisfaction")
                
                if survey_id:
                    print(f"✅ Survey created from template with ID: {survey_id}")
        
        # Test error case - non-existent template
        success, status_code, data, _ = self.make_request('GET', '/survey360/templates/non-existent', expected_status=404)
        self.log_test("Non-existent Template", success, 
                     f"Status: {status_code}, correctly returned 404")
        
        # Print summary
        print("=" * 70)
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
    tester = Survey360TemplateAPITester()
    success = tester.run_template_test_suite()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())