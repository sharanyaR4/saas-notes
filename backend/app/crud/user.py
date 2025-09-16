from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from typing import Optional, List

def get_user_by_id(db: Session, user_id: int, tenant_id: int) -> Optional[User]:
    return db.query(User).filter(
        User.id == user_id, 
        User.tenant_id == tenant_id
    ).first()

def get_user_by_email(db: Session, email: str, tenant_id: int) -> Optional[User]:
    return db.query(User).filter(
        User.email == email, 
        User.tenant_id == tenant_id
    ).first()

def get_users_by_tenant(db: Session, tenant_id: int, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).filter(
        User.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    password_hash = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        password_hash=password_hash,
        role=user.role,
        tenant_id=user.tenant_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, tenant_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = get_user_by_id(db, user_id, tenant_id)
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int, tenant_id: int) -> bool:
    db_user = get_user_by_id(db, user_id, tenant_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True