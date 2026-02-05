"""DataPulse - Role-Based Access Control (RBAC) API"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId

from auth import get_current_user

router = APIRouter(prefix="/rbac", tags=["RBAC"])


# Default roles with permissions
DEFAULT_ROLES = {
    "owner": {
        "name": "Owner",
        "description": "Full access to all features",
        "permissions": ["*"],
        "is_system": True
    },
    "admin": {
        "name": "Administrator",
        "description": "Manage organization settings and users",
        "permissions": [
            "org.read", "org.update",
            "users.read", "users.create", "users.update", "users.delete",
            "roles.read", "roles.assign",
            "projects.*", "forms.*", "submissions.*",
            "cases.*", "exports.*", "analytics.*"
        ],
        "is_system": True
    },
    "supervisor": {
        "name": "Supervisor",
        "description": "Oversee data collection and review submissions",
        "permissions": [
            "projects.read",
            "forms.read", "forms.create", "forms.update",
            "submissions.*",
            "cases.read", "cases.update",
            "analytics.read",
            "users.read"
        ],
        "is_system": True
    },
    "enumerator": {
        "name": "Enumerator",
        "description": "Collect data in the field",
        "permissions": [
            "projects.read",
            "forms.read",
            "submissions.create", "submissions.read.own",
            "cases.read.assigned"
        ],
        "is_system": True
    },
    "viewer": {
        "name": "Viewer",
        "description": "View-only access to data",
        "permissions": [
            "projects.read",
            "forms.read",
            "submissions.read",
            "analytics.read"
        ],
        "is_system": True
    }
}

# All available permissions
ALL_PERMISSIONS = [
    # Organization
    {"key": "org.read", "name": "View Organization", "category": "Organization"},
    {"key": "org.update", "name": "Update Organization", "category": "Organization"},
    {"key": "org.delete", "name": "Delete Organization", "category": "Organization"},
    
    # Users
    {"key": "users.read", "name": "View Users", "category": "Users"},
    {"key": "users.create", "name": "Invite Users", "category": "Users"},
    {"key": "users.update", "name": "Update Users", "category": "Users"},
    {"key": "users.delete", "name": "Remove Users", "category": "Users"},
    
    # Roles
    {"key": "roles.read", "name": "View Roles", "category": "Roles"},
    {"key": "roles.create", "name": "Create Roles", "category": "Roles"},
    {"key": "roles.update", "name": "Update Roles", "category": "Roles"},
    {"key": "roles.delete", "name": "Delete Roles", "category": "Roles"},
    {"key": "roles.assign", "name": "Assign Roles", "category": "Roles"},
    
    # Projects
    {"key": "projects.read", "name": "View Projects", "category": "Projects"},
    {"key": "projects.create", "name": "Create Projects", "category": "Projects"},
    {"key": "projects.update", "name": "Update Projects", "category": "Projects"},
    {"key": "projects.delete", "name": "Delete Projects", "category": "Projects"},
    
    # Forms
    {"key": "forms.read", "name": "View Forms", "category": "Forms"},
    {"key": "forms.create", "name": "Create Forms", "category": "Forms"},
    {"key": "forms.update", "name": "Update Forms", "category": "Forms"},
    {"key": "forms.delete", "name": "Delete Forms", "category": "Forms"},
    {"key": "forms.publish", "name": "Publish Forms", "category": "Forms"},
    
    # Submissions
    {"key": "submissions.read", "name": "View All Submissions", "category": "Submissions"},
    {"key": "submissions.read.own", "name": "View Own Submissions", "category": "Submissions"},
    {"key": "submissions.create", "name": "Create Submissions", "category": "Submissions"},
    {"key": "submissions.update", "name": "Update Submissions", "category": "Submissions"},
    {"key": "submissions.delete", "name": "Delete Submissions", "category": "Submissions"},
    {"key": "submissions.approve", "name": "Approve Submissions", "category": "Submissions"},
    {"key": "submissions.reject", "name": "Reject Submissions", "category": "Submissions"},
    
    # Cases
    {"key": "cases.read", "name": "View All Cases", "category": "Cases"},
    {"key": "cases.read.assigned", "name": "View Assigned Cases", "category": "Cases"},
    {"key": "cases.create", "name": "Create Cases", "category": "Cases"},
    {"key": "cases.update", "name": "Update Cases", "category": "Cases"},
    {"key": "cases.delete", "name": "Delete Cases", "category": "Cases"},
    {"key": "cases.assign", "name": "Assign Cases", "category": "Cases"},
    
    # Exports
    {"key": "exports.read", "name": "View Exports", "category": "Exports"},
    {"key": "exports.create", "name": "Create Exports", "category": "Exports"},
    
    # Analytics
    {"key": "analytics.read", "name": "View Analytics", "category": "Analytics"},
    {"key": "analytics.export", "name": "Export Analytics", "category": "Analytics"},
    
    # Settings
    {"key": "settings.read", "name": "View Settings", "category": "Settings"},
    {"key": "settings.update", "name": "Update Settings", "category": "Settings"}
]


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str]
    

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None


class UserRoleAssignment(BaseModel):
    user_id: str
    role_id: str
    project_ids: Optional[List[str]] = None  # Scope to specific projects


def check_permission(user_permissions: List[str], required: str) -> bool:
    """Check if user has a specific permission"""
    if "*" in user_permissions:
        return True
    
    if required in user_permissions:
        return True
    
    # Check wildcard permissions (e.g., "forms.*" covers "forms.read")
    parts = required.split(".")
    for i in range(len(parts)):
        wildcard = ".".join(parts[:i+1]) + ".*"
        if wildcard in user_permissions:
            return True
    
    return False


@router.get("/permissions")
async def get_all_permissions():
    """Get list of all available permissions"""
    
    # Group by category
    categories = {}
    for perm in ALL_PERMISSIONS:
        cat = perm["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(perm)
    
    return {
        "permissions": ALL_PERMISSIONS,
        "categories": categories
    }


@router.get("/roles/defaults")
async def get_default_roles():
    """Get system default roles"""
    roles = []
    for role_id, role_data in DEFAULT_ROLES.items():
        roles.append({
            "id": role_id,
            **role_data
        })
    return {"roles": roles}


@router.get("/roles/{org_id}")
async def get_organization_roles(
    request: Request,
    org_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all roles for an organization (system + custom)"""
    db = request.app.state.db
    
    # Get custom roles
    custom_roles = await db.roles.find(
        {"org_id": org_id},
        {"_id": 0}
    ).to_list(50)
    
    # Combine with default roles
    all_roles = []
    for role_id, role_data in DEFAULT_ROLES.items():
        all_roles.append({
            "id": role_id,
            "org_id": org_id,
            **role_data
        })
    
    all_roles.extend(custom_roles)
    
    return {"roles": all_roles}


