"""Survey360 - API Routes for the Survey360 Product"""
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import uuid
import hashlib
import jwt
import os
import base64

router = APIRouter(prefix="/survey360", tags=["Survey360"])

# JWT settings
JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")

# Helper function to check if survey is closed
def check_survey_closed(survey: dict, response_count: int) -> bool:
    """Check if survey is closed based on close_date or max_responses"""
    # Check close date
    if survey.get("close_date"):
        try:
            close_date = datetime.fromisoformat(survey["close_date"].replace("Z", "+00:00"))
            if datetime.now(timezone.utc) > close_date:
                return True
        except (ValueError, TypeError):
            pass
    
    # Check max responses
    if survey.get("max_responses") and response_count >= survey["max_responses"]:
        return True
    
    return False

# Models
class Survey360LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Survey360RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class Survey360UserResponse(BaseModel):
    id: str
    email: str
    name: str
    org_id: Optional[str] = None

class Survey360AuthResponse(BaseModel):
    user: Survey360UserResponse
    access_token: str

class Survey360OrgCreate(BaseModel):
    name: str

class Survey360OrgResponse(BaseModel):
    id: str
    name: str
    created_at: Optional[str] = None

class Survey360QuestionModel(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    options: Optional[List[str]] = None
    maxRating: Optional[int] = None
    # Simple skip logic: show this question only if condition is met
    showIf: Optional[dict] = None  # {"questionId": "q1", "equals": "Yes"}

class Survey360SurveyCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    org_id: Optional[str] = None
    questions: List[Survey360QuestionModel] = []
    # New settings
    close_date: Optional[str] = None  # ISO date string
    max_responses: Optional[int] = None
    thank_you_message: Optional[str] = None
    brand_color: Optional[str] = None  # Hex color like #14b8a6
    logo_url: Optional[str] = None  # Base64 data URL or external URL

class Survey360SurveyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[Survey360QuestionModel]] = None
    status: Optional[str] = None
    # New settings
    close_date: Optional[str] = None
    max_responses: Optional[int] = None
    thank_you_message: Optional[str] = None
    brand_color: Optional[str] = None
    logo_url: Optional[str] = None

class Survey360SurveyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    status: str = "draft"
    org_id: Optional[str] = None
    question_count: int = 0
    response_count: int = 0
    questions: List[dict] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    # New settings
    close_date: Optional[str] = None
    max_responses: Optional[int] = None
    thank_you_message: Optional[str] = None
    brand_color: Optional[str] = None
    is_closed: bool = False  # Computed field

class Survey360ResponseSubmit(BaseModel):
    respondent_email: Optional[str] = None
    respondent_name: Optional[str] = None
    answers: dict = {}

# Helper functions
def create_survey360_token(user_id: str) -> str:
    return jwt.encode(
        {"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7, "product": "survey360"},
        JWT_SECRET,
        algorithm="HS256"
    )

async def get_survey360_user(authorization: Optional[str] = Header(None)):
    from server import app
    db = app.state.db
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.survey360_users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@router.post("/auth/login", response_model=Survey360AuthResponse)
async def survey360_login(request: Survey360LoginRequest):
    from server import app
    db = app.state.db
    
    user = await db.survey360_users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if user.get("password_hash") != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_survey360_token(user["id"])
    return Survey360AuthResponse(
        user=Survey360UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            org_id=user.get("org_id")
        ),
        access_token=token
    )

