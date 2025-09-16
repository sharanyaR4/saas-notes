from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import User, UserCreate
from app.crud import user as crud_user
from app.core.auth import require_admin, require_member_or_admin

router = APIRouter()

@router.post("/users", response_model=User)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)  # Only admins can invite users
):
    """Create a new user in the current tenant (admin only)"""
    # Set tenant_id to current user's tenant
    user_data.tenant_id = current_user.tenant_id
    
    # Check if user already exists
    existing_user = crud_user.get_user_by_email(
        db, email=user_data.email, tenant_id=current_user.tenant_id
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered in this tenant"
        )
    
    user = crud_user.create_user(db=db, user=user_data)
    return user

@router.get("/users/me", response_model=User)
async def get_current_user(
    current_user = Depends(require_member_or_admin)
):
    """Get current user profile"""
    return current_user