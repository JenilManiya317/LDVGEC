"""
Model Training, Cross-Validation, and Selection Pipeline for Crop-Yield Prediction.

Requirements:
- Reproducible pipeline with fixed random seed (42).
- Only trains on data/train.csv (never touches data/test.csv for model selection or tuning).
- Strictly prevents data leakage (never uses 'Production', target is 'Yield').
- 5-Fold Stratified Cross-Validation by Crop.
- Realistic time-based test (older years vs newer years).
- Evaluates Random Forest, Extra Trees, HistGradientBoosting, XGBoost, and CatBoost.
- Target transformation: log1p on target, safe expm1 inverse clipping >= 0.
- Evaluates: R2, MAE, RMSE, MedAE, MAPE, MdAPE, acc@10%, acc@20%, acc@30%, acc@50%.
- Saves best pipeline, features list, and CV reports.
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.ensemble import (
    RandomForestRegressor,
    ExtraTreesRegressor,
    HistGradientBoostingRegressor,
)
from xgboost import XGBRegressor
from catboost import CatBoostRegressor

from src.features import (
    AgronomicFeatureEngineer,
    build_preprocessor,
    safe_expm1,
    save_features_json,
)
from src.metrics import compute_metrics

RANDOM_SEED = 42
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TRAIN_DATA_PATH = os.path.join(DATA_DIR, "train.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


def get_model_candidates(seed: int = RANDOM_SEED):
    """
    Returns the 5 tree-based model candidates with tuned baseline hyperparameters.
    """
    return {
        "RandomForest": RandomForestRegressor(
            n_estimators=120,
            max_depth=16,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=seed,
        ),
        "ExtraTrees": ExtraTreesRegressor(
            n_estimators=120,
            max_depth=16,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=seed,
        ),
        "HistGradientBoosting": HistGradientBoostingRegressor(
            max_iter=200,
            learning_rate=0.08,
            max_leaf_nodes=35,
            min_samples_leaf=15,
            random_state=seed,
        ),
        "XGBoost": XGBRegressor(
            n_estimators=220,
            learning_rate=0.06,
            max_depth=7,
            subsample=0.85,
            colsample_bytree=0.85,
            n_jobs=-1,
            random_state=seed,
        ),
        "CatBoost": CatBoostRegressor(
            iterations=250,
            learning_rate=0.07,
            depth=6,
            verbose=0,
            random_seed=seed,
        ),
    }


def run_cross_validation(train_df: pd.DataFrame, n_splits: int = 5):
    """
    Runs 5-fold cross-validation stratified by Crop on training data.
    Fits feature engineering and preprocessor inside each fold to prevent leakage.
    Target is transformed with log1p and inverted with safe_expm1.
    """
    print("\n" + "=" * 70)
    print(f"Starting {n_splits}-Fold Stratified Cross-Validation by Crop on Train Data...")
    print("=" * 70)

    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_SEED)
    models = get_model_candidates(RANDOM_SEED)

    cv_results = {name: [] for name in models.keys()}
    oof_predictions = {
        name: np.zeros(len(train_df), dtype=float) for name in models.keys()
    }

    y_train = train_df["Yield"].values
    crops = train_df["Crop"].values

    for fold, (train_idx, val_idx) in enumerate(skf.split(train_df, crops)):
        print(f"\n--- Fold {fold + 1} / {n_splits} ---")
        fold_train_df = train_df.iloc[train_idx].copy()
        fold_val_df = train_df.iloc[val_idx].copy()

        y_fold_train = fold_train_df["Yield"].values
        y_fold_val = fold_val_df["Yield"].values
        y_fold_train_log = np.log1p(y_fold_train)

        # Feature pipeline fitted strictly on fold training data
        fe = AgronomicFeatureEngineer()
        prep = build_preprocessor()

        X_fold_train_fe = fe.transform(fold_train_df)
        X_fold_train_prep = prep.fit_transform(X_fold_train_fe)

        X_fold_val_fe = fe.transform(fold_val_df)
        X_fold_val_prep = prep.transform(X_fold_val_fe)

        for name, model in models.items():
            t0 = time.time()
            model.fit(X_fold_train_prep, y_fold_train_log)
            fit_time = time.time() - t0

            val_preds_log = model.predict(X_fold_val_prep)
            val_preds = safe_expm1(val_preds_log)
            oof_predictions[name][val_idx] = val_preds

            fold_metrics = compute_metrics(y_fold_val, val_preds)
            fold_metrics["fold"] = fold + 1
            fold_metrics["fit_time_sec"] = fit_time
            cv_results[name].append(fold_metrics)

            print(
                f"  {name:20s} | RMSE: {fold_metrics['rmse']:7.2f} | MAE: {fold_metrics['mae']:6.2f} | "
                f"R2: {fold_metrics['r2_score']:6.4f} | Within 20%: {fold_metrics['pct_within_20']:5.1f}% | Time: {fit_time:4.1f}s"
            )

    # Summarize CV results
    cv_summary_records = []
    for name, folds_list in cv_results.items():
        avg_rmse = np.mean([f["rmse"] for f in folds_list])
        std_rmse = np.std([f["rmse"] for f in folds_list])
        avg_mae = np.mean([f["mae"] for f in folds_list])
        std_mae = np.std([f["mae"] for f in folds_list])
        avg_r2 = np.mean([f["r2_score"] for f in folds_list])
        std_r2 = np.std([f["r2_score"] for f in folds_list])
        avg_medae = np.mean([f["median_absolute_error"] for f in folds_list])
        avg_mape = np.mean([f["mape"] for f in folds_list])
        avg_mdape = np.mean([f["median_absolute_percentage_error"] for f in folds_list])
        avg_w10 = np.mean([f["pct_within_10"] for f in folds_list])
        avg_w20 = np.mean([f["pct_within_20"] for f in folds_list])
        avg_w30 = np.mean([f["pct_within_30"] for f in folds_list])
        avg_w50 = np.mean([f["pct_within_50"] for f in folds_list])

        # Overall OOF metrics
        oof_metrics = compute_metrics(y_train, oof_predictions[name])

        record = {
            "model": name,
            "cv_rmse_mean": avg_rmse,
            "cv_rmse_std": std_rmse,
            "cv_mae_mean": avg_mae,
            "cv_mae_std": std_mae,
            "cv_r2_mean": avg_r2,
            "cv_r2_std": std_r2,
            "cv_medae_mean": avg_medae,
            "cv_mape_mean": avg_mape,
            "cv_mdape_mean": avg_mdape,
            "cv_within_10pct_mean": avg_w10,
            "cv_within_20pct_mean": avg_w20,
            "cv_within_30pct_mean": avg_w30,
            "cv_within_50pct_mean": avg_w50,
            "oof_rmse": oof_metrics["rmse"],
            "oof_mae": oof_metrics["mae"],
            "oof_r2": oof_metrics["r2_score"],
            "oof_medae": oof_metrics["median_absolute_error"],
            "oof_mape": oof_metrics["mape"],
            "oof_mdape": oof_metrics["median_absolute_percentage_error"],
            "oof_within_20pct": oof_metrics["pct_within_20"],
        }
        cv_summary_records.append(record)

    cv_df = pd.DataFrame(cv_summary_records).sort_values(
        by="cv_rmse_mean", ascending=True
    )
    cv_summary_csv = os.path.join(REPORTS_DIR, "cv_model_comparison.csv")
    cv_df.to_csv(cv_summary_csv, index=False)
    print("\n" + "=" * 70)
    print("5-Fold Cross-Validation Summary Across Models:")
    print("=" * 70)
    print(
        cv_df[
            [
                "model",
                "cv_rmse_mean",
                "cv_mae_mean",
                "cv_r2_mean",
                "cv_medae_mean",
                "cv_mdape_mean",
                "cv_within_20pct_mean",
            ]
        ].to_string(index=False)
    )

    best_model_name = cv_df.iloc[0]["model"]
    print(f"\nBest Model Selected via Cross-Validation: {best_model_name}")

    return cv_df, best_model_name, oof_predictions


def run_time_based_backtest(train_df: pd.DataFrame, split_year: int = 2015):
    """
    Performs a realistic time-based split on the training data:
    Train on older years (Crop_Year <= split_year) and test on newer years (Crop_Year > split_year).
    Simulates production deployment forecasting future agricultural seasons.
    """
    print("\n" + "=" * 70)
    print(
        f"Realistic Time-Based Backtest (Train: <= {split_year}, Test: > {split_year})..."
    )
    print("=" * 70)

    older_train = train_df[train_df["Crop_Year"] <= split_year].copy()
    newer_test = train_df[train_df["Crop_Year"] > split_year].copy()

    print(
        f"Older years train count: {len(older_train)} ({older_train['Crop_Year'].min()}-{older_train['Crop_Year'].max()})"
    )
    print(
        f"Newer years test count:  {len(newer_test)} ({newer_test['Crop_Year'].min()}-{newer_test['Crop_Year'].max()})"
    )

    fe = AgronomicFeatureEngineer()
    prep = build_preprocessor()

    X_train_prep = prep.fit_transform(fe.transform(older_train))
    X_test_prep = prep.transform(fe.transform(newer_test))

    y_train = older_train["Yield"].values
    y_test = newer_test["Yield"].values
    y_train_log = np.log1p(y_train)

    models = get_model_candidates(RANDOM_SEED)
    time_records = []

    for name, model in models.items():
        model.fit(X_train_prep, y_train_log)
        test_preds_log = model.predict(X_test_prep)
        test_preds = safe_expm1(test_preds_log)

        m = compute_metrics(y_test, test_preds)
        m["model"] = name
        m["train_years"] = f"<={split_year}"
        m["test_years"] = f">{split_year}"
        m["train_samples"] = len(older_train)
        m["test_samples"] = len(newer_test)
        time_records.append(m)

        print(
            f"  {name:20s} | Test RMSE: {m['rmse']:7.2f} | MAE: {m['mae']:6.2f} | R2: {m['r2_score']:6.4f} | Within 20%: {m['pct_within_20']:5.1f}%"
        )

    time_df = pd.DataFrame(time_records).sort_values(by="rmse", ascending=True)
    time_summary_csv = os.path.join(REPORTS_DIR, "time_based_split_evaluation.csv")
    time_df.to_csv(time_summary_csv, index=False)
    return time_df


class SafeCropYieldPipeline:
    """
    Self-contained deployment pipeline for Crop-Yield prediction.
    Encapsulates:
    - Feature Engineering
    - Preprocessing (ColumnTransformer)
    - Underlying Regressor
    - Safe log1p target inversion with zero-clipping
    """

    def __init__(self, model_name: str, regressor):
        self.model_name = model_name
        self.fe = AgronomicFeatureEngineer()
        self.prep = build_preprocessor()
        self.regressor = regressor

    def fit(self, X_df: pd.DataFrame, y: np.ndarray):
        X_fe = self.fe.transform(X_df)
        X_trans = self.prep.fit_transform(X_fe)
        y_log = np.log1p(y)
        self.regressor.fit(X_trans, y_log)
        return self

    def predict(self, X_df: pd.DataFrame) -> np.ndarray:
        X_fe = self.fe.transform(X_df)
        X_trans = self.prep.transform(X_fe)
        preds_log = self.regressor.predict(X_trans)
        return safe_expm1(preds_log)


def fit_and_save_final_pipeline(train_df: pd.DataFrame, best_model_name: str):
    """
    Fits the best model architecture on all 15,751 rows of data/train.csv
    and saves the production-ready pipeline and feature metadata.
    """
    print("\n" + "=" * 70)
    print(
        f"Training Final Pipeline with '{best_model_name}' on Full Training Dataset (15,751 rows)..."
    )
    print("=" * 70)

    models = get_model_candidates(RANDOM_SEED)
    best_regressor = models[best_model_name]

    pipeline = SafeCropYieldPipeline(best_model_name, best_regressor)
    y_train = train_df["Yield"].values
    pipeline.fit(train_df, y_train)

    pipeline_path = os.path.join(MODELS_DIR, "best_crop_yield_pipeline.joblib")
    joblib.dump(pipeline, pipeline_path)
    print(f"Final model pipeline successfully saved to: {pipeline_path}")

    features_path = os.path.join(MODELS_DIR, "features.json")
    save_features_json(features_path)
    print(f"Features specification saved to: {features_path}")

    return pipeline


def main():
    print(f"Loading training data from {TRAIN_DATA_PATH}...")
    train_df = pd.read_csv(TRAIN_DATA_PATH)
    print(f"Loaded {len(train_df)} training samples across {train_df['Crop'].nunique()} crops.")

    # 1. Run 5-Fold CV on training data
    cv_df, best_model_name, oof_predictions = run_cross_validation(train_df, n_splits=5)

    # 2. Run Time-Based Backtest (older years vs newer years)
    time_df = run_time_based_backtest(train_df, split_year=2015)

    # 3. Fit Final Pipeline on Full Training Set
    pipeline = fit_and_save_final_pipeline(train_df, best_model_name)

    # Save summary report
    summary = {
        "best_model_selected": best_model_name,
        "cv_performance": cv_df.to_dict(orient="records"),
        "time_split_performance": time_df.to_dict(orient="records"),
    }
    with open(os.path.join(REPORTS_DIR, "training_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\nTraining and Model Selection Stage Complete.")


if __name__ == "__main__":
    main()
