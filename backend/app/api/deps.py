from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_token
from app.crud.user import get_user_by_email
from app.models.user import User, UserRole
from typing import Optional

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user
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
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to get current active user
    """
    # Add any user status checks here if needed
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure current user is an admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

async def get_current_member_or_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to ensure current user is either a member or admin
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MEMBER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member or Admin privileges required"
        )
    return current_user