import pytest
from unittest.mock import AsyncMock
from app.models.user import User, UserRole
from app.security.permissions import require_role, require_any_role, require_permission, ROLE_PERMISSIONS
from app.core.exceptions import PermissionDeniedException, CredentialsException
from app.api.deps import get_current_active_user_async

# Create a mock database session
@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    return db

@pytest.mark.asyncio
async def test_require_role_success(mock_db):
    user = User(email="admin@test.com", role=UserRole.ADMIN, is_active=True)
    checker = require_role(UserRole.ADMIN)
    result = await checker(current_user=user, db=mock_db)
    assert result == user
    mock_db.add.assert_not_called()

@pytest.mark.asyncio
async def test_require_role_denied(mock_db):
    user = User(email="emp@test.com", role=UserRole.EMPLOYEE, is_active=True)
    checker = require_role(UserRole.ADMIN)
    
    with pytest.raises(PermissionDeniedException):
        await checker(current_user=user, db=mock_db)
    
    # Verify that a security event was logged
    mock_db.add.assert_called_once()
    logged_event = mock_db.add.call_args[0][0]
    assert logged_event.type == "PRIVILEGE_ESCALATION_ATTEMPT"
    assert "emp@test.com" in logged_event.title

@pytest.mark.asyncio
async def test_require_any_role_success(mock_db):
    user = User(email="mgr@test.com", role=UserRole.ASSET_MANAGER, is_active=True)
    checker = require_any_role(UserRole.ADMIN, UserRole.ASSET_MANAGER)
    result = await checker(current_user=user, db=mock_db)
    assert result == user

@pytest.mark.asyncio
async def test_require_any_role_denied(mock_db):
    user = User(email="emp@test.com", role=UserRole.EMPLOYEE, is_active=True)
    checker = require_any_role(UserRole.ADMIN, UserRole.ASSET_MANAGER)
    
    with pytest.raises(PermissionDeniedException):
        await checker(current_user=user, db=mock_db)
        
    mock_db.add.assert_called_once()
    logged_event = mock_db.add.call_args[0][0]
    assert logged_event.type == "PRIVILEGE_ESCALATION_ATTEMPT"

@pytest.mark.asyncio
async def test_permission_matrix_admin_bypass(mock_db):
    user = User(email="admin@test.com", role=UserRole.ADMIN, is_active=True)
    # Admin is not explicitly in the register permission list but should bypass
    checker = require_permission("asset:register")
    result = await checker(current_user=user, db=mock_db)
    assert result == user

@pytest.mark.asyncio
async def test_permission_matrix_success(mock_db):
    user = User(email="mgr@test.com", role=UserRole.ASSET_MANAGER, is_active=True)
    checker = require_permission("asset:register")
    result = await checker(current_user=user, db=mock_db)
    assert result == user

@pytest.mark.asyncio
async def test_permission_matrix_denied(mock_db):
    user = User(email="dept@test.com", role=UserRole.DEPARTMENT_HEAD, is_active=True)
    checker = require_permission("asset:register") # Dept Head cannot register assets
    
    with pytest.raises(PermissionDeniedException):
        await checker(current_user=user, db=mock_db)
        
    mock_db.add.assert_called_once()
    logged_event = mock_db.add.call_args[0][0]
    assert logged_event.type == "PERMISSION_DENIED"

@pytest.mark.asyncio
async def test_inactive_user_check():
    inactive_user = User(email="inactive@test.com", role=UserRole.EMPLOYEE, is_active=False)
    with pytest.raises(CredentialsException):
        await get_current_active_user_async(current_user=inactive_user)
