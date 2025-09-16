from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.tenant import Tenant, SubscriptionPlan
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password
from app.crud.user import get_user_by_email

def seed_initial_data():
    db = SessionLocal()
    
    try:
        # Always check for required users, regardless of tenant existence
        required_users = [
            ("admin@acme.test", "acme", 1, UserRole.ADMIN),
            ("user@acme.test", "acme", 1, UserRole.MEMBER),
            ("admin@globex.test", "globex", 2, UserRole.ADMIN),
            ("user@globex.test", "globex", 2, UserRole.MEMBER)
        ]
        
        print("=== CHECKING DATABASE STATE ===")
        existing_users = db.query(User).all()
        existing_tenants = db.query(Tenant).all()
        
        print(f"Existing users: {[u.email for u in existing_users]}")
        print(f"Existing tenants: {[t.slug for t in existing_tenants]}")
        
        # Ensure tenants exist
        acme_tenant = db.query(Tenant).filter(Tenant.slug == "acme").first()
        if not acme_tenant:
            acme_tenant = Tenant(
                slug="acme",
                name="Acme Corporation",
                subscription_plan=SubscriptionPlan.FREE
            )
            db.add(acme_tenant)
            db.flush()
            print(f"Created Acme tenant with ID: {acme_tenant.id}")
        
        globex_tenant = db.query(Tenant).filter(Tenant.slug == "globex").first()
        if not globex_tenant:
            globex_tenant = Tenant(
                slug="globex",
                name="Globex Corporation",
                subscription_plan=SubscriptionPlan.FREE
            )
            db.add(globex_tenant)
            db.flush()
            print(f"Created Globex tenant with ID: {globex_tenant.id}")
        
        # Check for missing required users
        missing_users = []
        for email, tenant_slug, tenant_id, role in required_users:
            # Use actual tenant ID from database
            actual_tenant_id = acme_tenant.id if tenant_slug == "acme" else globex_tenant.id
            user = get_user_by_email(db, email=email, tenant_id=actual_tenant_id)
            if not user:
                missing_users.append((email, actual_tenant_id, role))
        
        if missing_users:
            print(f"Missing required users: {[u[0] for u in missing_users]}")
            
            # Create missing users
            for email, tenant_id, role in missing_users:
                new_user = User(
                    tenant_id=tenant_id,
                    email=email,
                    password_hash=get_password_hash("password"),
                    role=role
                )
                db.add(new_user)
                print(f"Creating missing user: {email} ({role.value})")
            
            db.commit()
            print("Missing users created successfully")
        else:
            print("All required users already exist")
        
        # Final verification
        print("\n=== FINAL VERIFICATION ===")
        all_users = db.query(User).all()
        print(f"Total users in database: {len(all_users)}")
        
        for email, tenant_slug, _, role in required_users:
            actual_tenant_id = acme_tenant.id if tenant_slug == "acme" else globex_tenant.id
            user = get_user_by_email(db, email=email, tenant_id=actual_tenant_id)
            if user:
                pwd_check = verify_password("password", user.password_hash)
                status = "✓" if pwd_check else "✗"
                print(f"  {email} | {role.value} | Tenant {actual_tenant_id} | Password: {status}")
            else:
                print(f"  {email} | MISSING!")
        
        print("Seeding completed successfully")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()