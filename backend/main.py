"""
FarmWise Backend — FastAPI Application Entry Point.
Serves the ML crop-yield prediction pipeline and all REST APIs.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS
from backend.database import init_db
from backend.ml.predictor import predictor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("farmwise")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # --- Startup ---
    logger.info("=" * 60)
    logger.info("FarmWise Backend Starting...")
    logger.info("=" * 60)

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Load ML model
    model_loaded = predictor.load_model()
    if model_loaded:
        logger.info(f"ML Model loaded: {predictor.model_info}")
    else:
        logger.warning(
            "ML model NOT loaded. Yield prediction endpoint will return 503. "
            "Run: python -m backend.scripts.train_model"
        )

    logger.info("FarmWise Backend Ready!")
    logger.info("=" * 60)

    yield

    # --- Shutdown ---
    logger.info("FarmWise Backend Shutting Down...")


# Create FastAPI app
app = FastAPI(
    title="FarmWise API",
    description="Smart Farming Platform — ML-powered crop yield prediction, AI diagnostics, and marketplace.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from backend.routers import auth, predict, crop_health, weather, market, marketplace

app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(crop_health.router)
app.include_router(weather.router)
app.include_router(market.router)
app.include_router(marketplace.router)


@app.get("/")
async def root():
    return {
        "name": "FarmWise API",
        "version": "1.0.0",
        "status": "running",
        "model_status": predictor.model_info.get("status", "not_loaded"),
        "endpoints": {
            "docs": "/docs",
            "auth": "/api/auth",
            "predict": "/api/predict",
            "crop_health": "/api/crop-health",
            "weather": "/api/weather",
            "market_prices": "/api/market-prices",
            "marketplace": "/api/marketplace",
            "orders": "/api/orders",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": predictor.is_loaded}
