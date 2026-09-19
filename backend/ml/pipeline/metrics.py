"""
Evaluation Metrics Module for Crop-Yield Prediction.
Computes:
- R2 (strictly termed Coefficient of Determination, never called 'accuracy')
- MAE (Mean Absolute Error)
- RMSE (Root Mean Squared Error)
- MedAE (Median Absolute Error)
- MAPE (Mean Absolute Percentage Error)
- MdAPE (Median Absolute Percentage Error) & MdPE (Median Percentage Error)
- Accuracy within thresholds: % predictions within 10%, 20%, 30%, 50% of actual yield
Also provides slicing functions for breakdowns across Crop, Category, State, Season, Year.
"""

import numpy as np
import pandas as pd
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error, median_absolute_error


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    """
    Computes all standard regression and percentage-based accuracy metrics.
    Guarantees robust division-by-zero handling.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    # Basic regression metrics
    r2 = float(r2_score(y_true, y_pred))
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(root_mean_squared_error(y_true, y_pred))
    medae = float(median_absolute_error(y_true, y_pred))

    # Percentage errors (handle y_true == 0 safely)
    nonzero_mask = y_true > 0
    if np.sum(nonzero_mask) > 0:
        actuals_nz = y_true[nonzero_mask]
        preds_nz = y_pred[nonzero_mask]
        abs_pct_errors = np.abs(actuals_nz - preds_nz) / actuals_nz * 100.0
        signed_pct_errors = (preds_nz - actuals_nz) / actuals_nz * 100.0

        mape = float(np.mean(abs_pct_errors))
        mdape = float(np.median(abs_pct_errors))
        mdpe = float(np.median(signed_pct_errors))
    else:
        mape = np.nan
        mdape = np.nan
        mdpe = np.nan

    # Percentage of predictions within 10%, 20%, 30%, 50%
    # For zeros, check if absolute error is within 0.1 (nominal yield)
    denom = np.where(y_true > 0, y_true, 1.0)
    rel_error = np.abs(y_true - y_pred) / denom

    pct_within_10 = float(np.mean(rel_error <= 0.10) * 100.0)
    pct_within_20 = float(np.mean(rel_error <= 0.20) * 100.0)
    pct_within_30 = float(np.mean(rel_error <= 0.30) * 100.0)
    pct_within_50 = float(np.mean(rel_error <= 0.50) * 100.0)

    return {
        "r2_score": r2,
        "mae": mae,
        "rmse": rmse,
        "median_absolute_error": medae,
        "mape": mape,
        "median_absolute_percentage_error": mdape,
        "median_percentage_error": mdpe,
        "pct_within_10": pct_within_10,
        "pct_within_20": pct_within_20,
        "pct_within_30": pct_within_30,
        "pct_within_50": pct_within_50,
        "sample_count": len(y_true)
    }


evaluate_regression = compute_metrics


def compute_sliced_metrics(df: pd.DataFrame, slice_col: str, y_true_col: str = "Actual_Yield", y_pred_col: str = "Predicted_Yield") -> pd.DataFrame:
    """
    Computes metrics disaggregated by a slice column (e.g. Crop, State, Season, etc.).
    """
    records = []
    for group_val, group_df in df.groupby(slice_col):
        if len(group_df) == 0:
            continue
        m = compute_metrics(group_df[y_true_col].values, group_df[y_pred_col].values)
        m[slice_col] = group_val
        records.append(m)

    res_df = pd.DataFrame(records)
    # Order columns
    cols = [slice_col, "sample_count", "r2_score", "mae", "rmse", "median_absolute_error",
            "mape", "median_absolute_percentage_error", "pct_within_10", "pct_within_20", "pct_within_30", "pct_within_50"]
    return res_df[cols].sort_values(by="sample_count", ascending=False)