@router.post("/auth/register", response_model=Survey360AuthResponse)
async def survey360_register(request: Survey360RegisterRequest):
    from server import app
    db = app.state.db
    
    existing = await db.survey360_users.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    
    # Create organization
    await db.survey360_orgs.insert_one({
        "id": org_id,
        "name": f"{request.name}'s Organization",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Create user
    user = {
        "id": user_id,
        "email": request.email,
        "name": request.name,
        "password_hash": hashlib.sha256(request.password.encode()).hexdigest(),
        "org_id": org_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.survey360_users.insert_one(user)
    
    token = create_survey360_token(user_id)
    return Survey360AuthResponse(
        user=Survey360UserResponse(id=user_id, email=request.email, name=request.name, org_id=org_id),
        access_token=token
    )

@router.get("/auth/me", response_model=Survey360UserResponse)
async def survey360_get_me(user=Depends(get_survey360_user)):
    return Survey360UserResponse(**user)

# Organization routes
@router.get("/organizations", response_model=List[Survey360OrgResponse])
async def survey360_list_organizations(user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    orgs = await db.survey360_orgs.find(
        {"id": user.get("org_id")},
        {"_id": 0}
    ).to_list(100)
    return [Survey360OrgResponse(**org) for org in orgs]

@router.post("/organizations", response_model=Survey360OrgResponse)
async def survey360_create_organization(data: Survey360OrgCreate, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    org_id = str(uuid.uuid4())
    org = {
        "id": org_id,
        "name": data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.survey360_orgs.insert_one(org)
    await db.survey360_users.update_one({"id": user["id"]}, {"$set": {"org_id": org_id}})
    
    return Survey360OrgResponse(**org)

# Survey routes
@router.get("/surveys", response_model=List[Survey360SurveyResponse])
async def survey360_list_surveys(org_id: Optional[str] = None, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    query = {"org_id": org_id or user.get("org_id")}
    surveys = await db.survey360_surveys.find(query, {"_id": 0}).to_list(100)
    
    result = []
    for s in surveys:
        response_count = await db.survey360_responses.count_documents({"survey_id": s["id"]})
        result.append(Survey360SurveyResponse(
            **s,
            question_count=len(s.get("questions", [])),
            response_count=response_count
        ))
    return result

@router.get("/surveys/{survey_id}", response_model=Survey360SurveyResponse)
async def survey360_get_survey(survey_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    return Survey360SurveyResponse(
        **survey,
        question_count=len(survey.get("questions", [])),
        response_count=response_count
    )

@router.post("/surveys", response_model=Survey360SurveyResponse)
async def survey360_create_survey(data: Survey360SurveyCreate, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    survey_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    survey = {
        "id": survey_id,
        "name": data.name,
        "description": data.description,
        "status": "draft",
        "org_id": data.org_id or user.get("org_id"),
        "questions": [q.dict() for q in data.questions],
        "close_date": data.close_date,
        "max_responses": data.max_responses,
        "thank_you_message": data.thank_you_message,
        "brand_color": data.brand_color,
        "created_at": now,
        "updated_at": now
    }
    await db.survey360_surveys.insert_one(survey)
    
    return Survey360SurveyResponse(
        **survey,
        question_count=len(data.questions),
        response_count=0,
        is_closed=False
    )

@router.put("/surveys/{survey_id}", response_model=Survey360SurveyResponse)
async def survey360_update_survey(survey_id: str, data: Survey360SurveyUpdate, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if data.name is not None:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.questions is not None:
        update_data["questions"] = [q.dict() for q in data.questions]
    if data.status is not None:
        update_data["status"] = data.status
    if data.close_date is not None:
        update_data["close_date"] = data.close_date
    if data.max_responses is not None:
        update_data["max_responses"] = data.max_responses
    if data.thank_you_message is not None:
        update_data["thank_you_message"] = data.thank_you_message
    if data.brand_color is not None:
        update_data["brand_color"] = data.brand_color
    
    await db.survey360_surveys.update_one({"id": survey_id}, {"$set": update_data})
    
    updated = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    
    # Check if survey is closed
    is_closed = check_survey_closed(updated, response_count)
    
    return Survey360SurveyResponse(
        **updated,
        question_count=len(updated.get("questions", [])),
        response_count=response_count,
        is_closed=is_closed
    )

@router.delete("/surveys/{survey_id}")
async def survey360_delete_survey(survey_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    result = await db.survey360_surveys.delete_one({"id": survey_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Survey not found")
    return {"message": "Survey deleted"}

@router.post("/surveys/{survey_id}/publish", response_model=Survey360SurveyResponse)
async def survey360_publish_survey(survey_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    await db.survey360_surveys.update_one(
        {"id": survey_id},
        {"$set": {"status": "published", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    updated = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    
    return Survey360SurveyResponse(
        **updated,
        question_count=len(updated.get("questions", [])),
        response_count=response_count
    )

@router.post("/surveys/{survey_id}/duplicate", response_model=Survey360SurveyResponse)
async def survey360_duplicate_survey(survey_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    new_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    new_survey = {
        **survey,
        "id": new_id,
        "name": f"{survey['name']} (Copy)",
        "status": "draft",
        "created_at": now,
        "updated_at": now
    }
    await db.survey360_surveys.insert_one(new_survey)
    
    return Survey360SurveyResponse(
        **new_survey,
        question_count=len(new_survey.get("questions", [])),
        response_count=0
    )

# Response routes (authenticated)
class Survey360ResponseItem(BaseModel):
    id: str
    survey_id: str
    respondent_email: Optional[str] = None
    respondent_name: Optional[str] = None
    status: str = "completed"
    answers: dict = {}
    submitted_at: str
    completion_time: Optional[int] = None

@router.get("/surveys/{survey_id}/responses", response_model=List[Survey360ResponseItem])
async def survey360_list_responses(survey_id: str, page: int = 1, limit: int = 50, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    skip = (page - 1) * limit
    responses = await db.survey360_responses.find(
        {"survey_id": survey_id},
        {"_id": 0}
    ).sort("submitted_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [Survey360ResponseItem(**r) for r in responses]

@router.get("/surveys/{survey_id}/responses/{response_id}")
async def survey360_get_response(survey_id: str, response_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    response = await db.survey360_responses.find_one(
        {"id": response_id, "survey_id": survey_id},
        {"_id": 0}
    )
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    
    return response

# Dashboard routes
@router.get("/dashboard/stats")
async def survey360_get_dashboard_stats(org_id: Optional[str] = None, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    org = org_id or user.get("org_id")
    
    total_surveys = await db.survey360_surveys.count_documents({"org_id": org})
    active_surveys = await db.survey360_surveys.count_documents({"org_id": org, "status": "published"})
    
    surveys = await db.survey360_surveys.find({"org_id": org}, {"id": 1, "_id": 0}).to_list(1000)
    survey_ids = [s["id"] for s in surveys]
    
    total_responses = await db.survey360_responses.count_documents({"survey_id": {"$in": survey_ids}})
    
    return {
        "total_surveys": total_surveys,
        "active_surveys": active_surveys,
        "total_responses": total_responses,
        "response_rate": 78
    }

@router.get("/dashboard/activity")
async def survey360_get_recent_activity(org_id: Optional[str] = None, limit: int = 10, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    org = org_id or user.get("org_id")
    
    surveys = await db.survey360_surveys.find({"org_id": org}, {"id": 1, "name": 1, "_id": 0}).to_list(1000)
    survey_map = {s["id"]: s["name"] for s in surveys}
    survey_ids = list(survey_map.keys())
    
    responses = await db.survey360_responses.find(
        {"survey_id": {"$in": survey_ids}},
        {"_id": 0}
    ).sort("submitted_at", -1).limit(limit).to_list(limit)
    
    return [
        {
            "user_name": r.get("respondent_name", "Anonymous"),
            "survey_name": survey_map.get(r["survey_id"], "Unknown Survey"),
            "status": r.get("status", "completed"),
            "timestamp": r.get("submitted_at")
        }
        for r in responses
    ]

# Create demo user on startup
async def create_survey360_demo_user(db):
    demo_user = await db.survey360_users.find_one({"email": "demo@survey360.io"})
    if not demo_user:
        demo_org_id = str(uuid.uuid4())
        await db.survey360_users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "demo@survey360.io",
            "name": "Demo User",
            "password_hash": hashlib.sha256("Test123!".encode()).hexdigest(),
            "org_id": demo_org_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.survey360_orgs.insert_one({
            "id": demo_org_id,
            "name": "Demo Organization",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        print("Survey360 demo user created")

# ============================================
# PUBLIC ROUTES (No Authentication Required)
# ============================================

class PublicResponseSubmit(BaseModel):
    respondent_email: Optional[str] = None
    respondent_name: Optional[str] = None
    answers: dict = {}
    completion_time: Optional[int] = None

@router.get("/public/surveys/{survey_id}")
async def public_get_survey(survey_id: str):
    """Public endpoint to get a published survey for respondents"""
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one(
        {"id": survey_id, "status": "published"}, 
        {"_id": 0}
    )
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or not published")
    
    # Check if survey is closed
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    is_closed = check_survey_closed(survey, response_count)
    
    return {**survey, "is_closed": is_closed, "response_count": response_count}

@router.post("/public/surveys/{survey_id}/responses")
async def public_submit_response(survey_id: str, data: PublicResponseSubmit):
    """Public endpoint to submit a survey response"""
    from server import app
    db = app.state.db
    
    # Verify survey exists and is published
    survey = await db.survey360_surveys.find_one(
        {"id": survey_id, "status": "published"}, 
        {"_id": 0}
    )
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found or not published")
    
    # Check if survey is closed
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    if check_survey_closed(survey, response_count):
        raise HTTPException(status_code=400, detail="This survey is no longer accepting responses")
    
    response_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    response = {
        "id": response_id,
        "survey_id": survey_id,
        "respondent_email": data.respondent_email,
        "respondent_name": data.respondent_name,
        "status": "completed",
        "answers": data.answers,
        "submitted_at": now,
        "completion_time": data.completion_time
    }
    await db.survey360_responses.insert_one(response)
    
    return {
        "id": response_id, 
        "message": "Response submitted successfully",
        "thank_you_message": survey.get("thank_you_message")
    }

# ============================================
# ANALYTICS ENDPOINT
# ============================================

@router.get("/surveys/{survey_id}/analytics")
async def survey360_get_analytics(survey_id: str, user=Depends(get_survey360_user)):
    """Get basic analytics for a survey - pie/bar chart data"""
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    responses = await db.survey360_responses.find(
        {"survey_id": survey_id},
        {"_id": 0, "answers": 1}
    ).to_list(10000)
    
    analytics = {}
    questions = survey.get("questions", [])
    
    for question in questions:
        q_id = question["id"]
        q_type = question["type"]
        
        # Only generate analytics for certain question types
        if q_type in ["single_choice", "multiple_choice", "dropdown", "rating"]:
            answer_counts = {}
            
            for resp in responses:
                answer = resp.get("answers", {}).get(q_id)
                if answer is not None:
                    if q_type == "multiple_choice" and isinstance(answer, list):
                        for a in answer:
                            answer_counts[a] = answer_counts.get(a, 0) + 1
                    else:
                        answer_counts[str(answer)] = answer_counts.get(str(answer), 0) + 1
            
            # Convert to chart data format
            chart_data = [
                {"name": k, "value": v, "percent": round(v / len(responses) * 100, 1) if responses else 0}
                for k, v in sorted(answer_counts.items(), key=lambda x: -x[1])
            ]
            
            analytics[q_id] = {
                "question_id": q_id,
                "question_title": question["title"],
                "question_type": q_type,
                "total_responses": len(responses),
                "chart_data": chart_data,
                "options": question.get("options", [])
            }
    
    return {
        "survey_id": survey_id,
        "total_responses": len(responses),
        "questions": analytics
    }

