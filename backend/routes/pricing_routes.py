"""
Survey360 - Pricing & Subscription Routes
Competitive pricing model with 80% profit margin
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid

router = APIRouter(prefix="/survey360/pricing", tags=["Survey360 Pricing"])

# ============================================
# PRICING CONFIGURATION
# ============================================

# Cost Analysis (per user/month)
# Infrastructure: ~$0.50
# Email (Resend): ~$0.001/email
# Storage: ~$0.02/GB
# LLM API: ~$0.10
# Target: 80% profit margin

class PlanTier(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"

class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    ANNUAL = "annual"

# Pricing in cents for precision
PRICING_CONFIG = {
    PlanTier.FREE: {
        "name": "Free",
        "description": "Perfect for trying out Survey360",
        "monthly_price": 0,
        "annual_price": 0,  # Free is free
        "users": 1,
        "responses_per_month": 100,
        "surveys": 3,
        "emails_per_month": 0,
        "storage_mb": 100,
        "features": [
            "3 active surveys",
            "100 responses/month",
            "10 question types",
            "Basic analytics",
            "CSV export",
            "Email support"
        ],
        "disabled_features": [
            "AI Assistant",
            "Custom branding",
            "Skip logic",
            "Email invitations",
            "Team collaboration",
            "Priority support"
        ]
    },
    PlanTier.STARTER: {
        "name": "Starter",
        "description": "For individuals and small teams",
        "monthly_price": 1900,  # $19/month
        "annual_price": 15200,  # $152/year ($12.67/month - 33% off)
        "users": 3,
        "responses_per_month": 1000,
        "surveys": -1,  # Unlimited
        "emails_per_month": 500,
        "storage_mb": 1024,  # 1GB
        "features": [
            "Unlimited surveys",
            "1,000 responses/month",
            "3 team members",
            "500 email invitations/month",
            "1GB storage",
            "Skip logic & branching",
            "Remove Survey360 branding",
            "Excel & CSV export",
            "Email support"
        ],
        "disabled_features": [
            "AI Assistant",
            "Custom logo",
            "Priority support",
            "API access"
        ]
    },
    PlanTier.PRO: {
        "name": "Pro",
        "description": "For growing teams and businesses",
        "monthly_price": 4900,  # $49/month
        "annual_price": 39200,  # $392/year ($32.67/month - 33% off)
        "users": 10,
        "responses_per_month": 10000,
        "surveys": -1,
        "emails_per_month": 5000,
        "storage_mb": 10240,  # 10GB
        "popular": True,
        "features": [
            "Unlimited surveys",
            "10,000 responses/month",
            "10 team members",
            "5,000 email invitations/month",
            "10GB storage",
            "AI Assistant (GPT-5.2)",
            "Custom branding & logo",
            "Advanced analytics",
            "Scheduled surveys",
            "Webhooks",
            "Priority email support"
        ],
        "disabled_features": [
            "Dedicated support",
            "Custom integrations",
            "SLA guarantee"
        ]
    },
    PlanTier.BUSINESS: {
        "name": "Business",
        "description": "For large teams and organizations",
        "monthly_price": 9900,  # $99/month
        "annual_price": 79200,  # $792/year ($66/month - 33% off)
        "users": 25,
        "responses_per_month": 50000,
        "surveys": -1,
        "emails_per_month": 25000,
        "storage_mb": 51200,  # 50GB
        "features": [
            "Unlimited surveys",
            "50,000 responses/month",
            "25 team members",
            "25,000 email invitations/month",
            "50GB storage",
            "AI Assistant (GPT-5.2)",
            "Custom branding & logo",
            "Advanced analytics & reports",
            "API access",
            "Webhooks & integrations",
            "Dedicated account manager",
            "Phone support",
            "99.9% SLA guarantee"
        ],
        "disabled_features": []
    },
    PlanTier.ENTERPRISE: {
        "name": "Enterprise",
        "description": "Custom solutions for large organizations",
        "monthly_price": -1,  # Custom pricing
        "annual_price": -1,
        "users": -1,  # Unlimited
        "responses_per_month": -1,
        "surveys": -1,
        "emails_per_month": -1,
        "storage_mb": -1,
        "features": [
            "Unlimited everything",
            "Unlimited team members",
            "Unlimited responses",
            "Unlimited storage",
            "Custom integrations",
            "On-premise deployment option",
            "SAML SSO",
            "Audit logs",
            "Custom SLA",
            "24/7 premium support",
            "Dedicated success manager",
            "Custom training"
        ],
        "disabled_features": []
    }
}

# Trial configuration
TRIAL_CONFIG = {
    "enabled": True,
    "plan": PlanTier.PRO,
    "duration_days": 14,
    "credit_card_required": False
}


# ============================================
# MODELS
# ============================================

class PricingPlanResponse(BaseModel):
    id: str
    name: str
    description: str
    monthly_price: int  # In cents
    annual_price: int
    monthly_price_display: str
    annual_price_display: str
    annual_monthly_equivalent: str
    savings_percent: int
    users: int
    responses_per_month: int
    surveys: int
    emails_per_month: int
    storage_mb: int
    storage_display: str
    features: List[str]
    disabled_features: List[str]
    popular: bool = False
    is_custom: bool = False

class SubscriptionStatus(BaseModel):
    plan: str
    billing_cycle: str
    status: str  # active, trialing, past_due, canceled
    current_period_start: str
    current_period_end: str
    trial_end: Optional[str] = None
    cancel_at_period_end: bool = False

class UsageDetails(BaseModel):
    plan: str
    billing_cycle: str
    status: str
    trial_end: Optional[str] = None
    
    # User limits
    users_used: int
    users_limit: int
    
    # Survey limits
    surveys_used: int
    surveys_limit: int
    
    # Response limits
    responses_used: int
    responses_limit: int
    
    # Email limits
    emails_used: int
    emails_limit: int
    
    # Storage limits
    storage_used_mb: float
    storage_limit_mb: int
    
    # Period
    period_start: str
    period_end: str
    
    # Feature access
    has_ai_assistant: bool
    has_custom_branding: bool
    has_email_invitations: bool
    has_api_access: bool

class StartTrialRequest(BaseModel):
    email: EmailStr

class UpgradeRequest(BaseModel):
    plan: PlanTier
    billing_cycle: BillingCycle

class SubscriptionResponse(BaseModel):
    success: bool
    subscription: Optional[SubscriptionStatus] = None
    checkout_url: Optional[str] = None
    message: Optional[str] = None


# ============================================
# HELPER FUNCTIONS
# ============================================

def format_price(cents: int) -> str:
    """Format price in cents to display string"""
    if cents == -1:
        return "Custom"
    if cents == 0:
        return "$0"
    return f"${cents / 100:.0f}" if cents % 100 == 0 else f"${cents / 100:.2f}"

def format_storage(mb: int) -> str:
    """Format storage in MB to display string"""
    if mb == -1:
        return "Unlimited"
    if mb >= 1024:
        return f"{mb // 1024}GB"
    return f"{mb}MB"

def calculate_savings(monthly: int, annual: int) -> int:
    """Calculate annual savings percentage"""
    if monthly <= 0 or annual <= 0:
        return 0
    monthly_total = monthly * 12
    savings = ((monthly_total - annual) / monthly_total) * 100
    return round(savings)

def get_plan_config(plan: PlanTier) -> dict:
    """Get configuration for a plan"""
    return PRICING_CONFIG.get(plan, PRICING_CONFIG[PlanTier.FREE])

def check_feature_access(plan: PlanTier, feature: str) -> bool:
    """Check if a plan has access to a feature"""
    config = get_plan_config(plan)
    return feature not in config.get("disabled_features", [])


# ============================================
# ROUTES
# ============================================

@router.get("/plans", response_model=List[PricingPlanResponse])
async def get_pricing_plans():
    """Get all available pricing plans"""
    plans = []
    
    for tier, config in PRICING_CONFIG.items():
        monthly = config["monthly_price"]
        annual = config["annual_price"]
        
        plan = PricingPlanResponse(
            id=tier.value,
            name=config["name"],
            description=config["description"],
            monthly_price=monthly,
            annual_price=annual,
            monthly_price_display=format_price(monthly),
            annual_price_display=format_price(annual),
            annual_monthly_equivalent=format_price(annual // 12) if annual > 0 else "Custom",
            savings_percent=calculate_savings(monthly, annual),
            users=config["users"],
            responses_per_month=config["responses_per_month"],
            surveys=config["surveys"],
            emails_per_month=config["emails_per_month"],
            storage_mb=config["storage_mb"],
            storage_display=format_storage(config["storage_mb"]),
            features=config["features"],
            disabled_features=config.get("disabled_features", []),
            popular=config.get("popular", False),
            is_custom=monthly == -1
        )
        plans.append(plan)
    
    return plans

@router.get("/plans/{plan_id}", response_model=PricingPlanResponse)
async def get_pricing_plan(plan_id: str):
    """Get details for a specific plan"""
    try:
        tier = PlanTier(plan_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    config = PRICING_CONFIG[tier]
    monthly = config["monthly_price"]
    annual = config["annual_price"]
    
    return PricingPlanResponse(
        id=tier.value,
        name=config["name"],
        description=config["description"],
        monthly_price=monthly,
        annual_price=annual,
        monthly_price_display=format_price(monthly),
        annual_price_display=format_price(annual),
        annual_monthly_equivalent=format_price(annual // 12) if annual > 0 else "Custom",
        savings_percent=calculate_savings(monthly, annual),
        users=config["users"],
        responses_per_month=config["responses_per_month"],
        surveys=config["surveys"],
        emails_per_month=config["emails_per_month"],
        storage_mb=config["storage_mb"],
        storage_display=format_storage(config["storage_mb"]),
        features=config["features"],
        disabled_features=config.get("disabled_features", []),
        popular=config.get("popular", False),
        is_custom=monthly == -1
    )

@router.get("/trial-info")
async def get_trial_info():
    """Get trial configuration"""
    return {
        "enabled": TRIAL_CONFIG["enabled"],
        "plan": TRIAL_CONFIG["plan"].value,
        "plan_name": PRICING_CONFIG[TRIAL_CONFIG["plan"]]["name"],
        "duration_days": TRIAL_CONFIG["duration_days"],
        "credit_card_required": TRIAL_CONFIG["credit_card_required"],
        "features": PRICING_CONFIG[TRIAL_CONFIG["plan"]]["features"]
    }

@router.post("/start-trial")
async def start_trial(authorization: str = Header(None)):
    """Start a 14-day Pro trial"""
    from server import app
    db = app.state.db
    
    # Get user from token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import jwt
    import os
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Check if user already had a trial
    user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.get("trial_used"):
        raise HTTPException(status_code=400, detail="Trial already used. Please upgrade to continue.")
    
    # Start trial
    trial_end = datetime.now(timezone.utc) + timedelta(days=TRIAL_CONFIG["duration_days"])
    
    await db.survey360_users.update_one(
        {"id": user_id},
        {"$set": {
            "plan": TRIAL_CONFIG["plan"].value,
            "billing_cycle": "trial",
            "trial_start": datetime.now(timezone.utc).isoformat(),
            "trial_end": trial_end.isoformat(),
            "trial_used": True,
            "subscription_status": "trialing"
        }}
    )
    
    return {
        "success": True,
        "message": f"Your {TRIAL_CONFIG['duration_days']}-day Pro trial has started!",
        "trial_end": trial_end.isoformat(),
        "plan": TRIAL_CONFIG["plan"].value
    }

@router.get("/subscription")
async def get_subscription(authorization: str = Header(None)):
    """Get current subscription status"""
    from server import app
    db = app.state.db
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import jwt
    import os
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plan = user.get("plan", "free")
    billing_cycle = user.get("billing_cycle", "monthly")
    status = user.get("subscription_status", "active")
    
    # Calculate period
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 12:
        period_end = period_start.replace(year=now.year + 1, month=1) - timedelta(seconds=1)
    else:
        period_end = period_start.replace(month=now.month + 1) - timedelta(seconds=1)
    
    # Check if trial expired
    trial_end = user.get("trial_end")
    if status == "trialing" and trial_end:
        trial_end_dt = datetime.fromisoformat(trial_end.replace("Z", "+00:00"))
        if now > trial_end_dt:
            # Trial expired, downgrade to free
            await db.survey360_users.update_one(
                {"id": user_id},
                {"$set": {"plan": "free", "subscription_status": "active", "billing_cycle": "monthly"}}
            )
            plan = "free"
            status = "active"
            trial_end = None
    
    return SubscriptionStatus(
        plan=plan,
        billing_cycle=billing_cycle,
        status=status,
        current_period_start=period_start.isoformat(),
        current_period_end=period_end.isoformat(),
        trial_end=trial_end,
        cancel_at_period_end=user.get("cancel_at_period_end", False)
    )

@router.get("/usage", response_model=UsageDetails)
async def get_usage_details(authorization: str = Header(None)):
    """Get detailed usage information"""
    from server import app
    db = app.state.db
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import jwt
    import os
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    plan = PlanTier(user.get("plan", "free"))
    config = get_plan_config(plan)
    org_id = user.get("org_id")
    
    # Calculate period
    now = datetime.now(timezone.utc)
    period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if now.month == 12:
        period_end = period_start.replace(year=now.year + 1, month=1) - timedelta(seconds=1)
    else:
        period_end = period_start.replace(month=now.month + 1) - timedelta(seconds=1)
    
    # Get usage counts
    surveys_used = await db.survey360_surveys.count_documents({"user_id": user_id})
    
    responses_used = await db.survey360_responses.count_documents({
        "submitted_at": {"$gte": period_start.isoformat()}
    })
    
    # Get email usage this month
    emails_used = await db.survey360_email_log.count_documents({
        "sent_at": {"$gte": period_start.isoformat()},
        "user_id": user_id
    }) if await db.list_collection_names(filter={"name": "survey360_email_log"}) else 0
    
    # Get team members count
    users_used = 1
    if org_id:
        users_used = await db.survey360_users.count_documents({"org_id": org_id})
    
    # Calculate storage (simplified - would need actual file size tracking)
    storage_used_mb = 0.0  # Placeholder - would calculate from uploaded files
    
    # Check trial status
    status = user.get("subscription_status", "active")
    trial_end = user.get("trial_end")
    
    return UsageDetails(
        plan=plan.value,
        billing_cycle=user.get("billing_cycle", "monthly"),
        status=status,
        trial_end=trial_end,
        users_used=users_used,
        users_limit=config["users"],
        surveys_used=surveys_used,
        surveys_limit=config["surveys"],
        responses_used=responses_used,
        responses_limit=config["responses_per_month"],
        emails_used=emails_used,
        emails_limit=config["emails_per_month"],
        storage_used_mb=storage_used_mb,
        storage_limit_mb=config["storage_mb"],
        period_start=period_start.isoformat(),
        period_end=period_end.isoformat(),
        has_ai_assistant=check_feature_access(plan, "AI Assistant"),
        has_custom_branding=check_feature_access(plan, "Custom branding"),
        has_email_invitations=config["emails_per_month"] > 0,
        has_api_access=check_feature_access(plan, "API access")
    )

@router.post("/upgrade")
async def request_upgrade(request: UpgradeRequest, authorization: str = Header(None)):
    """Request plan upgrade (payment integration placeholder)"""
    from server import app
    db = app.state.db
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import jwt
    import os
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.plan == PlanTier.ENTERPRISE:
        # Enterprise requires sales contact
        return SubscriptionResponse(
            success=True,
            message="Thank you for your interest in Enterprise! Our sales team will contact you within 24 hours.",
            checkout_url=None
        )
    
    config = get_plan_config(request.plan)
    price = config["annual_price"] if request.billing_cycle == BillingCycle.ANNUAL else config["monthly_price"]
    
    # In production, this would create a Stripe checkout session
    # For now, we'll simulate the upgrade
    
    # Store upgrade request
    await db.survey360_upgrade_requests.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "email": user.get("email"),
        "current_plan": user.get("plan", "free"),
        "requested_plan": request.plan.value,
        "billing_cycle": request.billing_cycle.value,
        "price_cents": price,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return SubscriptionResponse(
        success=True,
        message=f"Upgrade to {config['name']} ({request.billing_cycle.value}) requested! Price: {format_price(price)}/{'year' if request.billing_cycle == BillingCycle.ANNUAL else 'month'}. Payment integration coming soon.",
        checkout_url=None  # Would be Stripe checkout URL
    )

@router.post("/cancel")
async def cancel_subscription(authorization: str = Header(None)):
    """Cancel subscription at end of billing period"""
    from server import app
    db = app.state.db
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    import jwt
    import os
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    await db.survey360_users.update_one(
        {"id": user_id},
        {"$set": {"cancel_at_period_end": True}}
    )
    
    return {"success": True, "message": "Your subscription will be canceled at the end of the billing period."}

@router.get("/compare")
async def compare_plans():
    """Get feature comparison matrix"""
    features = [
        {"name": "Active Surveys", "key": "surveys"},
        {"name": "Responses/Month", "key": "responses_per_month"},
        {"name": "Team Members", "key": "users"},
        {"name": "Email Invitations", "key": "emails_per_month"},
        {"name": "Storage", "key": "storage_mb"},
        {"name": "AI Assistant", "key": "ai_assistant", "type": "boolean"},
        {"name": "Custom Branding", "key": "custom_branding", "type": "boolean"},
        {"name": "Skip Logic", "key": "skip_logic", "type": "boolean"},
        {"name": "API Access", "key": "api_access", "type": "boolean"},
        {"name": "Priority Support", "key": "priority_support", "type": "boolean"},
        {"name": "SLA Guarantee", "key": "sla", "type": "boolean"},
    ]
    
    plans_comparison = {}
    for tier, config in PRICING_CONFIG.items():
        disabled = config.get("disabled_features", [])
        plans_comparison[tier.value] = {
            "surveys": config["surveys"],
            "responses_per_month": config["responses_per_month"],
            "users": config["users"],
            "emails_per_month": config["emails_per_month"],
            "storage_mb": config["storage_mb"],
            "ai_assistant": "AI Assistant" not in disabled and "AI Assistant (GPT-5.2)" not in disabled,
            "custom_branding": "Custom branding" not in disabled and "Custom branding & logo" not in disabled,
            "skip_logic": "Skip logic" not in disabled and "Skip logic & branching" not in disabled,
            "api_access": "API access" not in disabled,
            "priority_support": "Priority support" not in disabled and "Priority email support" not in disabled,
            "sla": "SLA guarantee" not in disabled and "99.9% SLA guarantee" not in disabled,
        }
    
    return {
        "features": features,
        "plans": plans_comparison
    }
