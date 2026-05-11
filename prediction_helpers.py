
from datetime import datetime, timedelta
from pipeline import Pipeline

import pandas as pd
from pandas import DataFrame
import numpy as np
import joblib

# ================================
# 10. PREDICTION HELPERS
# ================================

def get_description_by_main(raw_df : DataFrame, key, default = "Unknown"):
    return (raw_df.groupby("weather.main")["weather.description"]
    .agg(lambda s: s.mode().iloc[0] if not s.mode().empty else "Unknown")
    .to_dict()).get(key, default)

def build_supporting_data(row):
    return {
        "city_name": row.get("city_name", None),
        "main.temp": float(row.get("main.temp", np.nan)) if not pd.isna(row.get("main.temp", np.nan)) else None,
        "main.humidity": float(row.get("main.humidity", np.nan)) if not pd.isna(row.get("main.humidity", np.nan)) else None,
        "wind.speed": float(row.get("wind.speed", np.nan)) if not pd.isna(row.get("wind.speed", np.nan)) else None,
        "clouds.all": float(row.get("clouds.all", np.nan)) if not pd.isna(row.get("clouds.all", np.nan)) else None,
        "weather.description": row.get("weather.description", None),
    }

def encode_feature_row(row, pipeline : Pipeline):
    prepared = {}
    for col in pipeline.feature_columns:
        value = row.get(col) if hasattr(row, 'get') else row[col]
        if pd.isna(value):
            if col in pipeline.preprocessed_df.select_dtypes(include=["number"]).columns:
                value = pipeline.feature_means[col]
            else:
                mode_value = pipeline.feature_modes[col]
                value = mode_value.iloc[0] if not mode_value.empty else "Unknown"
        prepared[col] = value

    for col, le in pipeline.categorical_encoders.items():
        value = str(prepared[col])
        if value not in le.classes_:
            value = le.classes_[0]
        prepared[col] = int(le.transform([value])[0])

    values = np.array([prepared[col] for col in pipeline.feature_columns], dtype=float).reshape(1, -1)
    values_scaled = pipeline.scaler.transform(values)
    if pipeline.apply_pca and pipeline.pca is not None:
        values_scaled = pipeline.pca.transform(values_scaled)
    return values_scaled

def predict_current_weather(pipeline : Pipeline):
    latest = pipeline.raw_df.tail(1).iloc[0]
    X_pred = encode_feature_row(latest, pipeline)
    pred_idx = pipeline.model.predict(X_pred)[0]
    probabilities = pipeline.model.predict_proba(X_pred)[0]
    predicted_main = pipeline.target_le.inverse_transform([pred_idx])[0]
    return {
        "timestamp": str(latest.get("datetime", datetime.now().isoformat())),
        "predicted_main": predicted_main,
        "predicted_description": get_description_by_main(pipeline.raw_df, predicted_main),
        "confidence": round(float(np.max(probabilities)) * 100, 2),
        "supporting_data": build_supporting_data(latest),
    }

def predict_tomorrow_weather(pipeline : Pipeline):
    latest = pipeline.raw_df.tail(1).iloc[0]
    X_pred = encode_feature_row(latest, pipeline)
    pred_idx = pipeline.model.predict(X_pred)[0]
    probabilities = pipeline.model.predict_proba(X_pred)[0]
    predicted_main = pipeline.target_le.inverse_transform([pred_idx])[0]
    return {
        "timestamp": str(latest.get("datetime", (datetime.now() + timedelta(days=1)).isoformat())),
        "predicted_main": predicted_main,
        "predicted_description": get_description_by_main(pipeline.raw_df, predicted_main),
        "confidence": round(float(np.max(probabilities)) * 100, 2),
        "supporting_data": build_supporting_data(latest),
    }

def predict_weekly_weather(pipeline : Pipeline):
    weekly_forecast = []
    for day_offset in range(1, 8):
        window_size = min(7 + day_offset - 1, len(pipeline.raw_df))
        window_data = pipeline.raw_df.tail(window_size)
        avg_row = {}
        for col in pipeline.feature_columns:
            if col in window_data.select_dtypes(include=["number"]).columns:
                avg_row[col] = window_data[col].mean()
            else:
                mode_val = window_data[col].mode()
                avg_row[col] = mode_val.iloc[0] if not mode_val.empty else "Unknown"


        X_pred = encode_feature_row(avg_row, pipeline)
        pred_idx = pipeline.model.predict(X_pred)[0]
        probabilities = pipeline.model.predict_proba(X_pred)[0]
        predicted_main = pipeline.target_le.inverse_transform([pred_idx])[0]
        weather_desc = get_description_by_main(pipeline.raw_df, predicted_main)
        weekly_forecast.append({
            "date": (datetime.now() + timedelta(days=day_offset)).date().isoformat(),
            "day": (datetime.now() + timedelta(days=day_offset)).strftime("%A"),
            "predicted_main": predicted_main,
            "predicted_description": weather_desc,
            "confidence": round(float(np.max(probabilities)) * 100, 2),
            "supporting_data": build_supporting_data({**avg_row, "weather.description": weather_desc}),
        })

    return weekly_forecast