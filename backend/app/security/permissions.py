from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.activity_log import ActivityLog
from app.core import exceptions

# Centralized Permission Matrix derived from business requirements
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "manage:departments",
        "manage:categories",
        "manage:employees",
        "assign:roles",
        "create:audit_cycles",
        "view:analytics",
        "view:all_assets",
        "view:all_reports",
        "manage:notifications",
        "manage:users",
        "view:activity_logs",
        "booking:create"
    ],
    UserRole.ASSET_MANAGER: [
        "asset:register",
        "asset:allocate",
        "transfer:approve",
        "maintenance:approve",
        "return:approve",
        "audit:resolve_discrepancies",
        "report:view_assets",
        "booking:create"
    ],
    UserRole.DEPARTMENT_HEAD: [
        "department:view_assets",
        "transfer:approve_dept",
        "booking:create",
        "report:view_dept"
    ],
    UserRole.EMPLOYEE: [
        "own_assets:view",
        "booking:create",
        "maintenance:request",
        "transfer:request",
        "return:initiate"
    ]
}

async def log_security_event(db: AsyncSession, user_id: int, action: str, log_type: str):
    log = ActivityLog(
        user_id=user_id,
        title=action,
        type=log_type
    )
    db.add(log)
    await db.commit()

def require_role(role: UserRole):
    from app.api.deps import get_current_active_user_async, get_async_db
    async def role_checker(
        current_user: User = Depends(get_current_active_user_async),
        db: AsyncSession = Depends(get_async_db)
    ) -> User:
        if current_user.role != role:
            # Log privilege escalation if Employee tries to access Admin
            if current_user.role == UserRole.EMPLOYEE and role == UserRole.ADMIN:
                log_type = "PRIVILEGE_ESCALATION_ATTEMPT"
            else:
                log_type = "UNAUTHORIZED_ATTEMPT"
            
            action_msg = f"User '{current_user.email}' attempted unauthorized access to {role.value} resource."
            await log_security_event(db, current_user.id, action_msg, log_type)
            raise exceptions.PermissionDeniedException(detail="You do not have permission to perform this action.")
        return current_user
    return role_checker

def require_any_role(*roles: UserRole):
    from app.api.deps import get_current_active_user_async, get_async_db
    async def role_checker(
        current_user: User = Depends(get_current_active_user_async),
        db: AsyncSession = Depends(get_async_db)
    ) -> User:
        if current_user.role not in roles:
            # Check privilege escalation
            if current_user.role == UserRole.EMPLOYEE and UserRole.ADMIN in roles:
                log_type = "PRIVILEGE_ESCALATION_ATTEMPT"
            else:
                log_type = "UNAUTHORIZED_ATTEMPT"
                
            roles_str = ", ".join([r.value for r in roles])
            action_msg = f"User '{current_user.email}' attempted unauthorized access. Required any of: [{roles_str}]."
            await log_security_event(db, current_user.id, action_msg, log_type)
            raise exceptions.PermissionDeniedException(detail="You do not have permission to perform this action.")
        return current_user
    return role_checker

def require_permission(permission: str):
    from app.api.deps import get_current_active_user_async, get_async_db
    async def permission_checker(
        current_user: User = Depends(get_current_active_user_async),
        db: AsyncSession = Depends(get_async_db)
    ) -> User:
        # Admin can access everything
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        allowed_permissions = ROLE_PERMISSIONS.get(current_user.role, [])
        if permission not in allowed_permissions:
            # Check privilege escalation
            if current_user.role == UserRole.EMPLOYEE and permission.startswith("manage:"):
                log_type = "PRIVILEGE_ESCALATION_ATTEMPT"
            else:
                log_type = "PERMISSION_DENIED"
                
            action_msg = f"User '{current_user.email}' denied permission: '{permission}'."
            await log_security_event(db, current_user.id, action_msg, log_type)
            raise exceptions.PermissionDeniedException(detail="You do not have permission to perform this action.")
        return current_user
    return permission_checker
