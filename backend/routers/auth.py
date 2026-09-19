"""
Authentication Router — JWT-based registration and login backed by MongoDB.
Enforces multi-user security with user_id extraction from JWT.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt

from backend.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from backend.database import get_db, to_object_id, format_doc

logger = logging.getLogger("farmwise.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def hash_password(password: str) -> str:
    """Hash password using bcrypt directly."""
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        pwd_bytes = password.encode('utf-8')[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode('utf-8'))
    except Exception:
        return False


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
        clean_token = token.replace("Bearer ", "") if token.startswith("Bearer ") else token
        payload = jwt.decode(clean_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(authorization: str = Header(default=""), db=Depends(get_db)) -> Optional[dict]:
    """Extract authenticated user document from JWT in Authorization header."""
    if not authorization:
        return None
    payload = verify_token(authorization)
    if not payload:
        return None
    user_id_str = payload.get("user_id")
    if not user_id_str:
        return None

    obj_id = to_object_id(user_id_str)
    if not obj_id:
        return None

    user_doc = await db.users.find_one({"_id": obj_id})
    return user_doc


# --- Routes ---

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db=Depends(get_db)):
    """Register a new farmer or customer in MongoDB."""
    if req.role not in ("farmer", "customer"):
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'customer'")

    email_lower = req.email.strip().lower()

    # Check if email already exists in MongoDB
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    password_hash = hash_password(req.password)

    user_doc = {
        "name": req.name,
        "email": email_lower,
        "password_hash": password_hash,
        "role": req.role,
        "phone": req.phone or "",
        "location": req.location or "",
        "farm_name": req.farm_name or "",
        "total_area": req.total_area or "",
        "avatar": "",
        "rating": 0.0,
        "reviews_count": 0,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = result.inserted_id
    user_doc["_id"] = user_id

    # If farmer, initialize farm profile in farm_profiles collection
    if req.role == "farmer":
        await db.farm_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "user_id": user_id,
                    "name": req.farm_name or f"{req.name}'s Farm",
                    "total_area": float(req.total_area) if req.total_area and req.total_area.replace('.', '', 1).isdigit() else 10.0,
                    "location": req.location or "",
                    "state": req.location.split(",")[-1].strip() if "," in (req.location or "") else "Gujarat",
                    "created_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

    formatted_user = format_doc(user_doc)
    token = create_access_token({"user_id": formatted_user["id"], "role": formatted_user["role"], "email": formatted_user["email"]})

    return TokenResponse(access_token=token, user=formatted_user)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db=Depends(get_db)):
    """Login with email and password using MongoDB users collection."""
    email_lower = req.email.strip().lower()
    user_doc = await db.users.find_one({"email": email_lower})

    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(req.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    formatted_user = format_doc(user_doc)
    token = create_access_token({"user_id": formatted_user["id"], "role": formatted_user["role"], "email": formatted_user["email"]})

    return TokenResponse(access_token=token, user=formatted_user)


@router.get("/profile")
async def get_profile(authorization: str = Header(default=""), db=Depends(get_db)):
    """Get current user's profile from MongoDB."""
    user_doc = await get_current_user(authorization, db)
    if not user_doc:
        raise HTTPException(status_code=401, detail="Not authenticated or invalid token")

    return format_doc(user_doc)


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, authorization: str = Header(default=""), db=Depends(get_db)):
    """Update current user's profile in MongoDB."""
    user_doc = await get_current_user(authorization, db)
    if not user_doc:
        raise HTTPException(status_code=401, detail="Not authenticated or invalid token")

    user_id = user_doc["_id"]
    updates = {k: v for k, v in req.model_dump().items() if v is not None}

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.users.update_one({"_id": user_id}, {"$set": updates})

        # Sync farm profile if farm_name or total_area changed
        if "farm_name" in updates or "total_area" in updates or "location" in updates:
            farm_updates = {}
            if "farm_name" in updates:
                farm_updates["name"] = updates["farm_name"]
            if "total_area" in updates:
                try:
                    farm_updates["total_area"] = float(updates["total_area"])
                except (ValueError, TypeError):
                    pass
            if "location" in updates:
                farm_updates["location"] = updates["location"]

            if farm_updates:
                await db.farm_profiles.update_one(
                    {"user_id": user_id},
                    {"$set": farm_updates},
                    upsert=True,
                )

    updated_doc = await db.users.find_one({"_id": user_id})
    return format_doc(updated_doc)
