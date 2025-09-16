from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.tenant import SubscriptionPlan

class TenantBase(BaseModel):
    slug: str
    name: str
    subscription_plan: Optional[SubscriptionPlan] = SubscriptionPlan.FREE

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    subscription_plan: Optional[SubscriptionPlan] = None

class Tenant(TenantBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UpgradeResponse(BaseModel):
    message: str
    subscription_plan: SubscriptionPlan