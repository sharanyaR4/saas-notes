from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import LoginRequest, Token
from app.core.security import verify_password, create_access_token
from app.crud.user import get_user_by_email
from app.core.exceptions import InvalidCredentials

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = None
    
    # Try to find user in both tenants (Acme=1, Globex=2)
    for tenant_id in [1, 2]:
        user = get_user_by_email(db, email=login_data.email, tenant_id=tenant_id)
        if user:
            print(f"Found user: {user.email}, Role: {user.role}, Tenant: {tenant_id}")
            break
    
    if not user:
        print(f"User not found: {login_data.email}")
        raise InvalidCredentials()
    
    # Verify password
    password_valid = verify_password(login_data.password, user.password_hash)
    print(f"Password verification for {user.email}: {password_valid}")
    
    if not password_valid:
        print(f"Invalid password for user: {user.email}")
        raise InvalidCredentials()
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "tenant_id": user.tenant_id,
            "role": user.role.value
        }
    )
    
    print(f"Login successful for: {user.email}, Role: {user.role.value}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }