import joblib
from app.core.config import settings
from app.services.safety_engine import HIGHWAY_BASE_SCORE, _highway_type

HIGHWAY_TYPES = list(HIGHWAY_BASE_SCORE.keys())
_model = None

def get_model():
    global _model
    if _model is None:
        _model = joblib.load(settings.MODEL_PATH)
    return _model

def predict_score(edge_data: dict, hour: int) -> float:
    hw = _highway_type(edge_data)
    highway_rank = HIGHWAY_TYPES.index(hw) if hw in HIGHWAY_TYPES else len(HIGHWAY_TYPES)
    lit = 1 if edge_data.get("lit") == "yes" else 0
    lanes = edge_data.get("lanes", "1")
    try:
        lanes_val = int(lanes[0]) if isinstance(lanes, list) else int(lanes)
    except (ValueError, TypeError):
        lanes_val = 1
    length = edge_data.get("length", 100)

    model = get_model()
    features = [[highway_rank, lit, lanes_val, length, hour]]
    pred = model.predict(features)[0]
    return round(float(max(5, min(100, pred))), 1)