@router.post("/roles/{org_id}")
async def create_custom_role(
    request: Request,
    org_id: str,
    role: RoleCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a custom role for an organization"""
    db = request.app.state.db
    
    # Validate permissions
    valid_perms = {p["key"] for p in ALL_PERMISSIONS}
    for perm in role.permissions:
        if perm not in valid_perms and not perm.endswith(".*") and perm != "*":
            raise HTTPException(status_code=400, detail=f"Invalid permission: {perm}")
    
    role_data = {
        "id": str(ObjectId()),
        "org_id": org_id,
        "name": role.name,
        "description": role.description,
        "permissions": role.permissions,
        "is_system": False,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.roles.insert_one(role_data)
    
    return {"id": role_data["id"], "message": "Role created successfully"}


@router.put("/roles/{org_id}/{role_id}")
async def update_role(
    request: Request,
    org_id: str,
    role_id: str,
    role: RoleUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a custom role"""
    db = request.app.state.db
    
    # Cannot update system roles
    if role_id in DEFAULT_ROLES:
        raise HTTPException(status_code=400, detail="Cannot modify system roles")
    
    update_data = {}
    if role.name:
        update_data["name"] = role.name
    if role.description is not None:
        update_data["description"] = role.description
    if role.permissions is not None:
        update_data["permissions"] = role.permissions
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.roles.update_one(
        {"id": role_id, "org_id": org_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {"message": "Role updated successfully"}


@router.delete("/roles/{org_id}/{role_id}")
async def delete_role(
    request: Request,
    org_id: str,
    role_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a custom role"""
    db = request.app.state.db
    
    if role_id in DEFAULT_ROLES:
        raise HTTPException(status_code=400, detail="Cannot delete system roles")
    
    # Check if role is in use
    users_with_role = await db.org_members.count_documents({
        "org_id": org_id,
        "role_id": role_id
    })
    
    if users_with_role > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete role: {users_with_role} users have this role"
        )
    
    result = await db.roles.delete_one({"id": role_id, "org_id": org_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Role not found")
    
    return {"message": "Role deleted successfully"}


@router.post("/users/{org_id}/assign-role")
async def assign_role_to_user(
    request: Request,
    org_id: str,
    assignment: UserRoleAssignment,
    current_user: dict = Depends(get_current_user)
):
    """Assign a role to a user"""
    db = request.app.state.db
    
    # Verify role exists
    role_exists = assignment.role_id in DEFAULT_ROLES
    if not role_exists:
        custom_role = await db.roles.find_one({
            "id": assignment.role_id,
            "org_id": org_id
        })
        if not custom_role:
            raise HTTPException(status_code=404, detail="Role not found")
    
    # Update user's role
    result = await db.org_members.update_one(
        {"org_id": org_id, "user_id": assignment.user_id},
        {"$set": {
            "role_id": assignment.role_id,
            "project_scope": assignment.project_ids,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found in organization")
    
    return {"message": "Role assigned successfully"}


@router.get("/users/{org_id}/{user_id}/permissions")
async def get_user_permissions(
    request: Request,
    org_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get effective permissions for a user"""
    db = request.app.state.db
    
    # Get user's role
    membership = await db.org_members.find_one(
        {"org_id": org_id, "user_id": user_id},
        {"_id": 0}
    )
    
    if not membership:
        raise HTTPException(status_code=404, detail="User not found in organization")
    
    role_id = membership.get("role_id", "viewer")
    
    # Get role permissions
    if role_id in DEFAULT_ROLES:
        permissions = DEFAULT_ROLES[role_id]["permissions"]
        role_name = DEFAULT_ROLES[role_id]["name"]
    else:
        custom_role = await db.roles.find_one(
            {"id": role_id, "org_id": org_id},
            {"_id": 0}
        )
        if custom_role:
            permissions = custom_role.get("permissions", [])
            role_name = custom_role.get("name", "Custom Role")
        else:
            permissions = DEFAULT_ROLES["viewer"]["permissions"]
            role_name = "Viewer"
    
    # Expand permissions
    effective_permissions = set()
    for perm in permissions:
        if perm == "*":
            effective_permissions = {"*"}
            break
        elif perm.endswith(".*"):
            # Add all matching permissions
            prefix = perm[:-2]
            for p in ALL_PERMISSIONS:
                if p["key"].startswith(prefix):
                    effective_permissions.add(p["key"])
        else:
            effective_permissions.add(perm)
    
    return {
        "user_id": user_id,
        "role_id": role_id,
        "role_name": role_name,
        "permissions": list(effective_permissions),
        "project_scope": membership.get("project_scope")
    }


@router.post("/check-permission")
async def check_user_permission(
    request: Request,
    user_id: str,
    org_id: str,
    permission: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if a user has a specific permission"""
    db = request.app.state.db
    
    # Get user's permissions
    perms_response = await get_user_permissions(request, org_id, user_id, current_user)
    user_permissions = perms_response["permissions"]
    
    has_permission = check_permission(user_permissions, permission)
    
    return {
        "user_id": user_id,
        "permission": permission,
        "has_permission": has_permission
    }


@router.get("/audit/{org_id}")
async def get_rbac_audit_log(
    request: Request,
    org_id: str,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Get RBAC audit log for an organization"""
    db = request.app.state.db
    
    logs = await db.rbac_audit.find(
        {"org_id": org_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"audit_logs": logs}
