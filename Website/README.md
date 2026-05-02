Web dashboard for Weather Condition Prediction

Run locally:

1. Create and activate a Python environment (recommended).

2. Install requirements:

```bash
python -m pip install -r Website/requirements.txt
```

3. From repository root run:

```bash
python Website/Weather_Forecaster.py
```

4. Open http://127.0.0.1:5000 in your browser.

Notes:
- The dashboard automatically refreshes the ML model when you open the site and can be refreshed manually using the refresh button.
- The page loads predictions from `weather_predictions.json`, and metrics are read from `algorithm_metrics.json` to draw charts.
