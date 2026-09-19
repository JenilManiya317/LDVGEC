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

# Ensure directories exist
MODELS_DIR.mkdir(exist_ok=True)

# --- Database (MongoDB) ---
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "FarmWise")

# --- Security ---
JWT_SECRET = os.getenv("JWT_SECRET", "farmwise-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# --- API Keys ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

# --- Server ---
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
