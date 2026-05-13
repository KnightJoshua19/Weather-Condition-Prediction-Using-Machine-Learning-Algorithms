from flask import Flask, render_template, send_from_directory, url_for, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from pathlib import Path
import json
import subprocess
import sys
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pipeline import Pipeline
import prediction_helpers
from joblib import load

app = Flask(__name__)
app.secret_key = "change-me"
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

METRICS_PATH = ROOT / "algorithm_metrics.json"
METRICS_DIR = ROOT / "metrics"
FORECAST_PATH = ROOT / "weather_predictions.json"
IMAGES = [
    "distribution.png",
    "correlation_heatmap.png",
    "feature_importance.png",
    "metrics_over_time.png",
    "logistic_regression_confusion_matrix.png",
    "decision_tree_confusion_matrix.png",
    "random_forest_confusion_matrix.png",
]
PLACE_FORECAST_PATH = ROOT / "place_forecast.json"
MODELS_DIR = ROOT / "models"
PIPELINE_PATH = MODELS_DIR / "weather_pipeline.joblib"

loaded_pipeline : dict = load(PIPELINE_PATH)

def load_metrics():
    if not METRICS_PATH.exists():
        return {"algorithms": []}
    try:
        with open(METRICS_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {"algorithms": []}


def load_place_forecast():
    if not PLACE_FORECAST_PATH.exists():
        return {"places": []}
    try:
        with open(PLACE_FORECAST_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {"places": []}


def choose_background_asset(predicted_main):
    predicted_text = (predicted_main or "").lower()
    images_dir = "images"

    if "rain" in predicted_text or "shower" in predicted_text or "storm" in predicted_text:
        return "⛈️", url_for('static', filename=f'{images_dir}/pexels-k-kannan-1495576-12179233.jpg')
    if "cloud" in predicted_text or "overcast" in predicted_text:
        return "☁️", url_for('static', filename=f'{images_dir}/pexels-magda-ehlers-pexels-7420051.jpg')
    if "clear" in predicted_text or "sun" in predicted_text:
        return "☀️", url_for('static', filename=f'{images_dir}/sam-schooler-E9aetBe2w40-unsplash.jpg')
    return "☁️", url_for('static', filename=f'{images_dir}/shttefan-viNPa2F7fnw-unsplash.jpg')


def load_forecast_data():
    if not FORECAST_PATH.exists():
        return {}
    try:
        with open(FORECAST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def write_forecast_data(payload):
    try:
        with open(FORECAST_PATH, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
    except Exception:
        pass


def run_ml_pipeline():
    script = ROOT / "Weather Condition Prediction Using Machine Learning.py"
    if not script.exists():
        return {"status": "error", "message": "ML script not found"}
    try:
        proc = subprocess.run([sys.executable, str(script)], capture_output=True, text=True, timeout=600)
        if proc.returncode != 0:
            return {"status": "error", "message": proc.stderr or "Script failed"}
        forecast = load_forecast_data()
        return {"status": "success", "message": "Model refreshed", "forecast": forecast}
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": "Model refresh timed out"}
    except Exception as e:
        return {"status": "error", "message": f"Error running model: {e}"}

def create_new_predictions():
    newPredictions = {}
    newPredictions["current_weather"] = prediction_helpers.predict_current_weather(loaded_pipeline)
    newPredictions["tomorrow_weather"] = prediction_helpers.predict_tomorrow_weather(loaded_pipeline)
    newPredictions["weekly_forecast"] = prediction_helpers.predict_weekly_weather(loaded_pipeline)
    return newPredictions

def get_forecast_or_fallback():
    forecast = load_forecast_data()
    if forecast and forecast.get("current_weather") and forecast.get("weekly_forecast"):
        return forecast
    return {}


def build_weekly_forecast(rain_prob, weather):
    base_temp = int(weather.get("temp") or 30)
    humidity = int(weather.get("humidity") or 70)
    forecasts = []
    for i in range(7):
        dt = datetime.now() + timedelta(days=i)
        day = dt.strftime("%A") if i > 0 else "Today"
        offset = ((i % 3) - 1) * 1.5
        temp = max(20, base_temp + int(offset))
        high = temp + 2
        low = temp - 3
        prob = rain_prob if rain_prob is not None else 0.45
        prob = min(max(prob + (i - 3) * 0.04, 0), 1)
        if prob >= 0.75:
            condition = "Heavy Rain"
            icon = "⛈️"
        elif prob >= 0.45:
            condition = "Showers"
            icon = "🌧️"
        elif prob >= 0.25:
            condition = "Partly Cloudy"
            icon = "🌤️"
        else:
            condition = "Sunny"
            icon = "☀️"
        forecasts.append({"day": day, "icon": icon, "condition": condition, "predicted_main": condition, "predicted_description": condition, "confidence": int(prob * 100), "high": high, "low": low})
    return forecasts


def build_today_tomorrow(weather, rain_prob):
    today_temp = int(weather.get("temp") or 30)
    today_humidity = int(weather.get("humidity") or 70)
    tomorrow_temp = max(20, today_temp + (1 if rain_prob is None or rain_prob < 0.5 else -1))
    tomorrow_humidity = min(100, today_humidity + (8 if rain_prob is None or rain_prob >= 0.5 else -4))
    return {"temp": today_temp, "humidity": today_humidity}, {"temp": tomorrow_temp, "humidity": tomorrow_humidity}


def get_latest_weather_summary():
    data_dir = ROOT / "Weather Datasets"
    if not data_dir.exists():
        return {}
    # try to find primary training CSV
    candidates = list(data_dir.glob("*.csv"))
    if not candidates:
        return {}
    df = None
    try:
        import pandas as _pd
        df = _pd.read_csv(candidates[0])
    except Exception:
        return {}
    if df is None or df.empty:
        return {}
    last = df.iloc[-1]
    # humidity: prefer Humidity3pm then Humidity9am
    humidity = None
    for col in ["Humidity3pm", "Humidity9am", "Humidity"]:
        if col in df.columns:
            try:
                humidity = last.get(col)
                if _pd.notna(humidity):
                    break
            except Exception:
                continue
    # wind speed: prefer WindGustSpeed, WindSpeed3pm, WindSpeed9am
    wind = None
    for col in ["WindGustSpeed", "WindSpeed3pm", "WindSpeed9am"]:
        if col in df.columns:
            try:
                wind = last.get(col)
                if _pd.notna(wind):
                    break
            except Exception:
                continue
    # temperature: prefer Temp3pm, Temp9am, MaxTemp
    temp = None
    for col in ["Temp3pm", "Temp9am", "MaxTemp", "MinTemp"]:
        if col in df.columns:
            try:
                temp = last.get(col)
                if _pd.notna(temp):
                    break
            except Exception:
                continue
    return {"humidity": humidity, "wind": wind, "temp": temp}


@app.route("/")
def index():
    metrics = load_metrics()

    # Build chart-friendly structure: {metric: {algorithm: [(ts, val), ...]}}
    data = {}
    for entry in metrics.get("algorithms", []):
        alg = entry.get("algorithm")
        ts = entry.get("timestamp")
        perf = entry.get("performance_metrics", {})
        if not alg or not ts or not perf:
            continue
        for m in ["accuracy", "precision", "recall", "f1_score"]:
            val = perf.get(m, {}).get("value")
            if val is None:
                continue
            data.setdefault(m, {}).setdefault(alg, []).append({"ts": ts, "v": val})

    # Sort each algorithm series by timestamp
    for m in data:
        for alg in data[m]:
            data[m][alg] = sorted(data[m][alg], key=lambda x: x["ts"]) 

    # Determine available images (if present in repo root)
    available_images = [img for img in IMAGES if (ROOT / img).exists()]

    # compute average rain probability across latest metrics if available
    rain_vals = []
    for entry in metrics.get('algorithms', []):
        rv = None
        rp = entry.get('rain_probability') or entry.get('performance_metrics', {}).get('rain_probability')
        if isinstance(rp, dict):
            rv = rp.get('value')
        try:
            if rv is not None:
                rain_vals.append(float(rv))
        except Exception:
            continue

    rain_prob = None
    if rain_vals:
        rain_prob = float(sum(rain_vals) / len(rain_vals))

    forecast = get_forecast_or_fallback()
    place_forecast = load_place_forecast().get('places', [])
    current_prediction = forecast.get('current_weather', {})
    weekly_forecast = forecast.get('weekly_forecast') or build_weekly_forecast(rain_prob, get_latest_weather_summary())
    today = current_prediction.get('supporting_data', {}) or get_latest_weather_summary()
    tomorrow = forecast.get('tomorrow_weather', {}).get('supporting_data', {}) or get_latest_weather_summary()

    weather_icon, background_image_url = choose_background_asset(current_prediction.get('predicted_main'))

    return render_template(
        "index.html",
        images=available_images,
        rain_prob=rain_prob,
        current_prediction=current_prediction,
        weather_icon=weather_icon,
        background_image_url=background_image_url,
        weekly_forecast=weekly_forecast,
        today=today,
        tomorrow=tomorrow,
        forecast_available=bool(weekly_forecast),
        place_forecast=place_forecast,
        preprocessed_sample=forecast.get('preprocessed_sample', []),
    )


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory(str(ROOT), filename)


@app.route("/metrics/<path:filename>")
def metrics_file(filename):
    return send_from_directory(str(METRICS_DIR), filename)


@app.route("/refresh", methods=["GET"])
def refresh_model():
    result = run_ml_pipeline()
    return jsonify(result)


@app.route("/api/forecast", methods=["GET"])
def api_forecast():
    forecast = load_forecast_data()
    return jsonify({"forecast": forecast})


@app.route("/api/model-results", methods=["GET"])
def api_model_results():
    forecast = load_forecast_data()
    preprocessed = forecast.get("preprocessed_sample", [])
    return jsonify({"forecast": forecast, "preprocessed_sample": preprocessed})


# WebSocket Events
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    # Send preprocessed data to the client upon connection
    forecast = load_forecast_data()
    preprocessed = forecast.get("preprocessed_sample", [])
    emit('model_results', {
        'preprocessed_sample': preprocessed,
        'generated_at': forecast.get('generated_at', ''),
        'current_weather': forecast.get('current_weather', {}),
        'weekly_forecast': forecast.get('weekly_forecast', [])
    })


@socketio.on('request_model_results')
def handle_request_model_results():
    print(f"Client {request.sid} requested model results")
    forecast = load_forecast_data()
    preprocessed = forecast.get("preprocessed_sample", [])
    emit('model_results', {
        'preprocessed_sample': preprocessed,
        'generated_at': forecast.get('generated_at', ''),
        'current_weather': forecast.get('current_weather', {}),
        'weekly_forecast': forecast.get('weekly_forecast', [])
    })


@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")


if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
