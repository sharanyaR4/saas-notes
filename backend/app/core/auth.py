from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_token
from app.crud.user import get_user_by_email
from app.models.user import UserRole
from typing import Optional

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
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

def require_admin(current_user = Depends(get_current_user)):
    """
    Dependency to ensure current user is an admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_member_or_admin(current_user = Depends(get_current_user)):
    """
    Dependency to ensure current user is either a member or admin
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.MEMBER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Member or Admin access required"
        )
    return current_user