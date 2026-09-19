"""
AgriSetu — Crop Yield ML Pipeline Package.
Contains feature engineering, stratified data splitting, evaluation metrics, and training pipelines.
"""

from backend.ml.pipeline.train import SafeCropYieldPipeline, train_crop_yield_models
from backend.ml.pipeline.features import (
    AgronomicFeatureEngineer,
    build_preprocessor,
    safe_expm1,
    save_features_json,
    CATEGORICAL_COLS,
    NUMERIC_COLS,
    CROP_CATEGORY_MAP,
)
from backend.ml.pipeline.metrics import evaluate_regression, compute_metrics

__all__ = [
    "SafeCropYieldPipeline",
    "AgronomicFeatureEngineer",
    "build_preprocessor",
    "safe_expm1",
    "save_features_json",
    "CATEGORICAL_COLS",
    "NUMERIC_COLS",
    "CROP_CATEGORY_MAP",
    "evaluate_regression",
    "compute_metrics",
    "train_crop_yield_models",
]
