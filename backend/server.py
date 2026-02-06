"""DataPulse - Main FastAPI Application"""
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(
    title="DataPulse API",
    description="Modern data collection platform for research, M&E, and field surveys",
    version="1.0.0"
)

# Store db in app state for route access
app.state.db = db

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import routes
from routes.auth_routes import router as auth_router
from routes.org_routes import router as org_router
from routes.project_routes import router as project_router
from routes.form_routes import router as form_router
from routes.submission_routes import router as submission_router
from routes.case_routes import router as case_router
from routes.export_routes import router as export_router
from routes.dashboard_routes import router as dashboard_router
from routes.media_routes import router as media_router
from routes.gps_routes import router as gps_router
from routes.template_routes import router as template_router
from routes.logic_routes import router as logic_router
from routes.widget_routes import router as widget_router
from routes.case_import_routes import router as case_import_router
from routes.collaboration_routes import router as collaboration_router
from routes.duplicate_routes import router as duplicate_router
from routes.versioning_routes import router as versioning_router
from routes.analytics_routes import router as analytics_router
from routes.rbac_routes import router as rbac_router
from routes.workflow_routes import router as workflow_router
from routes.translation_routes import router as translation_router
from routes.security_routes import router as security_router
from routes.admin_routes import router as admin_router
from routes.paradata_routes import router as paradata_router
from routes.revision_routes import router as revision_router
from routes.dataset_routes import router as dataset_router

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(org_router)
api_router.include_router(project_router)
api_router.include_router(form_router)
api_router.include_router(submission_router)
api_router.include_router(case_router)
api_router.include_router(export_router)
api_router.include_router(dashboard_router)
api_router.include_router(media_router)
api_router.include_router(gps_router)
api_router.include_router(template_router)
api_router.include_router(logic_router)
api_router.include_router(widget_router)
api_router.include_router(case_import_router)
api_router.include_router(collaboration_router)
api_router.include_router(duplicate_router)
api_router.include_router(versioning_router)
api_router.include_router(analytics_router)
api_router.include_router(rbac_router)
api_router.include_router(workflow_router)
api_router.include_router(translation_router)
api_router.include_router(security_router)
api_router.include_router(admin_router)
api_router.include_router(paradata_router)
api_router.include_router(revision_router)
api_router.include_router(dataset_router)


# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "DataPulse API is running", "version": "1.0.0"}


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_db_client():
    """Initialize database indexes on startup"""
    logger.info("DataPulse API starting up...")
    
    # Create indexes for better query performance
    try:
        # Users
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        
        # Organizations
        await db.organizations.create_index("slug", unique=True)
        await db.organizations.create_index("id", unique=True)
        
        # Org Members
        await db.org_members.create_index([("org_id", 1), ("user_id", 1)], unique=True)
        
        # Projects
        await db.projects.create_index("id", unique=True)
        await db.projects.create_index([("org_id", 1), ("status", 1)])
        
        # Forms
        await db.forms.create_index("id", unique=True)
        await db.forms.create_index([("project_id", 1), ("status", 1)])
        
        # Submissions
        await db.submissions.create_index("id", unique=True)
        await db.submissions.create_index([("form_id", 1), ("submitted_at", -1)])
        await db.submissions.create_index([("org_id", 1), ("submitted_at", -1)])
        await db.submissions.create_index([("project_id", 1), ("status", 1)])
        
        # Cases
        await db.cases.create_index("id", unique=True)
        await db.cases.create_index([("project_id", 1), ("respondent_id", 1)], unique=True)
        
        # Audit Logs
        await db.audit_logs.create_index([("org_id", 1), ("timestamp", -1)])
        
        # API Keys
        await db.api_keys.create_index("key_hash", unique=True)
        await db.api_keys.create_index([("org_id", 1), ("is_active", 1)])
        
        # API Audit Logs
        await db.api_audit_logs.create_index([("org_id", 1), ("timestamp", -1)])
        await db.api_audit_logs.create_index([("timestamp", -1)])
        
        # Invoices
        await db.invoices.create_index("id", unique=True)
        await db.invoices.create_index([("org_id", 1), ("created_at", -1)])
        
        # Billing Events
        await db.billing_events.create_index([("org_id", 1), ("timestamp", -1)])
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Cleanup on shutdown"""
    logger.info("DataPulse API shutting down...")
    client.close()
