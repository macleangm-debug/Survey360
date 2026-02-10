"""Survey360 - API Routes for the Survey360 Product with High-Traffic Caching"""
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
import uuid
import hashlib
import jwt
import os
import base64

# Import caching utilities
from utils.cache import cache, CacheConfig, invalidate_survey_cache, invalidate_user_cache

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

# Helper function to get current billing period
def get_billing_period():
    """Get the current billing period (month start and end)"""
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    # Get last day of month
    if now.month == 12:
        period_end = period_start.replace(year=now.year + 1, month=1) - timedelta(seconds=1)
    else:
        period_end = period_start.replace(month=now.month + 1) - timedelta(seconds=1)
    return period_start, period_end

# Helper function to check usage limits
async def check_usage_limits(db, org_id: str, check_type: str = 'survey'):
    """Check if organization has reached their plan limits"""
    # Get organization's plan (default to free)
    org = await db.survey360_orgs.find_one({"id": org_id}, {"_id": 0})
    plan = org.get("plan", "free") if org else "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    
    if check_type == 'survey':
        # Check survey count
        if limits['surveys'] == -1:
            return True, None  # Unlimited
        survey_count = await db.survey360_surveys.count_documents({"org_id": org_id})
        if survey_count >= limits['surveys']:
            return False, f"Survey limit reached ({limits['surveys']} surveys). Please upgrade your plan."
    
    elif check_type == 'response':
        # Check response count for current month
        if limits['responses_per_month'] == -1:
            return True, None  # Unlimited
        period_start, _ = get_billing_period()
        response_count = await db.survey360_responses.count_documents({
            "submitted_at": {"$gte": period_start.isoformat()}
        })
        if response_count >= limits['responses_per_month']:
            return False, f"Monthly response limit reached ({limits['responses_per_month']} responses). Please upgrade your plan."
    
    return True, None

from datetime import timedelta

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

# Plan and Usage Models
PLAN_LIMITS = {
    'free': {'surveys': 3, 'responses_per_month': 100, 'users': 1},
    'starter': {'surveys': -1, 'responses_per_month': 500, 'users': 1},
    'professional': {'surveys': -1, 'responses_per_month': 2500, 'users': 3},
    'business': {'surveys': -1, 'responses_per_month': 10000, 'users': -1},
}

class Survey360UsageResponse(BaseModel):
    plan: str
    surveys_used: int
    surveys_limit: int  # -1 means unlimited
    responses_used: int
    responses_limit: int
    period_start: str
    period_end: str

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
    logo_url: Optional[str] = None
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

# Usage endpoint
@router.get("/usage", response_model=Survey360UsageResponse)
async def survey360_get_usage(user=Depends(get_survey360_user)):
    """Get current usage and limits for the organization"""
    from server import app
    db = app.state.db
    
    org_id = user.get("org_id")
    
    # Get organization's plan
    org = await db.survey360_orgs.find_one({"id": org_id}, {"_id": 0})
    plan = org.get("plan", "free") if org else "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    
    # Count surveys
    surveys_used = await db.survey360_surveys.count_documents({"org_id": org_id})
    
    # Count responses this month
    period_start, period_end = get_billing_period()
    
    # Get all survey IDs for this org
    survey_ids = [s["id"] async for s in db.survey360_surveys.find({"org_id": org_id}, {"id": 1})]
    
    responses_used = await db.survey360_responses.count_documents({
        "survey_id": {"$in": survey_ids},
        "submitted_at": {"$gte": period_start.isoformat()}
    })
    
    return Survey360UsageResponse(
        plan=plan,
        surveys_used=surveys_used,
        surveys_limit=limits['surveys'],
        responses_used=responses_used,
        responses_limit=limits['responses_per_month'],
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat()
    )

