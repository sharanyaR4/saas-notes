from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.user import UserRole

class UserBase(BaseModel):
    email: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    tenant_id: int

class UserUpdate(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase):
    id: int
    tenant_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserInDB(User):
    password_hash: str