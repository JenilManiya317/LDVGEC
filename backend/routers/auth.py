"""
Authentication Router — JWT-based registration and login for farmers and customers.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

from backend.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from backend.database import get_db

logger = logging.getLogger("farmwise.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Pydantic Models ---

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # 'farmer' or 'customer'
    phone: Optional[str] = ""
    location: Optional[str] = ""
    farm_name: Optional[str] = ""
    total_area: Optional[str] = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    farm_name: Optional[str] = None
    total_area: Optional[str] = None
    avatar: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# --- Helpers ---

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(token: str = "", db=None):
    """Extract the current user from JWT token."""
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    user_id = payload.get("user_id")
    if not user_id:
        return None
    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cursor:
        row = await cursor.fetchone()
        if row:
            return dict(row)
    return None


def user_row_to_dict(row) -> dict:
    """Convert a database row to a user profile dictionary."""
    d = dict(row)
    d.pop("password_hash", None)
    return d


# --- Routes ---

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db=Depends(get_db)):
    """Register a new farmer or customer."""
    if req.role not in ("farmer", "customer"):
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'customer'")

    # Check if email already exists
    async with db.execute("SELECT id FROM users WHERE email = ?", (req.email,)) as cursor:
        existing = await cursor.fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

    password_hash = pwd_context.hash(req.password)

    await db.execute(
        """INSERT INTO users (name, email, password_hash, role, phone, location, farm_name, total_area)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (req.name, req.email, password_hash, req.role, req.phone, req.location, req.farm_name, req.total_area),
    )
    await db.commit()

    # Get the created user
    async with db.execute("SELECT * FROM users WHERE email = ?", (req.email,)) as cursor:
        user_row = await cursor.fetchone()

    user = user_row_to_dict(user_row)
    token = create_access_token({"user_id": user["id"], "role": user["role"], "email": user["email"]})

    return TokenResponse(access_token=token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db=Depends(get_db)):
    """Login with email and password."""
    async with db.execute("SELECT * FROM users WHERE email = ?", (req.email,)) as cursor:
        user_row = await cursor.fetchone()

    if not user_row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_data = dict(user_row)
    if not pwd_context.verify(req.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = user_row_to_dict(user_row)
    token = create_access_token({"user_id": user["id"], "role": user["role"], "email": user["email"]})

    return TokenResponse(access_token=token, user=user)


@router.get("/profile")
async def get_profile(authorization: str = "", db=Depends(get_db)):
    """Get current user's profile."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")
    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cursor:
        user_row = await cursor.fetchone()

    if not user_row:
        raise HTTPException(status_code=404, detail="User not found")

    return user_row_to_dict(user_row)


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, authorization: str = "", db=Depends(get_db)):
    """Update current user's profile."""
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = payload.get("user_id")
    updates = {k: v for k, v in req.model_dump().items() if v is not None}

    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [user_id]
        await db.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
        await db.commit()

    async with db.execute("SELECT * FROM users WHERE id = ?", (user_id,)) as cursor:
        user_row = await cursor.fetchone()

    return user_row_to_dict(user_row)
