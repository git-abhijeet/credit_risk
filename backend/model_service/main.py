from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
import uvicorn
import pandas as pd
import numpy as np
import json
from joblib import load
import os
from fastapi.middleware.cors import CORSMiddleware

# Paths to model artifacts (relative to repo root by default)
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_MODEL_PATH = os.path.join(REPO_ROOT, "models", "xgb_classifier.joblib")
DEFAULT_ENCODER_PATH = os.path.join(REPO_ROOT, "models", "label_encoder.joblib")
DEFAULT_FEATURES_PATH = os.path.join(REPO_ROOT, "models", "feature_columns.json")

MODEL_PATH = os.getenv("MODEL_PATH", DEFAULT_MODEL_PATH)
ENCODER_PATH = os.getenv("ENCODER_PATH", DEFAULT_ENCODER_PATH)
FEATURES_PATH = os.getenv("FEATURES_PATH", DEFAULT_FEATURES_PATH)

try:
    xgb_model = load(MODEL_PATH)
    label_encoder = load(ENCODER_PATH)
    with open(FEATURES_PATH, "r") as f:
        FEATURE_COLUMNS: List[str] = json.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load artifacts: {e}")

# Domain-specific simple mappings (adapt these to your data)
EDU_MAP = {
    "SSC": 1,
    "12TH": 2,
    "GRADUATE": 3,
    "UNDER GRADUATE": 3,
    "POST-GRADUATE": 4,
    "OTHERS": 1,
    "PROFESSIONAL": 3,
}
CAT_COLS = ["MARITALSTATUS", "GENDER", "last_prod_enq2", "first_prod_enq2"]


def preprocess(raw_df: pd.DataFrame) -> pd.DataFrame:
    """Align raw input (from UI or other callers) to training feature columns.

    What this does:
    - Map UI field names to model feature names (e.g., monthlyIncome -> NETMONTHLYINCOME)
    - Normalize categorical values (e.g., gender "Male/Female" -> "M"/"F")
    - Provide safe defaults for required categoricals if missing (EDUCATION, MARITALSTATUS,
      last_prod_enq2, first_prod_enq2)
    - Map EDUCATION strings to ordinal values used in training
    - One-hot encode categorical columns expected by the model
    - Reindex to FEATURE_COLUMNS, filling missing with 0
    """

    df = raw_df.copy()

    # 1) Field name mapping from UI payload to model schema
    # Income: monthlyIncome (UI) -> NETMONTHLYINCOME (model)
    if "NETMONTHLYINCOME" not in df.columns and "monthlyIncome" in df.columns:
        df["NETMONTHLYINCOME"] = pd.to_numeric(df["monthlyIncome"], errors="coerce").fillna(0)

    # Gender: UI uses "Male"/"Female" (or variants); map to "M"/"F" expected by one-hot.
    gender_val = None
    if "gender" in df.columns and pd.notna(df.loc[df.index[0], "gender"]):
        g = str(df.loc[df.index[0], "gender"]).strip().lower()
        if g in {"male", "m"}: gender_val = "M"
        elif g in {"female", "f"}: gender_val = "F"
        else: gender_val = None  # Other/unknown
    # If caller provided GENDER already, prefer it; otherwise set mapped value
    if "GENDER" not in df.columns and gender_val is not None:
        df["GENDER"] = gender_val

    # 2) Safe defaults for categoricals expected by training
    if "EDUCATION" not in df.columns or df["EDUCATION"].isna().all():
        df["EDUCATION"] = "GRADUATE"

    if "MARITALSTATUS" not in df.columns or df["MARITALSTATUS"].isna().all():
        df["MARITALSTATUS"] = "Single"
    else:
        # Normalize to match training capitalization (e.g., "Married", "Single")
        df["MARITALSTATUS"] = df["MARITALSTATUS"].astype(str).str.strip().str.capitalize()

    for col, default in ("last_prod_enq2", "PL"), ("first_prod_enq2", "PL"):
        if col not in df.columns or df[col].isna().all():
            df[col] = default

    # 3) EDUCATION string -> ordinal as per training map
    if "EDUCATION" in df.columns:
        df["EDUCATION"] = df["EDUCATION"].map(EDU_MAP).astype("Int64")

    # 4) One-hot encode known categorical columns (present ones only)
    present_cats = [c for c in CAT_COLS if c in df.columns]
    if present_cats:
        df = pd.get_dummies(df, columns=present_cats)

    # 5) Align to training feature columns (missing -> 0, extra -> dropped)
    df = df.reindex(columns=FEATURE_COLUMNS, fill_value=0)
    return df


def to_band(pred_label: str) -> str:
    """Map predicted class label to a human-readable band."""
    order = ["P1", "P2", "P3", "P4"]
    idx = order.index(pred_label) if pred_label in order else 2
    return ["low", "medium", "high", "very-high"][idx]


def top_feature_explanations(top_k: int = 5) -> List[str]:
    """Lightweight explanation using global feature_importances_ as a proxy.

    This is not SHAP but gives a quick sense of which features matter globally.
    """
    try:
        importances = getattr(xgb_model, "feature_importances_", None)
        if importances is None:
            return []
        pairs = list(zip(FEATURE_COLUMNS, importances))
        pairs.sort(key=lambda p: p[1], reverse=True)
        top = [f"{name} (importance {weight:.3f})" for name, weight in pairs[:top_k] if weight > 0]
        return top
    except Exception:
        return []


class PredictRequest(BaseModel):
    payload: Dict[str, Any]


class PredictResponse(BaseModel):
    predicted_class: str
    probabilities: Dict[str, float]
    band: str
    explanation: List[str]
    features_used: List[str]


app = FastAPI(title="Credit Risk Model Service")

# Allow browser calls if you ever call backend directly from the client.
# In Static Web Apps you’ll typically hit it server-side via the Next.js API,
# but this keeps options open.
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        raw = req.payload
        # Accept either flat dict or already model-ready dict
        df_raw = pd.DataFrame([raw])
        X = preprocess(df_raw)
        proba = xgb_model.predict_proba(X)[0]
        pred_idx = int(np.argmax(proba))
        pred_label = label_encoder.inverse_transform([pred_idx])[0]
        probs = {label_encoder.inverse_transform([i])[0]: float(proba[i]) for i in range(len(proba))}
        band = to_band(pred_label)
        explanation = top_feature_explanations()
        return PredictResponse(
            predicted_class=pred_label,
            probabilities=probs,
            band=band,
            explanation=explanation,
            features_used=FEATURE_COLUMNS,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
