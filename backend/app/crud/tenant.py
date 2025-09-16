from sqlalchemy.orm import Session
from app.models.tenant import Tenant, SubscriptionPlan
from app.schemas.tenant import TenantCreate, TenantUpdate
from typing import Optional

def get_tenant_by_id(db: Session, tenant_id: int) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.id == tenant_id).first()

def get_tenant_by_slug(db: Session, slug: str) -> Optional[Tenant]:
    return db.query(Tenant).filter(Tenant.slug == slug).first()

def create_tenant(db: Session, tenant: TenantCreate) -> Tenant:
    db_tenant = Tenant(**tenant.model_dump())
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

def update_tenant(db: Session, tenant_id: int, tenant_update: TenantUpdate) -> Optional[Tenant]:
    db_tenant = get_tenant_by_id(db, tenant_id)
    if not db_tenant:
        return None
    
    update_data = tenant_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tenant, key, value)
    
    db.commit()
    db.refresh(db_tenant)
    return db_tenant

def upgrade_tenant_subscription(db: Session, tenant_id: int) -> Optional[Tenant]:
    db_tenant = get_tenant_by_id(db, tenant_id)
    if not db_tenant:
        return None
    
    db_tenant.subscription_plan = SubscriptionPlan.PRO
    db.commit()
    db.refresh(db_tenant)
    return db_tenant