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
- Click 'Run Pipeline' to execute the main script `Weather Condition Prediction Using Machine Learning.py`. This will update `algorithm_metrics.json`, per-algorithm files in `metrics/`, and overwrite images in the repo root.
- The dashboard reads `algorithm_metrics.json` to draw charts.
