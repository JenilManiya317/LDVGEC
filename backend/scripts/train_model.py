"""
Model Training Script — Trains and saves the crop yield prediction pipeline.
Run this before starting the backend server.

Usage:
    python -m backend.scripts.train_model
"""

import os
import sys

# Ensure the project root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from src.train import main as train_main


if __name__ == "__main__":
    print("=" * 60)
    print("FarmWise — ML Model Training Pipeline")
    print("=" * 60)
    print(f"Project root: {BASE_DIR}")
    print()
    train_main()
    print()
    print("=" * 60)
    print("Training complete! You can now start the backend server:")
    print("  uvicorn backend.main:app --reload --port 8000")
    print("=" * 60)
