from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.tenant import UpgradeResponse
from app.crud import tenant as crud_tenant
from app.core.auth import require_admin
from app.core.exceptions import TenantNotFound

router = APIRouter()

@router.post("/tenants/{slug}/upgrade", response_model=UpgradeResponse)
async def upgrade_tenant(
    slug: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    # Get tenant by slug
    tenant = crud_tenant.get_tenant_by_slug(db, slug)
    if not tenant:
        raise TenantNotFound()
    
    # Verify user belongs to this tenant
    if current_user.tenant_id != tenant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot upgrade a different tenant"
        )
    
    # Upgrade the tenant
    upgraded_tenant = crud_tenant.upgrade_tenant_subscription(db, tenant.id)
    if not upgraded_tenant:
        raise TenantNotFound()
    
    return UpgradeResponse(
        message="Tenant successfully upgraded to Pro plan",
        subscription_plan=upgraded_tenant.subscription_plan
    )