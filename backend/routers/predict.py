"""
Yield Prediction Router — Serves crop yield predictions from the trained ML pipeline
and persists prediction history in MongoDB with user data isolation.
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field

from backend.ml.predictor import predictor
from backend.database import get_db, format_doc
from backend.routers.auth import get_current_user

logger = logging.getLogger("farmwise.predict")
router = APIRouter(prefix="/api/predict", tags=["Yield Prediction"])


class YieldPredictionRequest(BaseModel):
    """Input data for crop yield prediction."""
    Crop: str = Field(..., description="Crop name, e.g. 'Rice', 'Wheat', 'Tomato'")
    Season: str = Field(..., description="Growing season: 'Kharif', 'Rabi', 'Whole Year', etc.")
    State: str = Field(..., description="Indian state name")
    Area: float = Field(..., ge=0, description="Cultivation area in hectares")
    Annual_Rainfall: float = Field(default=1000.0, ge=0, description="Annual rainfall in mm")
    Fertilizer: float = Field(default=5000.0, ge=0, description="Total fertilizer used (kg)")
    Pesticide: float = Field(default=500.0, ge=0, description="Total pesticide used (kg)")
    Temperature_C: float = Field(default=25.0, description="Average temperature in °C")
    Humidity_Percent: float = Field(default=65.0, ge=0, le=100, description="Average humidity %")
    Soil_Type: str = Field(default="Loamy", description="Soil type")
    Soil_pH: float = Field(default=6.5, ge=0, le=14, description="Soil pH level")
    Nitrogen_kg_ha: float = Field(default=120.0, ge=0, description="Nitrogen kg/ha")
    Phosphorus_kg_ha: float = Field(default=50.0, ge=0, description="Phosphorus kg/ha")
    Potassium_kg_ha: float = Field(default=60.0, ge=0, description="Potassium kg/ha")
    Soil_Moisture_Percent: float = Field(default=55.0, ge=0, le=100, description="Soil moisture %")
    Irrigation_Type: str = Field(default="Canal", description="Irrigation method")
    Crop_Variety: str = Field(default="Improved", description="Crop variety name")
    Sowing_Month: str = Field(default="June", description="Sowing month")
    Harvest_Month: str = Field(default="October", description="Harvest month")
    Growing_Days: int = Field(default=120, ge=0, description="Number of growing days")
    Soil_Fertility_Index: float = Field(default=60.0, ge=0, le=100, description="Soil fertility index")
    Pest_Risk_Index: float = Field(default=30.0, ge=0, le=100, description="Pest risk index")
    Disease_Risk_Index: float = Field(default=25.0, ge=0, le=100, description="Disease risk index")
    Water_Availability_Index: float = Field(default=65.0, ge=0, le=100, description="Water availability index")
    Weather_Stress_Index: float = Field(default=35.0, ge=0, le=100, description="Weather stress index")
    Crop_Health_Index: float = Field(default=70.0, ge=0, le=100, description="Crop health index")


class YieldPredictionResponse(BaseModel):
    predicted_yield: float
    crop: str
    season: str
    state: str
    area: float
    model_used: str
    unit: str


@router.post("/yield", response_model=YieldPredictionResponse)
async def predict_yield(
    req: YieldPredictionRequest,
    authorization: str = Header(default=""),
    db=Depends(get_db),
):
    """Predict crop yield based on agronomic input features and save in MongoDB."""
    if not predictor.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Run the training pipeline first: python backend/scripts/train_model.py"
        )

    try:
        input_data = req.model_dump()
        result = predictor.predict(input_data)

        # Extract user if token provided
        user = await get_current_user(authorization, db)
        if user:
            prediction_doc = {
                "user_id": user["_id"],  # ObjectId user_id
                "crop": result["crop"],
                "season": result["season"],
                "state": result["state"],
                "area": result["area"],
                "input_features": input_data,
                "predicted_yield": result["predicted_yield"],
                "unit": result["unit"],
                "model_used": result["model_used"],
                "created_at": datetime.now(timezone.utc),
            }
            await db.predictions.insert_one(prediction_doc)

        return YieldPredictionResponse(**result)
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/history")
async def get_prediction_history(authorization: str = Header(default=""), db=Depends(get_db)):
    """Retrieve yield prediction history for authenticated user."""
    user = await get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    cursor = db.predictions.find({"user_id": user["_id"]}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    formatted = [format_doc(d) for d in docs]
    return {"predictions": formatted, "total": len(formatted)}


@router.get("/features")
async def get_features():
    """Return expected input features and their valid values."""
    if not predictor.is_loaded:
        return {
            "status": "model_not_loaded",
            "message": "Train the model first to get valid feature values.",
            "valid_values": predictor.get_valid_values()
        }
    return {
        "status": "ready",
        "features_spec": predictor.features_spec,
        "valid_values": predictor.get_valid_values()
    }


@router.get("/model-info")
async def get_model_info():
    """Return metadata about the currently loaded ML model."""
    return predictor.model_info
