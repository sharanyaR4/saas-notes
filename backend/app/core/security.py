from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.schemas.auth import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    result = pwd_context.verify(plain_password, hashed_password)
    print(f"Password verification result: {result}")
    return result

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"Created token for: {data.get('sub')} with role: {data.get('role')}")
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        tenant_id: int = payload.get("tenant_id")
        user_id: int = payload.get("user_id")
        role: str = payload.get("role")
        
        print(f"Token decoded - Email: {email}, Tenant: {tenant_id}, Role: {role}")
        
        if email is None:
            print("Email is None in token")
            return None
        
        token_data = TokenData(
            email=email, 
            tenant_id=tenant_id, 
            user_id=user_id, 
            role=role
        )
        return token_data
    except JWTError as e:
        print(f"JWT Error: {e}")
        return None