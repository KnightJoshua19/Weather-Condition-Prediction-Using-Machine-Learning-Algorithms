from flask import Flask, render_template, send_from_directory, redirect, url_for, flash
from pathlib import Path
import json
import subprocess
import sys

app = Flask(__name__)
app.secret_key = "change-me"

ROOT = Path(__file__).resolve().parent.parent
METRICS_PATH = ROOT / "algorithm_metrics.json"
METRICS_DIR = ROOT / "metrics"
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

    # get latest weather summary (humidity, wind, temp)
    weather = get_latest_weather_summary()
    place_forecast = load_place_forecast().get('places', [])

    return render_template("index.html", images=available_images, rain_prob=rain_prob, weather=weather, place_forecast=place_forecast)


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory(str(ROOT), filename)


@app.route("/metrics/<path:filename>")
def metrics_file(filename):
    return send_from_directory(str(METRICS_DIR), filename)


@app.route("/run")
def run_pipeline():
    # Run the main python script as a subprocess
    script = ROOT / "Weather Condition Prediction Using Machine Learning.py"
    if not script.exists():
        flash("Main script not found", "danger")
        return redirect(url_for("index"))
    try:
        proc = subprocess.run([sys.executable, str(script)], capture_output=True, text=True, timeout=600)
        flash("Script finished. Check dashboard for updated metrics and images.", "success")
        if proc.returncode != 0:
            flash(f"Script exited with code {proc.returncode}: {proc.stderr}", "warning")
    except subprocess.TimeoutExpired:
        flash("Script timed out.", "danger")
    except Exception as e:
        flash(f"Error running script: {e}", "danger")
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
