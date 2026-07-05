"""
Trains a lightweight XGBoost model that learns to predict safety scores
from road features, using synthetic labeled data derived from our own
heuristic engine (safety_engine.py) plus noise. This gives us a real
trainable/explainable AI component on top of the rule-based baseline.
Run this once: python -m app.ai.train_model
"""
import numpy as np
import pandas as pd
import joblib
from xgboost import XGBRegressor
from app.core.config import settings
from app.services.safety_engine import HIGHWAY_BASE_SCORE, _time_multiplier

HIGHWAY_TYPES = list(HIGHWAY_BASE_SCORE.keys())

def generate_synthetic_dataset(n=5000, seed=42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    rows = []
    for _ in range(n):
        hw = rng.choice(HIGHWAY_TYPES)
        lit = rng.choice([1, 0], p=[0.5, 0.5])
        lanes = rng.integers(1, 5)
        length = rng.uniform(20, 1000)
        hour = rng.integers(0, 24)

        base = HIGHWAY_BASE_SCORE[hw]
        base += 8 if lit else -12
        base += 5 if lanes >= 3 else 0
        base -= 6 if length > 500 else 0
        score = max(5, min(100, base * _time_multiplier(int(hour))))
        noise = rng.normal(0, 3)

        rows.append({
            "highway_rank": HIGHWAY_TYPES.index(hw),
            "lit": lit,
            "lanes": lanes,
            "length": length,
            "hour": hour,
            "score": max(5, min(100, score + noise)),
        })
    return pd.DataFrame(rows)

def train_and_save():
    df = generate_synthetic_dataset()
    X = df[["highway_rank", "lit", "lanes", "length", "hour"]]
    y = df["score"]
    model = XGBRegressor(n_estimators=150, max_depth=4, learning_rate=0.08)
    model.fit(X, y)
    joblib.dump(model, settings.MODEL_PATH)
    print(f"Model trained and saved to {settings.MODEL_PATH}")

if __name__ == "__main__":
    train_and_save()
