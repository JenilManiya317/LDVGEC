"""
Data Splitting & Leakage Prevention Module for Crop-Yield Prediction.

Splits crop_yield_enriched.csv into training (80%) and testing (20%) datasets
stratified by Crop using a fixed random seed (42).
Identifies and documents columns that cause data leakage.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedShuffleSplit

RANDOM_SEED = 42
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
RAW_DATA_PATH = os.path.join(DATA_DIR, "crop_yield_enriched.csv")
TRAIN_DATA_PATH = os.path.join(DATA_DIR, "train.csv")
TEST_DATA_PATH = os.path.join(DATA_DIR, "test.csv")
LEAKAGE_REPORT_PATH = os.path.join(DATA_DIR, "leakage_analysis.json")


def inspect_data_leakage(df: pd.DataFrame) -> dict:
    """
    Examines all columns in the dataset and determines leakage status.
    Production is post-harvest total yield x area.
    Yield is the target variable.
    """
    leakage_findings = {
        "target_column": "Yield",
        "leakage_columns_identified": [],
        "safe_feature_columns": [],
        "column_details": {}
    }

    # Analyze correlation with Yield and Production / Area
    calc_yield = df["Production"] / df["Area"].replace(0, np.nan)
    corr_with_prod = float(df["Yield"].corr(df["Production"]))
    corr_with_calc = float(df["Yield"].corr(calc_yield))

    for col in df.columns:
        if col == "Yield":
            leakage_findings["column_details"][col] = {
                "role": "TARGET",
                "leakage_risk": "HIGH_IF_USED_AS_FEATURE",
                "reason": "Target variable to be predicted. Must never be an input feature."
            }
        elif col == "Production":
            leakage_findings["leakage_columns_identified"].append(col)
            leakage_findings["column_details"][col] = {
                "role": "LEAKAGE_FORBIDDEN",
                "leakage_risk": "CRITICAL",
                "correlation_with_yield": round(corr_with_prod, 4),
                "correlation_with_calc_yield": round(corr_with_calc, 4),
                "reason": (
                    "Production represents the total realized harvest volume after harvest. "
                    "Since Yield = Production / Area, providing Production allows the model "
                    "to trivially back-calculate the yield with ~0.9965 correlation. "
                    "Must be strictly excluded."
                )
            }
        else:
            leakage_findings["safe_feature_columns"].append(col)
            leakage_findings["column_details"][col] = {
                "role": "INPUT_FEATURE",
                "leakage_risk": "NONE",
                "reason": "Pre-harvest agronomic, soil, meteorological, or management attribute."
            }

    return leakage_findings


def split_dataset(raw_path: str = RAW_DATA_PATH, random_state: int = RANDOM_SEED):
    """
    Reads raw dataset, isolates train (80%) and test (20%) via StratifiedShuffleSplit on Crop,
    and writes train.csv and test.csv.
    """
    print(f"Loading raw dataset from {raw_path}...")
    df = pd.read_csv(raw_path)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns.")

    # Data leakage inspection
    leakage_info = inspect_data_leakage(df)
    with open(LEAKAGE_REPORT_PATH, "w") as f:
        json.dump(leakage_info, f, indent=2)
    print(f"Data leakage analysis saved to {LEAKAGE_REPORT_PATH}")
    print(f"Identified leakage columns: {leakage_info['leakage_columns_identified']}")

    # Stratified 80:20 split by Crop
    sss = StratifiedShuffleSplit(n_splits=1, test_size=0.20, random_state=random_state)
    train_idx, test_idx = next(sss.split(df, df["Crop"]))

    train_df = df.iloc[train_idx].copy()
    test_df = df.iloc[test_idx].copy()

    # Save splits
    train_df.to_csv(TRAIN_DATA_PATH, index=False)
    test_df.to_csv(TEST_DATA_PATH, index=False)

    print(f"Split complete:")
    print(f"  Training set: {len(train_df)} rows ({len(train_df)/len(df):.1%}) saved to {TRAIN_DATA_PATH}")
    print(f"  Testing set:  {len(test_df)} rows ({len(test_df)/len(df):.1%}) saved to {TEST_DATA_PATH}")

    # Verify crop stratification
    train_crops = set(train_df["Crop"].unique())
    test_crops = set(test_df["Crop"].unique())
    assert train_crops == test_crops, "Mismatch in crops between train and test sets!"
    print(f"Stratification verified: All {len(train_crops)} crops present in both train and test.")


if __name__ == "__main__":
    split_dataset()
