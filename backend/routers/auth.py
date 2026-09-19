"""
Authentication Router — JWT-based registration and login backed by MongoDB.
Enforces multi-user security with user_id extraction from JWT.
"""

import hashlib
import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
import bcrypt
from jose import JWTError, jwt

from backend.config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    JWT_EXPIRE_MINUTES,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SENDER_EMAIL,
)
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


def hash_otp(otp: str) -> str:
    """Hash numeric OTP using SHA-256."""
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()


def generate_otp() -> str:
    """Generate secure 6-digit numeric OTP code."""
    return f"{secrets.randbelow(1000000):06d}"


def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Send a highly professional OTP verification email to user using Brevo API or standard SMTP configuration.
    From: ddoinfo098@gmail.com
    Logs OTP to console/logger if email delivery service is not configured or fails.
    """
    sender = SENDER_EMAIL or "ddoinfo098@gmail.com"
    user_login = SMTP_USER or sender
    logger.info(f"Generated Registration OTP for {to_email}: {otp_code} (Sender: {sender})")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FarmWise Email Verification</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 10px; color: #1e293b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Header Banner with Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%); padding: 36px 30px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; h-60px; background: rgba(255,255,255,0.2); border-radius: 16px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.3);">
                    <span style="font-size: 32px; line-height: 1;">🌱</span>
                  </div>
                  <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0; tracking: -0.5px;">FarmWise Agritech</h1>
                  <p style="color: #a7f3d0; font-size: 13px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: 0.5px; text-transform: uppercase;">Smart Agriculture & Direct Mandi Ecosystem</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 36px 32px 28px 32px;">
                  <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Verify Your Email Address</h2>
                  <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                    Welcome to FarmWise! Use the official 6-digit One-Time Password (OTP) below to verify your email address and activate your account.
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <span style="display: block; color: #166534; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
                    <div style="font-size: 40px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 12px; color: #047857; margin: 8px 0; text-indent: 12px;">{otp_code}</div>
                    <div style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-top: 8px;">
                      ⏱️ Valid for 5 Minutes
                    </div>
                  </div>

                  <!-- Security Reminder -->
                  <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                    <p style="color: #334155; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">🛡️ Security Notice:</p>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0;">
                      Never share this OTP with anyone, including FarmWise staff. Our team will never ask for your verification code.
                    </p>
                  </div>

                  <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                    If you did not initiate this registration request, please ignore this email or contact support at <a href="mailto:ddoinfo098@gmail.com" style="color: #059669; font-weight: 700; text-decoration: underline;">ddoinfo098@gmail.com</a>.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; font-weight: 700; margin: 0 0 4px 0;">FarmWise Agritech Private Limited</p>
                  <p style="color: #94a3b8; font-size: 11px; margin: 0 0 8px 0;">Connecting Farmers & Direct Mandi Buyers Across India</p>
                  <p style="color: #cbd5e1; font-size: 10px; margin: 0;">
                    Official Communication • Sender: ddoinfo098@gmail.com • © 2026 FarmWise. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    # --- Method 1: Brevo HTTP API (Highest Deliverability) ---
    from backend.config import BREVO_API_KEY
    if BREVO_API_KEY:
        try:
            import httpx
            headers = {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            payload = {
                "sender": {"name": "FarmWise Security", "email": sender},
                "to": [{"email": to_email}],
                "subject": f"🔐 {otp_code} is your FarmWise Verification Code",
                "htmlContent": html_content
            }
            response = httpx.post("https://api.brevo.com/v3/smtp/email", json=payload, headers=headers, timeout=10.0)
            if response.status_code in (200, 201, 202):
                logger.info(f"Successfully delivered OTP email to {to_email} via Brevo API")
                return True
            else:
                logger.error(f"Brevo API error ({response.status_code}): {response.text}")
        except Exception as err:
            logger.error(f"Failed sending OTP via Brevo API: {err}")

    # --- Method 2: Standard SMTP (Gmail or Brevo SMTP Relay) ---
    if not SMTP_PASS:
        logger.info(
            f"⚡ [DEV LOG] OTP for {to_email} is: [{otp_code}]. "
            f"To send live emails, set BREVO_API_KEY or SMTP_PASS in .env"
        )
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔐 {otp_code} is your FarmWise Verification Code"
        msg["From"] = f"FarmWise Security <{sender}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        if SMTP_SECURE:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
                server.starttls()
                server.login(user_login, SMTP_PASS)
                server.sendmail(sender, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
                server.login(user_login, SMTP_PASS)
                server.sendmail(sender, [to_email], msg.as_string())

        logger.info(f"Successfully sent professional OTP email to {to_email} via {sender}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMTP OTP email to {to_email}: {e}. OTP Code: {otp_code}")
        return False




# --- Pydantic Models ---

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # 'farmer' or 'customer'
    phone: Optional[str] = ""
    location: Optional[str] = ""
    avatar: Optional[str] = ""
    farm_name: Optional[str] = ""
    total_area: Optional[str] = ""


class SendOtpRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class ResendOtpRequest(BaseModel):
    email: str

    location: Optional[str] = ""
    avatar: Optional[str] = ""
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
    """Register a new farmer or customer in MongoDB with email OTP verification required."""
    if req.role not in ("farmer", "customer"):
        raise HTTPException(status_code=400, detail="Role must be 'farmer' or 'customer'")

    email_lower = req.email.strip().lower()

    # Check if email already exists in MongoDB
    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Check if email was pre-verified via the inline "Verify" button
    pending_doc = await db.pending_otps.find_one({"email": email_lower})
    is_pre_verified = bool(pending_doc and pending_doc.get("is_email_verified"))

    password_hash = hash_password(req.password)
    otp_code = generate_otp()
    otp_hash = hash_otp(otp_code)
    now = datetime.now(timezone.utc)
    otp_expires_at = now + timedelta(minutes=5)

    user_doc = {
        "name": req.name,
        "email": email_lower,
        "password_hash": password_hash,
        "role": req.role,
        "phone": req.phone or "",
        "location": req.location or "",
        "farm_name": req.farm_name or "",
        "total_area": req.total_area or "",
        "avatar": req.avatar or "",
        "rating": 0.0,
        "reviews_count": 0,
        "is_email_verified": is_pre_verified,
        "isEmailVerified": is_pre_verified,
        "created_at": now,
    }

    if not is_pre_verified:
        user_doc.update({
            "otp_hash": otp_hash,
            "otp_expires_at": otp_expires_at,
            "otp_attempts": 0,
            "otp_last_sent_at": now,
        })

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
                    "created_at": now,
                }
            },
            upsert=True,
        )

    # Clean up pending_otps if present
    if pending_doc:
        await db.pending_otps.delete_one({"_id": pending_doc["_id"]})

    # Send initial OTP email if not already pre-verified
    if not is_pre_verified:
        send_otp_email(email_lower, otp_code)

    formatted_user = format_doc(user_doc)
    token = create_access_token({"user_id": formatted_user["id"], "role": formatted_user["role"], "email": formatted_user["email"]})

    return TokenResponse(access_token=token, user=formatted_user)


@router.post("/send-otp")
async def send_otp(req: SendOtpRequest, db=Depends(get_db)):
    """Generate and send a new OTP to the specified email (supports registered & pre-registration emails)."""
    email_lower = req.email.strip().lower()
    if not email_lower or "@" not in email_lower:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    now = datetime.now(timezone.utc)
    user_doc = await db.users.find_one({"email": email_lower})
    pending_doc = await db.pending_otps.find_one({"email": email_lower}) if not user_doc else None

    target_doc = user_doc or pending_doc
    last_sent = target_doc.get("otp_last_sent_at") if target_doc else None

    if last_sent:
        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)
        elapsed = (now - last_sent).total_seconds()
        if elapsed < 60:
            remaining = int(60 - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting a new OTP code."
            )

    otp_code = generate_otp()
    otp_hash = hash_otp(otp_code)
    otp_expires_at = now + timedelta(minutes=5)

    if user_doc:
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {
                    "otp_hash": otp_hash,
                    "otp_expires_at": otp_expires_at,
                    "otp_attempts": 0,
                    "otp_last_sent_at": now,
                }
            }
        )
    else:
        await db.pending_otps.update_one(
            {"email": email_lower},
            {
                "$set": {
                    "email": email_lower,
                    "otp_hash": otp_hash,
                    "otp_expires_at": otp_expires_at,
                    "otp_attempts": 0,
                    "otp_last_sent_at": now,
                    "is_email_verified": False,
                    "isEmailVerified": False,
                }
            },
            upsert=True
        )

    send_otp_email(email_lower, otp_code)
    return {"message": "OTP code sent successfully", "email": email_lower}


@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest, db=Depends(get_db)):
    """Verify 6-digit numeric OTP code for user or pre-registration email verification."""
    email_lower = req.email.strip().lower()
    now = datetime.now(timezone.utc)

    user_doc = await db.users.find_one({"email": email_lower})
    pending_doc = await db.pending_otps.find_one({"email": email_lower}) if not user_doc else None

    target_doc = user_doc or pending_doc
    if not target_doc:
        raise HTTPException(status_code=404, detail="No OTP requested for this email address.")

    if target_doc.get("is_email_verified"):
        return {"message": "Email is already verified", "is_email_verified": True}

    attempts = target_doc.get("otp_attempts", 0)
    if attempts >= 5:
        raise HTTPException(
            status_code=400,
            detail="Maximum verification attempts (5) exceeded. Please request a new OTP code."
        )

    expires_at = target_doc.get("otp_expires_at")
    if not expires_at:
        raise HTTPException(status_code=400, detail="No OTP requested or code expired. Please request a new OTP.")

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        raise HTTPException(status_code=400, detail="OTP code has expired. Please request a new OTP.")

    provided_hash = hash_otp(req.otp.strip())
    if provided_hash != target_doc.get("otp_hash"):
        coll = db.users if user_doc else db.pending_otps
        await coll.update_one(
            {"_id": target_doc["_id"]},
            {"$inc": {"otp_attempts": 1}}
        )
        remaining_attempts = 5 - (attempts + 1)
        if remaining_attempts <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP code. Maximum verification attempts (5) reached. Please request a new code."
            )
        raise HTTPException(
            status_code=400,
            detail=f"Invalid OTP code. {remaining_attempts} attempt(s) remaining."
        )

    # Verification successful
    if user_doc:
        await db.users.update_one(
            {"_id": user_doc["_id"]},
            {
                "$set": {"is_email_verified": True, "isEmailVerified": True},
                "$unset": {"otp_hash": "", "otp_expires_at": "", "otp_attempts": "", "otp_last_sent_at": ""}
            }
        )
    else:
        await db.pending_otps.update_one(
            {"_id": pending_doc["_id"]},
            {
                "$set": {"is_email_verified": True, "isEmailVerified": True},
                "$unset": {"otp_hash": "", "otp_expires_at": "", "otp_attempts": "", "otp_last_sent_at": ""}
            }
        )

    return {"message": "Email verified successfully", "is_email_verified": True}


@router.post("/resend-otp")
async def resend_otp(req: ResendOtpRequest, db=Depends(get_db)):
    """Resend 6-digit OTP code enforcing 60-second rate limiting."""
    email_lower = req.email.strip().lower()
    return await send_otp(SendOtpRequest(email=email_lower), db=db)



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