# Survey routes
@router.get("/surveys", response_model=List[Survey360SurveyResponse])
async def survey360_list_surveys(org_id: Optional[str] = None, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    target_org_id = org_id or user.get("org_id")
    cache_key = f"survey360:surveys_list:{target_org_id}"
    
    # Try cache (short TTL since list changes often)
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    query = {"org_id": target_org_id}
    surveys = await db.survey360_surveys.find(query, {"_id": 0}).to_list(100)
    
    # Batch fetch response counts for efficiency
    survey_ids = [s["id"] for s in surveys]
    pipeline = [
        {"$match": {"survey_id": {"$in": survey_ids}}},
        {"$group": {"_id": "$survey_id", "count": {"$sum": 1}}}
    ]
    counts = {r["_id"]: r["count"] async for r in db.survey360_responses.aggregate(pipeline)}
    
    result = []
    for s in surveys:
        response_count = counts.get(s["id"], 0)
        result.append(Survey360SurveyResponse(
            **s,
            question_count=len(s.get("questions", [])),
            response_count=response_count
        ).model_dump())
    
    # Cache for 30 seconds
    await cache.set(cache_key, result, 30)
    return result

@router.get("/surveys/{survey_id}", response_model=Survey360SurveyResponse)
async def survey360_get_survey(survey_id: str, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    cache_key = f"survey360:survey:{survey_id}"
    
    # Try cache
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    response_count = await db.survey360_responses.count_documents({"survey_id": survey_id})
    result = Survey360SurveyResponse(
        **survey,
        question_count=len(survey.get("questions", [])),
        response_count=response_count
    ).model_dump()
    
    # Cache for 60 seconds
    await cache.set(cache_key, result, 60)
    return result

@router.post("/surveys", response_model=Survey360SurveyResponse)
async def survey360_create_survey(data: Survey360SurveyCreate, user=Depends(get_survey360_user)):
    from server import app
    db = app.state.db
    
    # Check survey limits
    org_id = data.org_id or user.get("org_id")
    can_create, error_msg = await check_usage_limits(db, org_id, 'survey')
    if not can_create:
        raise HTTPException(status_code=403, detail=error_msg)
    
    survey_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    survey = {
        "id": survey_id,
        "name": data.name,
        "description": data.description,
        "status": "draft",
        "org_id": org_id,
        "questions": [q.dict() for q in data.questions],
        "close_date": data.close_date,
        "max_responses": data.max_responses,
        "thank_you_message": data.thank_you_message,
        "brand_color": data.brand_color,
        "logo_url": data.logo_url,
        "created_at": now,
        "updated_at": now
    }
    await db.survey360_surveys.insert_one(survey)
    
    # Invalidate user's survey list cache
    await cache.delete(f"survey360:surveys_list:{org_id}")
    
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
    if data.logo_url is not None:
        update_data["logo_url"] = data.logo_url
    
    await db.survey360_surveys.update_one({"id": survey_id}, {"$set": update_data})
    
    # Invalidate caches
    await invalidate_survey_cache(survey_id)
    await cache.delete(f"survey360:surveys_list:{survey.get('org_id')}")
    
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
    
    # Get org_id before delete for cache invalidation
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"org_id": 1})
    
    result = await db.survey360_surveys.delete_one({"id": survey_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Invalidate caches
    await invalidate_survey_cache(survey_id)
    if survey:
        await cache.delete(f"survey360:surveys_list:{survey.get('org_id')}")
    
    return {"message": "Survey deleted"}

@router.post("/surveys/{survey_id}/logo")
async def survey360_upload_logo(survey_id: str, file: UploadFile = File(...), user=Depends(get_survey360_user)):
    """Upload a logo for a survey - stored as base64 data URL"""
    from server import app
    db = app.state.db
    
    # Verify survey exists
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: PNG, JPEG, GIF, WebP, SVG")
    
    # Read file and convert to base64
    contents = await file.read()
    
    # Limit file size to 500KB
    if len(contents) > 500 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 500KB")
    
    # Create data URL
    base64_data = base64.b64encode(contents).decode('utf-8')
    logo_url = f"data:{file.content_type};base64,{base64_data}"
    
    # Update survey with logo
    await db.survey360_surveys.update_one(
        {"id": survey_id},
        {"$set": {"logo_url": logo_url, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"logo_url": logo_url, "message": "Logo uploaded successfully"}

@router.delete("/surveys/{survey_id}/logo")
async def survey360_delete_logo(survey_id: str, user=Depends(get_survey360_user)):
    """Remove the logo from a survey"""
    from server import app
    db = app.state.db
    
    survey = await db.survey360_surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    await db.survey360_surveys.update_one(
        {"id": survey_id},
        {"$set": {"logo_url": None, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Logo removed"}

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
            "plan": "professional",  # Give demo org a professional plan for testing
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
    
    # Check organization's response limits
    org_id = survey.get("org_id")
    if org_id:
        can_submit, error_msg = await check_usage_limits(db, org_id, 'response')
        if not can_submit:
            raise HTTPException(status_code=403, detail="This survey has reached its monthly response limit. Please contact the survey owner.")
    
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

# ============================================
# SURVEY TEMPLATES
# ============================================

SURVEY_TEMPLATES = [
    {
        "id": "customer-satisfaction",
        "name": "Customer Satisfaction",
        "description": "Measure customer happiness with your product or service",
        "category": "feedback",
        "icon": "smile",
        "color": "#14b8a6",
        "questions": [
            {"id": "q1", "type": "rating", "title": "Overall, how satisfied are you with our product/service?", "required": True, "maxRating": 5},
            {"id": "q2", "type": "single_choice", "title": "How likely are you to recommend us to a friend or colleague?", "required": True, "options": ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]},
            {"id": "q3", "type": "single_choice", "title": "How would you rate the quality of our product/service?", "required": True, "options": ["Poor", "Fair", "Good", "Very Good", "Excellent"]},
            {"id": "q4", "type": "single_choice", "title": "How would you rate our customer support?", "required": False, "options": ["Poor", "Fair", "Good", "Very Good", "Excellent"]},
            {"id": "q5", "type": "multiple_choice", "title": "What do you like most about our product/service?", "required": False, "options": ["Quality", "Price", "Customer Service", "Ease of Use", "Features", "Reliability"]},
            {"id": "q6", "type": "long_text", "title": "What could we do to improve your experience?", "required": False},
            {"id": "q7", "type": "short_text", "title": "Any additional comments or suggestions?", "required": False}
        ]
    },
    {
        "id": "employee-feedback",
        "name": "Employee Feedback",
        "description": "Gather insights from your team about workplace satisfaction",
        "category": "hr",
        "icon": "users",
        "color": "#8b5cf6",
        "questions": [
            {"id": "q1", "type": "dropdown", "title": "Which department do you work in?", "required": True, "options": ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Other"]},
            {"id": "q2", "type": "rating", "title": "How satisfied are you with your job overall?", "required": True, "maxRating": 5},
            {"id": "q3", "type": "single_choice", "title": "Do you feel valued at work?", "required": True, "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]},
            {"id": "q4", "type": "single_choice", "title": "How would you rate the work-life balance?", "required": True, "options": ["Very Poor", "Poor", "Average", "Good", "Excellent"]},
            {"id": "q5", "type": "single_choice", "title": "Do you have the resources needed to do your job effectively?", "required": True, "options": ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]},
            {"id": "q6", "type": "multiple_choice", "title": "What benefits matter most to you?",  "required": False, "options": ["Health Insurance", "Flexible Hours", "Remote Work", "Professional Development", "Retirement Plans", "Paid Time Off"]},
            {"id": "q7", "type": "single_choice", "title": "How likely are you to recommend this company as a place to work?", "required": True, "options": ["Very Unlikely", "Unlikely", "Neutral", "Likely", "Very Likely"]},
            {"id": "q8", "type": "long_text", "title": "What suggestions do you have to improve the workplace?", "required": False}
        ]
    },
    {
        "id": "event-registration",
        "name": "Event Registration",
        "description": "Collect attendee information for your upcoming event",
        "category": "events",
        "icon": "calendar",
        "color": "#f59e0b",
        "questions": [
            {"id": "q1", "type": "short_text", "title": "Full Name", "required": True},
            {"id": "q2", "type": "email", "title": "Email Address", "required": True},
            {"id": "q3", "type": "phone", "title": "Phone Number", "required": False},
            {"id": "q4", "type": "short_text", "title": "Company/Organization", "required": False},
            {"id": "q5", "type": "short_text", "title": "Job Title", "required": False},
            {"id": "q6", "type": "single_choice", "title": "How did you hear about this event?", "required": True, "options": ["Email", "Social Media", "Website", "Word of Mouth", "Advertisement", "Other"]},
            {"id": "q7", "type": "single_choice", "title": "Will you be attending in person or virtually?", "required": True, "options": ["In Person", "Virtual"]},
            {"id": "q8", "type": "multiple_choice", "title": "Which sessions are you interested in?", "required": False, "options": ["Keynote Speech", "Workshop A", "Workshop B", "Networking Session", "Panel Discussion", "All Sessions"]},
            {"id": "q9", "type": "single_choice", "title": "Do you have any dietary restrictions?", "required": False, "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Other"]},
            {"id": "q10", "type": "long_text", "title": "Any special accommodations or questions?", "required": False}
        ]
    },
    {
        "id": "product-feedback",
        "name": "Product Feedback",
        "description": "Get user feedback on your product features and usability",
        "category": "feedback",
        "icon": "package",
        "color": "#3b82f6",
        "questions": [
            {"id": "q1", "type": "single_choice", "title": "How long have you been using our product?", "required": True, "options": ["Less than 1 month", "1-6 months", "6-12 months", "1-2 years", "More than 2 years"]},
            {"id": "q2", "type": "rating", "title": "How easy is our product to use?", "required": True, "maxRating": 5},
            {"id": "q3", "type": "multiple_choice", "title": "Which features do you use most frequently?", "required": True, "options": ["Feature A", "Feature B", "Feature C", "Feature D", "Feature E"]},
            {"id": "q4", "type": "single_choice", "title": "How well does our product meet your needs?", "required": True, "options": ["Not at all", "Slightly", "Moderately", "Very Well", "Completely"]},
            {"id": "q5", "type": "rating", "title": "How would you rate the product's performance?", "required": True, "maxRating": 5},
            {"id": "q6", "type": "long_text", "title": "What features would you like to see added?", "required": False},
            {"id": "q7", "type": "long_text", "title": "What problems have you encountered while using the product?", "required": False}
        ]
    },
    {
        "id": "market-research",
        "name": "Market Research",
        "description": "Understand your target audience and market trends",
        "category": "research",
        "icon": "trending-up",
        "color": "#ec4899",
        "questions": [
            {"id": "q1", "type": "single_choice", "title": "What is your age range?", "required": True, "options": ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]},
            {"id": "q2", "type": "single_choice", "title": "What is your gender?", "required": False, "options": ["Male", "Female", "Non-binary", "Prefer not to say"]},
            {"id": "q3", "type": "dropdown", "title": "What is your household income?", "required": False, "options": ["Under $25,000", "$25,000-$50,000", "$50,000-$75,000", "$75,000-$100,000", "$100,000-$150,000", "Over $150,000", "Prefer not to say"]},
            {"id": "q4", "type": "single_choice", "title": "How often do you purchase products in this category?", "required": True, "options": ["Never", "Rarely", "Sometimes", "Often", "Very Often"]},
            {"id": "q5", "type": "multiple_choice", "title": "What factors influence your purchasing decisions?", "required": True, "options": ["Price", "Quality", "Brand", "Reviews", "Recommendations", "Convenience"]},
            {"id": "q6", "type": "single_choice", "title": "Where do you typically shop for these products?", "required": True, "options": ["Online Only", "In-Store Only", "Both Online and In-Store"]},
            {"id": "q7", "type": "rating", "title": "How important is brand reputation to you?", "required": True, "maxRating": 5},
            {"id": "q8", "type": "long_text", "title": "What would make you switch to a different brand?", "required": False}
        ]
    },
    {
        "id": "website-feedback",
        "name": "Website Feedback",
        "description": "Improve your website based on user experience feedback",
        "category": "feedback",
        "icon": "globe",
        "color": "#06b6d4",
        "questions": [
            {"id": "q1", "type": "single_choice", "title": "What was the purpose of your visit today?", "required": True, "options": ["Browse Products", "Make a Purchase", "Get Information", "Contact Support", "Other"]},
            {"id": "q2", "type": "single_choice", "title": "Did you find what you were looking for?", "required": True, "options": ["Yes, easily", "Yes, with some difficulty", "No"]},
            {"id": "q3", "type": "rating", "title": "How would you rate the overall design of our website?", "required": True, "maxRating": 5},
            {"id": "q4", "type": "rating", "title": "How easy was it to navigate our website?", "required": True, "maxRating": 5},
            {"id": "q5", "type": "single_choice", "title": "How fast did our website load?", "required": True, "options": ["Very Slow", "Slow", "Average", "Fast", "Very Fast"]},
            {"id": "q6", "type": "multiple_choice", "title": "What improvements would you suggest?", "required": False, "options": ["Better Navigation", "Faster Loading", "More Information", "Better Design", "Mobile Optimization", "Search Function"]},
            {"id": "q7", "type": "long_text", "title": "Any other feedback about your website experience?", "required": False}
        ]
    }
]

@router.get("/templates")
async def survey360_get_templates(category: Optional[str] = None):
    """Get available survey templates (cached)"""
    cache_key = f"survey360:templates:{category or 'all'}"
    
    # Try cache first
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    templates = SURVEY_TEMPLATES
    if category:
        templates = [t for t in templates if t["category"] == category]
    
    # Cache for 1 hour (templates rarely change)
    await cache.set(cache_key, templates, CacheConfig.TEMPLATE_TTL)
    return templates

@router.get("/templates/{template_id}")
async def survey360_get_template(template_id: str):
    """Get a specific survey template"""
    for template in SURVEY_TEMPLATES:
        if template["id"] == template_id:
            return template
    raise HTTPException(status_code=404, detail="Template not found")

@router.post("/templates/{template_id}/create", response_model=Survey360SurveyResponse)
async def survey360_create_from_template(template_id: str, user=Depends(get_survey360_user)):
    """Create a new survey from a template"""
    from server import app
    db = app.state.db
    
    # Find the template
    template = None
    for t in SURVEY_TEMPLATES:
        if t["id"] == template_id:
            template = t
            break
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check survey limits
    org_id = user.get("org_id")
    can_create, error_msg = await check_usage_limits(db, org_id, 'survey')
    if not can_create:
        raise HTTPException(status_code=403, detail=error_msg)
    
    survey_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Create survey from template
    survey = {
        "id": survey_id,
        "name": template["name"],
        "description": template["description"],
        "status": "draft",
        "org_id": org_id,
        "questions": template["questions"],
        "brand_color": template.get("color"),
        "created_at": now,
        "updated_at": now
    }
    await db.survey360_surveys.insert_one(survey)
    
    return Survey360SurveyResponse(
        **survey,
        question_count=len(template["questions"]),
        response_count=0,
        is_closed=False
    )

@router.get("/surveys/{survey_id}/analytics")
async def survey360_get_analytics(survey_id: str, user=Depends(get_survey360_user)):
    """Get basic analytics for a survey - pie/bar chart data (cached)"""
    from server import app
    db = app.state.db
    
    # Try cache first
    cache_key = f"survey360:analytics:{survey_id}"
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
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
    
    result = {
        "survey_id": survey_id,
        "total_responses": len(responses),
        "questions": analytics
    }
    
    # Cache analytics for 1 minute (changes with each new response)
    await cache.set(cache_key, result, CacheConfig.ANALYTICS_TTL)
    
    return result

