from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_token
from app.crud.user import get_user_by_email
from app.crud.tenant import get_tenant_by_id
from app.models.user import User, UserRole
from app.models.tenant import Tenant
from typing import Optional, Tuple

security = HTTPBearer()

def get_current_user_and_tenant(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Tuple[User, Tenant]:
    """
    Dependency to get current user and their tenant
    Returns tuple of (user, tenant)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_email(
        db, 
        email=token_data.email, 
        tenant_id=token_data.tenant_id
    )
    if user is None:
        raise credentials_exception
    
    tenant = get_tenant_by_id(db, user.tenant_id)
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found"
        )
    
    return user, tenant

def require_admin_access(
    user_tenant: Tuple[User, Tenant] = Depends(get_current_user_and_tenant)
) -> Tuple[User, Tenant]:
    """
    Dependency that requires admin role
    """
    user, tenant = user_tenant
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user, tenant

def require_member_or_admin_access(
    user_tenant: Tuple[User, Tenant] = Depends(get_current_user_and_tenant)
) -> Tuple[User, Tenant]:
    """
    Dependency that requires member or admin role
    """
    user, tenant = user_tenant
    if user.role not in [UserRole.ADMIN, UserRole.MEMBER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member or Admin access required"
        )
    return user, tenant

def validate_tenant_access(
    tenant_slug: str,
    user_tenant: Tuple[User, Tenant] = Depends(get_current_user_and_tenant),
    db: Session = Depends(get_db)
) -> Tuple[User, Tenant]:
    """
    Dependency to validate user has access to specific tenant by slug
    """
    user, tenant = user_tenant
    
    if tenant.slug != tenant_slug:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    return user, tenant

def get_pagination_params(
    skip: int = 0,
    limit: int = 100
) -> Tuple[int, int]:
    """
    Dependency for pagination parameters with validation
    """
    if skip < 0:
        skip = 0
    if limit <= 0:
        limit = 10
    if limit > 1000:  # Prevent excessive queries
        limit = 1000
    
    return skip, limit

def get_optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional authentication dependency
    Returns user if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        return None
    
    user = get_user_by_email(
        db, 
        email=token_data.email, 
        tenant_id=token_data.tenant_id
    )
    return user