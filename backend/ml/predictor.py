"""
ML Model Predictor — Loads the trained SafeCropYieldPipeline and serves predictions.
Singleton pattern: model loaded once at startup, reused across all requests.
"""

import json
import logging
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional

import sys
from backend.config import MODEL_PIPELINE_PATH, FEATURES_JSON_PATH, FEATURES_SPEC
import backend.ml.pipeline.train as _pipeline_train
import backend.ml.pipeline.features as _pipeline_features

# Register aliases for backwards compatibility with any pickled pipelines
sys.modules.setdefault("src.train", _pipeline_train)
sys.modules.setdefault("src.features", _pipeline_features)

logger = logging.getLogger("farmwise.predictor")


class CropYieldPredictor:
    """Wraps the trained SafeCropYieldPipeline for serving predictions."""

    _instance: Optional["CropYieldPredictor"] = None
    _pipeline = None
    _features_spec: dict = {}
    _model_info: dict = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def load_model(self):
        """Load the trained pipeline from disk."""
        if not MODEL_PIPELINE_PATH.exists():
            logger.warning(
                f"Model file not found at {MODEL_PIPELINE_PATH}. "
                "Run 'python backend/scripts/train_model.py' first."
            )
            return False

        try:
            self._pipeline = joblib.load(MODEL_PIPELINE_PATH)
            logger.info(f"Loaded ML pipeline: {self._pipeline.model_name}")

            # Load features spec
            spec_path = FEATURES_SPEC if FEATURES_SPEC.exists() else FEATURES_JSON_PATH
            if spec_path.exists():
                with open(spec_path) as f:
                    self._features_spec = json.load(f)

            self._model_info = {
                "model_name": self._pipeline.model_name,
                "status": "loaded",
                "features_count": len(self._features_spec.get("numeric_features", [])) +
                                  len(self._features_spec.get("categorical_features", [])),
            }
            logger.info(f"Model info: {self._model_info}")
            return True

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    @property
    def model_info(self) -> dict:
        if not self.is_loaded:
            return {"status": "not_loaded", "message": "Model not trained yet"}
        return self._model_info

    @property
    def features_spec(self) -> dict:
        return self._features_spec

    def predict(self, input_data: dict) -> dict:
        """
        Run yield prediction on input agronomic data.

        Args:
            input_data: Dictionary with keys matching CSV columns
                (Crop, Season, State, Area, Annual_Rainfall, Fertilizer, Pesticide,
                 Temperature_C, Humidity_Percent, Soil_Type, Soil_pH,
                 Nitrogen_kg_ha, Phosphorus_kg_ha, Potassium_kg_ha,
                 Soil_Moisture_Percent, Irrigation_Type, Crop_Variety,
                 Sowing_Month, Harvest_Month, Growing_Days,
                 Soil_Fertility_Index, Pest_Risk_Index, Disease_Risk_Index,
                 Water_Availability_Index, Weather_Stress_Index, Crop_Health_Index)

        Returns:
            Dictionary with predicted_yield, crop, season, model_used
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Train the model first.")

        # Build a single-row DataFrame matching training schema
        # Add Crop_Year as current year and Production as 0 (will be dropped by pipeline)
        from datetime import datetime
        row = {**input_data}
        row.setdefault("Crop_Year", datetime.now().year)
        row.setdefault("Production", 0)  # Will be dropped by AgronomicFeatureEngineer

        df = pd.DataFrame([row])

        # Run prediction
        prediction = self._pipeline.predict(df)
        predicted_yield = float(prediction[0])

        return {
            "predicted_yield": round(predicted_yield, 4),
            "crop": input_data.get("Crop", "Unknown"),
            "season": input_data.get("Season", "Unknown"),
            "state": input_data.get("State", "Unknown"),
            "area": input_data.get("Area", 0),
            "model_used": self._pipeline.model_name,
            "unit": "tonnes/hectare",
        }

    def get_valid_values(self) -> dict:
        """Return valid categorical values from the features spec."""
        crop_categories = self._features_spec.get("crop_category_map", {})
        return {
            "crops": sorted(list(crop_categories.keys())),
            "seasons": ["Kharif", "Rabi", "Whole Year", "Summer", "Winter", "Autumn"],
            "states": [
                "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
                "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
                "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
                "Uttar Pradesh", "Uttarakhand", "West Bengal",
            ],
            "soil_types": ["Alluvial", "Black", "Red", "Laterite", "Sandy", "Loamy", "Clay", "Saline"],
            "irrigation_types": ["Canal", "Drip", "Rainfed", "Sprinkler", "Tubewell", "Well"],
            "sowing_months": [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            "harvest_months": [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            "crop_categories": crop_categories,
        }


# Global singleton
predictor = CropYieldPredictor()
