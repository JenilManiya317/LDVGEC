"""
Feature Engineering and Preprocessing Pipeline for Crop-Yield Prediction.
Strictly excludes any data leakage (Production is completely omitted).
Ensures safe target transformation and feature representations.
"""

import json
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CROP_CATEGORY_MAP = {
    # Cereals & Millets
    "Rice": "Cereals & Millets",
    "Wheat": "Cereals & Millets",
    "Maize": "Cereals & Millets",
    "Bajra": "Cereals & Millets",
    "Jowar": "Cereals & Millets",
    "Barley": "Cereals & Millets",
    "Ragi": "Cereals & Millets",
    "Small millets": "Cereals & Millets",
    "Other Cereals": "Cereals & Millets",
    # Pulses
    "Arhar/Tur": "Pulses",
    "Gram": "Pulses",
    "Moong(Green Gram)": "Pulses",
    "Urad": "Pulses",
    "Horse-gram": "Pulses",
    "Moth": "Pulses",
    "Masoor": "Pulses",
    "Khesari": "Pulses",
    "Cowpea(Lobia)": "Pulses",
    "Peas & beans (Pulses)": "Pulses",
    "Other  Rabi pulses": "Pulses",
    "Other Kharif pulses": "Pulses",
    "Other Summer Pulses": "Pulses",
    # Oilseeds
    "Groundnut": "Oilseeds",
    "Sesamum": "Oilseeds",
    "Rapeseed &Mustard": "Oilseeds",
    "Soyabean": "Oilseeds",
    "Sunflower": "Oilseeds",
    "Safflower": "Oilseeds",
    "Castor seed": "Oilseeds",
    "Linseed": "Oilseeds",
    "Niger seed": "Oilseeds",
    "Oilseeds total": "Oilseeds",
    "other oilseeds": "Oilseeds",
    # Commercial & Plantation
    "Sugarcane": "Commercial & Plantation",
    "Cotton(lint)": "Commercial & Plantation",
    "Jute": "Commercial & Plantation",
    "Mesta": "Commercial & Plantation",
    "Sannhamp": "Commercial & Plantation",
    "Tobacco": "Commercial & Plantation",
    "Arecanut": "Commercial & Plantation",
    "Cashewnut": "Commercial & Plantation",
    "Coconut": "Commercial & Plantation",
    # Spices & Condiments
    "Dry chillies": "Spices & Condiments",
    "Black pepper": "Spices & Condiments",
    "Cardamom": "Spices & Condiments",
    "Coriander": "Spices & Condiments",
    "Garlic": "Spices & Condiments",
    "Ginger": "Spices & Condiments",
    "Turmeric": "Spices & Condiments",
    # Fruits, Vegetables & Tubers
    "Potato": "Fruits, Veg & Tubers",
    "Onion": "Fruits, Veg & Tubers",
    "Banana": "Fruits, Veg & Tubers",
    "Sweet potato": "Fruits, Veg & Tubers",
    "Tapioca": "Fruits, Veg & Tubers",
}

# Explicitly defining base categorical and numeric feature columns
# 'Production' is STRICTLY EXCLUDED to prevent data leakage
CATEGORICAL_COLS = [
    "Crop",
    "Season",
    "State",
    "Soil_Type",
    "Irrigation_Type",
    "Crop_Variety",
    "Sowing_Month",
    "Harvest_Month",
    "Crop_Category",
]

NUMERIC_COLS = [
    "Crop_Year",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide",
    "Fertilizer_per_ha",
    "Pesticide_per_ha",
    "Temperature_C",
    "Humidity_Percent",
    "Soil_pH",
    "Nitrogen_kg_ha",
    "Phosphorus_kg_ha",
    "Potassium_kg_ha",
    "NPK_Total",
    "N_to_P_Ratio",
    "N_to_K_Ratio",
    "P_to_K_Ratio",
    "Soil_Moisture_Percent",
    "Growing_Days",
    "Soil_Fertility_Index",
    "Pest_Risk_Index",
    "Disease_Risk_Index",
    "Water_Availability_Index",
    "Weather_Stress_Index",
    "Crop_Health_Index",
    "Temp_Humidity_Interaction",
]


class AgronomicFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Transforms raw agricultural data by adding domain-specific agronomic features:
    - Fertilizer and Pesticide application rates per hectare
    - N-P-K nutrient balances and totals
    - Temperature-Humidity bioclimatic interaction
    - Crop category grouping
    """

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        # Ensure 'Production' is not present
        if "Production" in X.columns:
            X = X.drop(columns=["Production"])
        if "Yield" in X.columns:
            X = X.drop(columns=["Yield"])

        # Per hectare intensity
        area_safe = np.maximum(X["Area"].values, 1.0)
        X["Fertilizer_per_ha"] = X["Fertilizer"] / area_safe
        X["Pesticide_per_ha"] = X["Pesticide"] / area_safe

        # NPK nutrient balances
        p_safe = np.maximum(X["Phosphorus_kg_ha"].values, 1e-4)
        k_safe = np.maximum(X["Potassium_kg_ha"].values, 1e-4)
        X["NPK_Total"] = (
            X["Nitrogen_kg_ha"] + X["Phosphorus_kg_ha"] + X["Potassium_kg_ha"]
        )
        X["N_to_P_Ratio"] = X["Nitrogen_kg_ha"] / p_safe
        X["N_to_K_Ratio"] = X["Nitrogen_kg_ha"] / k_safe
        X["P_to_K_Ratio"] = X["Phosphorus_kg_ha"] / k_safe

        # Climatic interaction
        X["Temp_Humidity_Interaction"] = (
            X["Temperature_C"] * X["Humidity_Percent"] / 100.0
        )

        # Crop Category mapping
        X["Crop_Category"] = X["Crop"].map(CROP_CATEGORY_MAP).fillna("Other")

        return X


def build_preprocessor() -> ColumnTransformer:
    """
    Builds the ColumnTransformer for categorical one-hot encoding
    and numerical feature scaling.
    """
    return ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_COLS,
            ),
            (
                "num",
                StandardScaler(),
                NUMERIC_COLS,
            ),
        ],
        remainder="drop",
    )


def safe_expm1(y: np.ndarray) -> np.ndarray:
    """
    Reverses log1p transformation and clips at 0 to strictly prevent impossible negative yields.
    """
    return np.clip(np.expm1(y), a_min=0.0, a_max=None)


def save_features_json(filepath: str):
    """
    Saves the list of input and engineered features to a JSON file.
    """
    feature_meta = {
        "target": "Yield",
        "forbidden_leakage_features": ["Production", "Yield"],
        "categorical_features": CATEGORICAL_COLS,
        "numeric_features": NUMERIC_COLS,
        "crop_category_map": CROP_CATEGORY_MAP,
        "notes": (
            "Production is strictly excluded as it is post-harvest and causes complete data leakage. "
            "Target Yield is transformed via log1p and inverted via expm1 with zero-clipping."
        ),
    }
    with open(filepath, "w") as f:
        json.dump(feature_meta, f, indent=2)
