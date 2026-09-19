"""
FarmWise Backend Configuration.
Manages environment variables, file paths, and application settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Paths ---
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DB_PATH = BASE_DIR / "backend" / "farmwise.db"
TRAIN_CSV = DATA_DIR / "train.csv"
TEST_CSV = DATA_DIR / "test.csv"
ENRICHED_CSV = DATA_DIR / "crop_yield_enriched.csv"
FEATURES_SPEC = DATA_DIR / "features_spec.json"
MODEL_PIPELINE_PATH = MODELS_DIR / "best_crop_yield_pipeline.joblib"
FEATURES_JSON_PATH = MODELS_DIR / "features.json"

# Ensure directories exist (safe for read-only serverless runtimes)
try:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
except (OSError, PermissionError):
    pass

# --- Database (MongoDB Atlas) ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", os.getenv("MONGODB_DB_NAME", "FarmWise"))

# --- Security ---
JWT_SECRET = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "farmwise-dev-secret-change-in-production"))
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# --- Frontend & CORS ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
_env_cors = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://ldvgec-lemon.vercel.app",
]
if FRONTEND_URL and FRONTEND_URL not in CORS_ORIGINS:
    CORS_ORIGINS.append(FRONTEND_URL.rstrip("/"))
if _env_cors:
    for o in _env_cors.split(","):
        cleaned = o.strip().rstrip("/")
        if cleaned and cleaned not in CORS_ORIGINS:
            CORS_ORIGINS.append(cleaned)


# --- External API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# --- Email / SMTP ---
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_SECURE = os.getenv("SMTP_SECURE", "true").lower() in ("true", "1", "yes")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "ddoinfo098@gmail.com")
SMTP_USER = os.getenv("SMTP_USER", SENDER_EMAIL)
SMTP_PASS = os.getenv("SMTP_PASS", "")

# --- Brevo API Key ---
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")

