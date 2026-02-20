"""
Survey360 - Organization Routes with Pricing Tier Limits
Manage organizations, members, and enforce tier-based limits
"""

from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import re
import uuid

router = APIRouter(prefix="/survey360/organizations", tags=["Survey360 Organizations"])

# Organization limits by pricing tier
ORG_LIMITS = {
    "free": {"orgs": 1, "members": 1},
    "starter": {"orgs": 1, "members": 3},
    "pro": {"orgs": 1, "members": 10},
    "business": {"orgs": 3, "members": 25},
    "enterprise": {"orgs": -1, "members": -1},  # unlimited
}

# Member roles
ROLES = ["owner", "admin", "member", "viewer"]


# ============================================
# MODELS
# ============================================

class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    slug: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class MemberInvite(BaseModel):
    email: str
    role: str = "member"

class MemberUpdate(BaseModel):
    role: str


# ============================================
# HELPER FUNCTIONS
# ============================================

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)


async def get_user_from_token(authorization: str, db) -> dict:
    """Extract and validate user from JWT token"""
    import jwt
    import os
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    JWT_SECRET = os.environ.get("JWT_SECRET", "survey360-secret-key-change-in-production")
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_user_plan(db, user_id: str) -> str:
    """Get user's current subscription plan"""
    user = await db.survey360_users.find_one({"id": user_id}, {"_id": 0, "plan": 1})
    return user.get("plan", "free") if user else "free"


async def get_org_limits(db, user_id: str) -> dict:
    """Get organization limits based on user's plan"""
    plan = await get_user_plan(db, user_id)
    return ORG_LIMITS.get(plan, ORG_LIMITS["free"])


async def count_user_organizations(db, user_id: str) -> int:
    """Count organizations created by user"""
    return await db.survey360_organizations.count_documents({"created_by": user_id})


async def count_org_members(db, org_id: str) -> int:
    """Count members in an organization"""
    return await db.survey360_org_members.count_documents({"org_id": org_id})


async def verify_org_access(db, org_id: str, user_id: str, required_roles: List[str] = None) -> dict:
    """Verify user has access to organization"""
    membership = await db.survey360_org_members.find_one(
        {"org_id": org_id, "user_id": user_id},
        {"_id": 0}
    )
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    if required_roles and membership.get("role") not in required_roles:
        raise HTTPException(status_code=403, detail=f"Requires {', '.join(required_roles)} role")
    
    return membership


# ============================================
# ROUTES - LIMITS
# ============================================

@router.get("/limits/me")
async def get_my_org_limits(authorization: str = Header(None)):
    """Get current user's organization limits and usage"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    user_id = user["id"]
    plan = user.get("plan", "free")
    
    limits = ORG_LIMITS.get(plan, ORG_LIMITS["free"])
    org_limit = limits["orgs"]
    member_limit = limits["members"]
    
    current_count = await count_user_organizations(db, user_id)
    
    # Get organizations user is member of
    memberships = await db.survey360_org_members.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    
    return {
        "plan_id": plan,
        "organizations_limit": org_limit,
        "organizations_created": current_count,
        "organizations_member_of": len(memberships),
        "members_per_org_limit": member_limit,
        "can_create_more": org_limit == -1 or current_count < org_limit,
        "remaining": None if org_limit == -1 else max(0, org_limit - current_count)
    }


# ============================================
# ROUTES - ORGANIZATIONS
# ============================================

@router.get("")
async def list_organizations(authorization: str = Header(None)):
    """List all organizations user is a member of"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    user_id = user["id"]
    
    # Get all memberships
    memberships = await db.survey360_org_members.find(
        {"user_id": user_id}, {"_id": 0}
    ).to_list(100)
    
    if not memberships:
        return []
    
    # Get organizations
    org_ids = [m["org_id"] for m in memberships]
    orgs = await db.survey360_organizations.find(
        {"id": {"$in": org_ids}, "is_active": True},
        {"_id": 0}
    ).to_list(100)
    
    # Add role and member count to each org
    for org in orgs:
        membership = next((m for m in memberships if m["org_id"] == org["id"]), None)
        org["role"] = membership.get("role", "member") if membership else "member"
        org["member_count"] = await count_org_members(db, org["id"])
    
    return orgs


@router.post("")
async def create_organization(data: OrganizationCreate, authorization: str = Header(None)):
    """Create a new organization with limit checking"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    user_id = user["id"]
    
    # Check organization limit
    limits = await get_org_limits(db, user_id)
    org_limit = limits["orgs"]
    current_count = await count_user_organizations(db, user_id)
    
    if org_limit != -1 and current_count >= org_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Organization limit reached ({org_limit}). Upgrade your plan to create more."
        )
    
    # Check if slug is unique
    slug = data.slug or slugify(data.name)
    existing = await db.survey360_organizations.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    # Create organization
    org = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "slug": slug,
        "description": data.description,
        "created_by": user_id,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.survey360_organizations.insert_one(org)
    
    # Add creator as owner
    member = {
        "id": str(uuid.uuid4()),
        "org_id": org["id"],
        "user_id": user_id,
        "email": user.get("email"),
        "role": "owner",
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.survey360_org_members.insert_one(member)
    
    # Update user's default org if not set
    if not user.get("org_id"):
        await db.survey360_users.update_one(
            {"id": user_id},
            {"$set": {"org_id": org["id"]}}
        )
    
    return {k: v for k, v in org.items() if k != "_id"}


@router.get("/{org_id}")
async def get_organization(org_id: str, authorization: str = Header(None)):
    """Get organization details"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"])
    
    org = await db.survey360_organizations.find_one(
        {"id": org_id, "is_active": True},
        {"_id": 0}
    )
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org["member_count"] = await count_org_members(db, org_id)
    
    return org


