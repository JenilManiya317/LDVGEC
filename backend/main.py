"""
FarmWise Backend — FastAPI Application Entry Point.
Serves the ML crop-yield prediction pipeline, AI diagnostics, and MongoDB-backed REST APIs.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import CORS_ORIGINS
from backend.database import init_db, close_db, get_db
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

    # Initialize MongoDB connection & indexes
    try:
        await init_db()
        logger.info("MongoDB initialized & collection indexes verified.")
    except Exception as e:
        logger.warning(f"MongoDB connection deferred or failed: {e}")

    # Load ML model
    try:
        model_loaded = predictor.load_model()
        if model_loaded:
            logger.info(f"ML Model loaded: {predictor.model_info}")
        else:
            logger.warning(
                "ML model NOT loaded. Yield prediction endpoint will return 503."
            )
    except Exception as e:
        logger.warning(f"ML model loading deferred or failed: {e}")

    logger.info("FarmWise Backend Ready!")
    logger.info("=" * 60)


    yield

    # --- Shutdown ---
    logger.info("FarmWise Backend Shutting Down...")
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="FarmWise API",
    description="Smart Farming Platform — ML-powered crop yield prediction, AI diagnostics, and MongoDB marketplace.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request, exc):
    return JSONResponse(
        status_code=503,
        content={"detail": "MongoDB connection error. Please verify MONGODB_URI in your Render environment variables and set 0.0.0.0/0 in MongoDB Atlas Network Access."},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend processing error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )


# Register routers
from backend.routers import auth, farm, predict, crop_health, weather, market, marketplace

app.include_router(auth.router)
app.include_router(farm.router)
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
        "database": "MongoDB (FarmWise)",
        "status": "running",
        "model_status": predictor.model_info.get("status", "not_loaded"),
        "endpoints": {
            "docs": "/docs",
            "auth": "/api/auth",
            "farmer_farm": "/api/farmer/farm",
            "farmer_crops": "/api/farmer/crops",
            "predict": "/api/predict",
            "predict_history": "/api/predict/history",
            "crop_health": "/api/crop-health",
            "crop_health_history": "/api/crop-health/history",
            "weather": "/api/weather",
            "market_prices": "/api/market-prices",
            "marketplace": "/api/marketplace",
            "orders": "/api/orders",
        },
    }


@app.get("/health")
async def health_check():
    db_status = "connected"
    try:
        database = await get_db()
        if database is not None:
            await database.command("ping")
        else:
            db_status = "uninitialized"
    except Exception as e:
        db_status = f"unavailable: {str(e)[:50]}"

    return {
        "status": "ok",
        "database": db_status,
        "database_engine": "MongoDB Atlas",
        "model_loaded": predictor.is_loaded,
    }

