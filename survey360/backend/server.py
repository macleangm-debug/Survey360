import os
from datetime import datetime, timezone
from typing import Optional, List
from contextlib import asynccontextmanager
import uuid
import hashlib

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
import jwt

# Environment
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "survey360")
JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")

# Database
client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.surveys.create_index("org_id")
    await db.responses.create_index("survey_id")
    
    # Create demo user if not exists
    demo_user = await db.users.find_one({"email": "demo@survey360.io"})
    if not demo_user:
        demo_org_id = str(uuid.uuid4())
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": "demo@survey360.io",
            "name": "Demo User",
            "password_hash": hashlib.sha256("Test123!".encode()).hexdigest(),
            "org_id": demo_org_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        await db.organizations.insert_one({
            "id": demo_org_id,
            "name": "Demo Organization",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    yield
    client.close()

app = FastAPI(title="Survey360 API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    org_id: Optional[str] = None

class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str

class OrganizationCreate(BaseModel):
    name: str

class OrganizationResponse(BaseModel):
    id: str
    name: str
    created_at: Optional[str] = None

class QuestionModel(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    required: bool = False
    options: Optional[List[str]] = None
    maxRating: Optional[int] = None

class SurveyCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    org_id: Optional[str] = None
    questions: List[QuestionModel] = []

class SurveyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionModel]] = None
    status: Optional[str] = None

class SurveyResponse(BaseModel):
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

class ResponseSubmit(BaseModel):
    respondent_email: Optional[str] = None
    respondent_name: Optional[str] = None
    answers: dict = {}

class SurveyResponseResponse(BaseModel):
    id: str
    survey_id: str
    respondent_email: Optional[str] = None
    respondent_name: Optional[str] = None
    status: str = "completed"
    answers: dict = {}
    submitted_at: str
    completion_time: Optional[int] = None

# Auth helpers
def create_token(user_id: str) -> str:
    return jwt.encode(
        {"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7},
        JWT_SECRET,
        algorithm="HS256"
    )

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth routes
@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if user.get("password_hash") != password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"])
    return AuthResponse(
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            org_id=user.get("org_id")
        ),
        access_token=token
    )

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    org_id = str(uuid.uuid4())
    
    # Create organization
    await db.organizations.insert_one({
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
    await db.users.insert_one(user)
    
    token = create_token(user_id)
    return AuthResponse(
        user=UserResponse(id=user_id, email=request.email, name=request.name, org_id=org_id),
        access_token=token
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return UserResponse(**user)

# Organization routes
@app.get("/api/organizations", response_model=List[OrganizationResponse])
async def list_organizations(user=Depends(get_current_user)):
    orgs = await db.organizations.find(
        {"id": user.get("org_id")},
        {"_id": 0}
    ).to_list(100)
    return [OrganizationResponse(**org) for org in orgs]

@app.post("/api/organizations", response_model=OrganizationResponse)
async def create_organization(data: OrganizationCreate, user=Depends(get_current_user)):
    org_id = str(uuid.uuid4())
    org = {
        "id": org_id,
        "name": data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.organizations.insert_one(org)
    
    # Update user's org_id
    await db.users.update_one({"id": user["id"]}, {"$set": {"org_id": org_id}})
    
    return OrganizationResponse(**org)

# Survey routes
@app.get("/api/surveys", response_model=List[SurveyResponse])
async def list_surveys(org_id: Optional[str] = None, user=Depends(get_current_user)):
    query = {}
    if org_id:
        query["org_id"] = org_id
    else:
        query["org_id"] = user.get("org_id")
    
    surveys = await db.surveys.find(query, {"_id": 0}).to_list(100)
    result = []
    for s in surveys:
        response_count = await db.responses.count_documents({"survey_id": s["id"]})
        result.append(SurveyResponse(
            **s,
            question_count=len(s.get("questions", [])),
            response_count=response_count
        ))
    return result

@app.get("/api/surveys/{survey_id}", response_model=SurveyResponse)
async def get_survey(survey_id: str, user=Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    response_count = await db.responses.count_documents({"survey_id": survey_id})
    return SurveyResponse(
        **survey,
        question_count=len(survey.get("questions", [])),
        response_count=response_count
    )

@app.post("/api/surveys", response_model=SurveyResponse)
async def create_survey(data: SurveyCreate, user=Depends(get_current_user)):
    survey_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    survey = {
        "id": survey_id,
        "name": data.name,
        "description": data.description,
        "status": "draft",
        "org_id": data.org_id or user.get("org_id"),
        "questions": [q.dict() for q in data.questions],
        "created_at": now,
        "updated_at": now
    }
    await db.surveys.insert_one(survey)
    
    return SurveyResponse(
        **survey,
        question_count=len(data.questions),
        response_count=0
    )

@app.put("/api/surveys/{survey_id}", response_model=SurveyResponse)
async def update_survey(survey_id: str, data: SurveyUpdate, user=Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
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
    
    await db.surveys.update_one({"id": survey_id}, {"$set": update_data})
    
    updated = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    response_count = await db.responses.count_documents({"survey_id": survey_id})
    
    return SurveyResponse(
        **updated,
        question_count=len(updated.get("questions", [])),
        response_count=response_count
    )

@app.delete("/api/surveys/{survey_id}")
async def delete_survey(survey_id: str, user=Depends(get_current_user)):
    result = await db.surveys.delete_one({"id": survey_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Survey not found")
    return {"message": "Survey deleted"}

@app.post("/api/surveys/{survey_id}/publish", response_model=SurveyResponse)
async def publish_survey(survey_id: str, user=Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    await db.surveys.update_one(
        {"id": survey_id},
        {"$set": {"status": "published", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    updated = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    response_count = await db.responses.count_documents({"survey_id": survey_id})
    
    return SurveyResponse(
        **updated,
        question_count=len(updated.get("questions", [])),
        response_count=response_count
    )

@app.post("/api/surveys/{survey_id}/duplicate", response_model=SurveyResponse)
async def duplicate_survey(survey_id: str, user=Depends(get_current_user)):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
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
    await db.surveys.insert_one(new_survey)
    
    return SurveyResponse(
        **new_survey,
        question_count=len(new_survey.get("questions", [])),
        response_count=0
    )

# Response routes
@app.get("/api/surveys/{survey_id}/responses", response_model=List[SurveyResponseResponse])
async def list_responses(survey_id: str, page: int = 1, limit: int = 10, user=Depends(get_current_user)):
    skip = (page - 1) * limit
    responses = await db.responses.find(
        {"survey_id": survey_id},
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    # Get survey name
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0, "name": 1})
    survey_name = survey.get("name", "") if survey else ""
    
    return [SurveyResponseResponse(**r, survey_name=survey_name) for r in responses]

@app.post("/api/surveys/{survey_id}/responses", response_model=SurveyResponseResponse)
async def submit_response(survey_id: str, data: ResponseSubmit):
    survey = await db.surveys.find_one({"id": survey_id}, {"_id": 0})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
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
        "completion_time": None
    }
    await db.responses.insert_one(response)
    
    return SurveyResponseResponse(**response)

# Dashboard routes
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(org_id: Optional[str] = None, user=Depends(get_current_user)):
    org = org_id or user.get("org_id")
    
    total_surveys = await db.surveys.count_documents({"org_id": org})
    active_surveys = await db.surveys.count_documents({"org_id": org, "status": "published"})
    
    # Get all survey IDs for this org
    surveys = await db.surveys.find({"org_id": org}, {"id": 1, "_id": 0}).to_list(1000)
    survey_ids = [s["id"] for s in surveys]
    
    total_responses = await db.responses.count_documents({"survey_id": {"$in": survey_ids}})
    
    return {
        "total_surveys": total_surveys,
        "active_surveys": active_surveys,
        "total_responses": total_responses,
        "response_rate": 78  # Mock for now
    }

@app.get("/api/dashboard/activity")
async def get_recent_activity(org_id: Optional[str] = None, limit: int = 10, user=Depends(get_current_user)):
    org = org_id or user.get("org_id")
    
    # Get survey IDs
    surveys = await db.surveys.find({"org_id": org}, {"id": 1, "name": 1, "_id": 0}).to_list(1000)
    survey_map = {s["id"]: s["name"] for s in surveys}
    survey_ids = list(survey_map.keys())
    
    # Get recent responses
    responses = await db.responses.find(
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

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "survey360"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