@router.patch("/{org_id}")
async def update_organization(org_id: str, data: OrganizationUpdate, authorization: str = Header(None)):
    """Update organization (admin/owner only)"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"], ["owner", "admin"])
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.survey360_organizations.update_one(
        {"id": org_id},
        {"$set": update_data}
    )
    
    return await get_organization(org_id, authorization)


@router.delete("/{org_id}")
async def delete_organization(org_id: str, authorization: str = Header(None)):
    """Delete organization (owner only) - cascades to members and data"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"], ["owner"])
    
    # Cascade delete
    await db.survey360_org_members.delete_many({"org_id": org_id})
    await db.survey360_surveys.delete_many({"org_id": org_id})
    await db.survey360_organizations.delete_one({"id": org_id})
    
    # Update users who had this as default org
    await db.survey360_users.update_many(
        {"org_id": org_id},
        {"$unset": {"org_id": ""}}
    )
    
    return {"success": True, "message": "Organization deleted successfully"}


# ============================================
# ROUTES - MEMBERS
# ============================================

@router.get("/{org_id}/members")
async def list_members(org_id: str, authorization: str = Header(None)):
    """List organization members"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"])
    
    members = await db.survey360_org_members.find(
        {"org_id": org_id},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with user info
    for member in members:
        member_user = await db.survey360_users.find_one(
            {"id": member["user_id"]},
            {"_id": 0, "name": 1, "email": 1, "avatar": 1}
        )
        if member_user:
            member["name"] = member_user.get("name", "Unknown")
            member["avatar"] = member_user.get("avatar")
    
    return members


@router.post("/{org_id}/members")
async def invite_member(org_id: str, data: MemberInvite, authorization: str = Header(None)):
    """Invite a member to organization (admin/owner only)"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"], ["owner", "admin"])
    
    # Check member limit
    plan = await get_user_plan(db, user["id"])
    limits = ORG_LIMITS.get(plan, ORG_LIMITS["free"])
    member_limit = limits["members"]
    current_members = await count_org_members(db, org_id)
    
    if member_limit != -1 and current_members >= member_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Member limit reached ({member_limit}). Upgrade to add more members."
        )
    
    # Validate role
    if data.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(ROLES)}")
    
    if data.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot invite as owner")
    
    # Check if user exists
    invited_user = await db.survey360_users.find_one(
        {"email": data.email.lower()},
        {"_id": 0, "id": 1, "email": 1}
    )
    
    if not invited_user:
        # Create pending invitation
        invitation = {
            "id": str(uuid.uuid4()),
            "org_id": org_id,
            "email": data.email.lower(),
            "role": data.role,
            "invited_by": user["id"],
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.survey360_org_invitations.insert_one(invitation)
        
        return {
            "success": True,
            "message": f"Invitation sent to {data.email}",
            "status": "pending"
        }
    
    # Check if already a member
    existing = await db.survey360_org_members.find_one({
        "org_id": org_id,
        "user_id": invited_user["id"]
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    
    # Add member directly
    member = {
        "id": str(uuid.uuid4()),
        "org_id": org_id,
        "user_id": invited_user["id"],
        "email": invited_user["email"],
        "role": data.role,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.survey360_org_members.insert_one(member)
    
    return {
        "success": True,
        "message": f"Added {data.email} as {data.role}",
        "status": "added"
    }


@router.patch("/{org_id}/members/{member_id}")
async def update_member_role(org_id: str, member_id: str, data: MemberUpdate, authorization: str = Header(None)):
    """Update member role (owner only)"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"], ["owner"])
    
    if data.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(ROLES)}")
    
    if data.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot change role to owner")
    
    # Get member
    member = await db.survey360_org_members.find_one({"id": member_id, "org_id": org_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if member.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Cannot change owner's role")
    
    await db.survey360_org_members.update_one(
        {"id": member_id},
        {"$set": {"role": data.role}}
    )
    
    return {"success": True, "message": f"Role updated to {data.role}"}


@router.delete("/{org_id}/members/{member_id}")
async def remove_member(org_id: str, member_id: str, authorization: str = Header(None)):
    """Remove member from organization (admin/owner or self)"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    membership = await verify_org_access(db, org_id, user["id"])
    
    # Get target member
    target_member = await db.survey360_org_members.find_one({"id": member_id, "org_id": org_id})
    if not target_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Check permissions
    is_self = target_member.get("user_id") == user["id"]
    is_admin = membership.get("role") in ["owner", "admin"]
    
    if not is_self and not is_admin:
        raise HTTPException(status_code=403, detail="Cannot remove other members")
    
    if target_member.get("role") == "owner":
        raise HTTPException(status_code=400, detail="Cannot remove owner")
    
    await db.survey360_org_members.delete_one({"id": member_id})
    
    return {"success": True, "message": "Member removed"}


# ============================================
# ROUTES - SWITCH ORGANIZATION
# ============================================

@router.post("/{org_id}/switch")
async def switch_organization(org_id: str, authorization: str = Header(None)):
    """Switch user's current organization"""
    from server import app
    db = app.state.db
    
    user = await get_user_from_token(authorization, db)
    await verify_org_access(db, org_id, user["id"])
    
    await db.survey360_users.update_one(
        {"id": user["id"]},
        {"$set": {"org_id": org_id}}
    )
    
    org = await db.survey360_organizations.find_one({"id": org_id}, {"_id": 0})
    
    return {"success": True, "message": f"Switched to {org.get('name')}", "organization": org}
