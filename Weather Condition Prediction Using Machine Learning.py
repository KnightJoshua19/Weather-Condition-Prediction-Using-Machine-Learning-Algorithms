"""
Project name:
Weather Condition Prediction Using Machine Learning Algorithms

--------------------------------------------------------------------------------------------------------

Description:
Weather forecasting is essential for planning daily activities, agriculture, transportation, and
disaster preparedness. Sudden weather changes, especially rainfall, can significantly impact
both individuals and industries.
This project aims to develop a machine learning-based classification system that predicts
whether it will rain using historical weather data. Instead of relying on traditional meteorological
simulations, the project applies a data-driven approach by analyzing patterns in features such
as temperature, humidity, wind conditions, and atmospheric pressure.
The system utilizes multiple machine learning algorithms to compare performance and identify
the most effective model for predicting rainfall. Additionally, data visualization techniques are
used to better understand feature relationships and model behavior.

--------------------------------------------------------------------------------------------------------

Authors: 
Kent Louie
Joshua Ganas
Dan Philip Achas
Gerald Boniel
Joshua M. Esclamado
"""

# ================================
# 1. IMPORT LIBRARIES
# ================================
from pathlib import Path
import json
from datetime import datetime, timedelta

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to prevent display issues
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.decomposition import PCA
import numpy as np
import joblib

from pipeline import Pipeline
import prediction_helpers

# ================================
# 2. LOAD DATASET
# ================================
DATA_DIR = Path(__file__).resolve().parent / "Weather Datasets"
MODELS_DIR = Path(__file__).resolve().parent / "models"
PIPELINE_PATH = MODELS_DIR / "weather_pipeline.joblib"
weather_dataset = DATA_DIR / "202311_CombinedData.csv"

if weather_dataset.exists():
    data_file = weather_dataset
else:
    csvs = list(DATA_DIR.glob("*.csv")) if DATA_DIR.exists() else []
    excels = list(DATA_DIR.glob("*.xls*")) if DATA_DIR.exists() else []
    if csvs:
        data_file = csvs[0]
    elif excels:
        data_file = excels[0]
    else:
        raise FileNotFoundError(f"No CSV or Excel dataset found in {DATA_DIR}")

if data_file.suffix.lower() in [".xls", ".xlsx"]:
    raw_df = pd.read_excel(data_file)
else:
    raw_df = pd.read_csv(data_file)
preprocessed_df = raw_df.copy()
print(f"Loaded dataset: {data_file}")


# ================================
# 3. DATA PREPROCESSING
# ================================

# Remove columns not useful for modeling
non_feature_columns = ["row ID", "datetime", "extraction_date_time", "weather.icon", "sys.sunrise", "sys.sunset"]
preprocessed_df = preprocessed_df.drop(columns=[c for c in non_feature_columns if c in preprocessed_df.columns], errors="ignore")

# Fill missing values with column averages (numeric) or mode (categorical)
for col in preprocessed_df.select_dtypes(include=["number"]).columns:
    if preprocessed_df[col].isna().any():
        preprocessed_df[col] = preprocessed_df[col].fillna(preprocessed_df[col].mean())

for col in preprocessed_df.select_dtypes(include=["object", "string"]).columns:
    if preprocessed_df[col].isna().any():
        mode_value = preprocessed_df[col].mode()
        if not mode_value.empty:
            preprocessed_df[col] = preprocessed_df[col].fillna(mode_value[0])
        else:
            preprocessed_df[col] = preprocessed_df[col].fillna("Unknown")

print(f"Filled all missing values: numeric columns with mean, categorical columns with mode or 'Unknown'\n")

# Use weather.main as the classification target
target_column = "weather.main"
preprocessed_df[target_column] = preprocessed_df[target_column].fillna("Unknown")

print(f"Using target column: {target_column}\n")

# Keep a copy with original labels for visualization and output
raw_target = preprocessed_df[target_column].astype(str).copy()

target_le = LabelEncoder()
y = target_le.fit_transform(raw_target)

feature_columns = [c for c in preprocessed_df.columns if c not in [target_column, "weather.description"]]
feature_df = preprocessed_df[feature_columns].copy()

categorical_encoders = {}
for col in feature_df.select_dtypes(include=["object", "string"]).columns:
    feature_df[col] = feature_df[col].fillna("Unknown").astype(str)
    le = LabelEncoder()
    feature_df[col] = le.fit_transform(feature_df[col])
    categorical_encoders[col] = le

X = feature_df

df = preprocessed_df.copy()


# ================================
# 4. VISUALIZATIONS
# ================================


sns.set_theme(style="darkgrid")


plt.figure(figsize=(8, 5))
sns.countplot(x=target_column, data=df)
plt.title(f"Distribution of {target_column}")
plt.xlabel(target_column)
plt.ylabel("Count")
plt.tight_layout()
plt.savefig("distribution.png")
plt.close()


corr = df.select_dtypes(include=[np.number]).corr()
plt.figure(figsize=(14, 12))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0)
plt.title("Feature Correlation Matrix")
plt.tight_layout()
plt.savefig("correlation_heatmap.png")
plt.close()


# ================================
# 5. MODEL PREPARATION
# ================================


scaler = StandardScaler()
# keep original feature names for later reference
original_feature_names = X.columns.tolist()

# Standardize features
X_scaled = scaler.fit_transform(X)

# Dimensionality reduction: PCA (configurable)
# Set APPLY_PCA = True to enable PCA and keep enough components to explain PCA_VARIANCE (or set PCA_N_COMPONENTS)
APPLY_PCA = True
PCA_VARIANCE = 0.95
PCA_N_COMPONENTS = None  # set to int to force fixed number of components
pca = None

if APPLY_PCA:
    if PCA_N_COMPONENTS:
        pca = PCA(n_components=PCA_N_COMPONENTS, random_state=42)
    else:
        pca = PCA(n_components=PCA_VARIANCE, random_state=42)
    X_reduced = pca.fit_transform(X_scaled)
    X_final = X_reduced
    feature_names = [f'PC{i+1}' for i in range(X_reduced.shape[1])]
    explained = pca.explained_variance_ratio_.sum()
    print(f"Applied PCA: reduced {X_scaled.shape[1]} -> {X_reduced.shape[1]} components, explained variance={explained:.3f}")
else:
    X_final = X_scaled
    feature_names = original_feature_names


X_temp, X_test, y_temp, y_test = train_test_split(
    X_final, y, test_size=0.2, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.25, random_state=42, stratify=y_temp
)

print(f"Data split: train={len(X_train)} rows, validation={len(X_val)} rows, test={len(X_test)} rows")


def save_pipeline(
    model,
    scaler,
    pca,
    target_encoder,
    categorical_encoders,
    feature_columns,
    apply_pca,
    feature_names,
):
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    feature_means, feature_modes = get_averages()
    pipeline = {
        "model": model,
        "scaler": scaler,
        "pca": pca,
        "target_encoder": target_encoder,
        "categorical_encoders": categorical_encoders,
        "feature_columns": feature_columns,
        "apply_pca": apply_pca,
        "feature_names": feature_names,
        "feature_means": feature_means,
        "feature_modes": feature_modes,
        "raw_df": raw_df,
        "preprocessed_df": preprocessed_df
    }
    joblib.dump(pipeline, PIPELINE_PATH)
    print(f"Saved trained pipeline to {PIPELINE_PATH}")

    return Pipeline(pipeline)

def get_averages():
    feature_means = {}
    feature_modes = {}
    for col in feature_columns:
        if col in preprocessed_df.select_dtypes(include=["number"]).columns:
            feature_means[col] = preprocessed_df[col].mean()
        else:
            feature_modes[col] = preprocessed_df[col].mode()
    return feature_means, feature_modes

# ================================
# 6. MODEL TRAINING
# ================================


Decision_Tree_Algorithm = DecisionTreeClassifier(random_state=42)
Decision_Tree_Algorithm.fit(X_train, y_train)
pipeline = save_pipeline(
    Decision_Tree_Algorithm,
    scaler,
    pca,
    target_le,
    categorical_encoders,
    feature_columns,
    APPLY_PCA,
    feature_names,
)


# ================================
# 7. EVALUATION AND PLOTS
# ================================


def evaluate_model(model, name, X_eval, y_eval, label="Test"):
    y_pred = model.predict(X_eval)
    image_name = f"{name.lower().replace(' ', '_')}_{label.lower()}_confusion_matrix.png"
    if label.lower() == "test":
        image_name = f"{name.lower().replace(' ', '_')}_confusion_matrix.png"
    result = {
        "name": name,
        "label": label,
        "model": model,
        "accuracy": accuracy_score(y_eval, y_pred),
        "report": classification_report(y_eval, y_pred),
        "confusion_matrix": confusion_matrix(y_eval, y_pred),
        "image_path": Path(image_name),
    }


    plt.figure(figsize=(6, 5))
    sns.heatmap(result["confusion_matrix"], annot=True, fmt="d", cmap="Blues")
    plt.title(f"{name} {label} Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(result["image_path"])
    plt.close()


    return result


validation_result = evaluate_model(Decision_Tree_Algorithm, "Decision Tree", X_val, y_val, label="Validation")
final_result = evaluate_model(Decision_Tree_Algorithm, "Decision Tree", X_test, y_test, label="Test")
results = [
    final_result,
]

feature_index = feature_names if len(feature_names) == len(Decision_Tree_Algorithm.feature_importances_) else X.columns
feature_importances = pd.Series(
    Decision_Tree_Algorithm.feature_importances_, index=feature_index
).sort_values(ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(x=feature_importances.values, y=feature_importances.index)
plt.title("Decision Tree Feature Importances")
plt.xlabel("Importance")
plt.ylabel("Feature")
plt.tight_layout()
plt.savefig("feature_importance.png")
plt.close()


print("\nSaved visualizations: distribution.png, correlation_heatmap.png, decision_tree_validation_confusion_matrix.png, decision_tree_confusion_matrix.png, feature_importance.png")


# ================================
# 8. PRINT RAW DATA, PREPROCESSED DATA, AND RESULTS
# ================================


print("===== RAW DATA SAMPLE =====")
raw_sample_columns = ['datetime', 'city_name', 'main.temp', 'weather.main', 'weather.description']
print(raw_df[raw_sample_columns].head(5))


print("\n===== PREPROCESSED DATA SAMPLE =====")
preprocessed_sample_columns = ['city_name', 'main.temp', 'main.humidity', 'wind.speed', 'clouds.all', 'weather.main', 'weather.description']
print(preprocessed_df[preprocessed_sample_columns].head(5))


print("\n===== MODEL RESULTS =====")
print("\n--- Validation Results ---")
print(f"Accuracy: {validation_result['accuracy']:.4f}")
print("Classification Report:\n", validation_result["report"])
print("Confusion Matrix:\n", validation_result["confusion_matrix"])
for result in results:
    print(f"\n--- {result['name']} ---")
    print(f"Accuracy: {result['accuracy']:.4f}")
    print("Classification Report:\n", result["report"])
    print("Confusion Matrix:\n", result["confusion_matrix"])


# ================================
# 9. EXPORT METRICS TO JSON
# ================================

# Prepare metrics for JSON export
algorithms_data = []

validation_report_dict = classification_report(y_val, validation_result['model'].predict(X_val), output_dict=True)

for result in results:
    # Parse the classification report to extract metrics
    report_dict = classification_report(y_test, result['model'].predict(X_test), output_dict=True)
    
    # compute mean predicted probability for the chosen class if available
    try:
        proba = result['model'].predict_proba(X_test)
        mean_proba = float(np.max(proba, axis=1).mean())
    except Exception:
        mean_proba = None

    algorithm_entry = {
        "algorithm": result['name'],
        "timestamp": datetime.now().isoformat(),
        "data_split": {
            "train_ratio": 0.6,
            "validation_ratio": 0.2,
            "test_ratio": 0.2,
            "random_state": 42
        },
        "performance_metrics": {
            "accuracy": {
                "value": float(result['accuracy']),
                "description": "Classification accuracy on the final test set",
                "value_range": "[0, 1]"
            },
            "precision": {
                "value": float(report_dict['weighted avg']['precision']),
                "description": "Weighted average precision on the final test set",
                "value_range": "[0, 1]"
            },
            "recall": {
                "value": float(report_dict['weighted avg']['recall']),
                "description": "Weighted average recall on the final test set",
                "value_range": "[0, 1]"
            },
            "f1_score": {
                "value": float(report_dict['weighted avg']['f1-score']),
                "description": "Weighted average F1-score on the final test set",
                "value_range": "[0, 1]"
            },
            "validation_accuracy": {
                "value": float(validation_report_dict['accuracy']),
                "description": "Validation accuracy on the holdout validation set",
                "value_range": "[0, 1]"
            }
        },
        "confusion_matrix": result['confusion_matrix'].tolist(),
        "label_probability": {"value": mean_proba, "description": "Mean predicted probability of the chosen weather.main label on the test set"}
    }
    algorithms_data.append(algorithm_entry)

# Create metrics structure
metrics_output = {
    "algorithms": algorithms_data
}

# Export to JSON file
json_path = Path(__file__).resolve().parent / "algorithm_metrics.json"
with open(json_path, 'w') as f:
    json.dump(metrics_output, f, indent=4)

print(f"\nMetrics written to algorithm_metrics.json")

# Also write per-algorithm metric files into a `metrics/` folder (one file per algorithm)
metrics_dir = Path(__file__).resolve().parent / "metrics"
metrics_dir.mkdir(parents=True, exist_ok=True)
for entry in metrics_output.get('algorithms', []):
    try:
        alg = entry.get('algorithm')
        if not alg:
            continue
        safe_name = alg.lower().replace(' ', '_')
        alg_path = metrics_dir / f"{safe_name}_metrics.json"
        if alg_path.exists():
            try:
                with open(alg_path, 'r') as f:
                    existing_list = json.load(f)
            except Exception:
                existing_list = []
        else:
            existing_list = []
        existing_list.append(entry)
        with open(alg_path, 'w') as f:
            json.dump(existing_list, f, indent=4)
    except Exception:
        continue


# ================================
# 10. PREDICTION HELPERS
# ================================

#See prediction_helpers.py

# ================================
# 11. PLOT METRICS OVER TIME (multi-line per metric)
# ================================

records = []
for entry in metrics_output.get('algorithms', []):
    try:
        alg = entry.get('atlgorithm')
        ts = entry.get('timestamp')
        perf = entry.get('performance_metrics', {})
        if alg is None or ts is None or not perf:
            continue
        records.append({
            'algorithm': alg,
            'timestamp': pd.to_datetime(ts),
            'accuracy': float(perf.get('accuracy', {}).get('value', float('nan'))),
            'precision': float(perf.get('precision', {}).get('value', float('nan'))),
            'recall': float(perf.get('recall', {}).get('value', float('nan'))),
            'f1_score': float(perf.get('f1_score', {}).get('value', float('nan'))),
        })
    except Exception:
        continue

df_metrics = pd.DataFrame(records)

if not df_metrics.empty:
    df_metrics = df_metrics.sort_values('timestamp')

    metrics = ['accuracy', 'precision', 'recall', 'f1_score']
    fig, axes = plt.subplots(2, 2, figsize=(14, 10), sharex=True)
    axes = axes.flatten()

    for ax, metric in zip(axes, metrics):
        # Use seaborn lineplot for time-series (long-form data)
        df_m = df_metrics[['timestamp', 'algorithm', metric]].dropna()
        if df_m.empty:
            ax.text(0.5, 0.5, f'No data for {metric}', ha='center')
            ax.set_title(metric.title())
            continue
        sns.lineplot(
            data=df_m,
            x='timestamp',
            y=metric,
            hue='algorithm',
            style='algorithm',
            markers=True,
            dashes=False,
            ax=ax,
            estimator=None,
        )
        # Annotate each point with its numeric value
        df_m_sorted = df_m.sort_values('timestamp')
        for alg in df_m_sorted['algorithm'].unique():
            subset = df_m_sorted[df_m_sorted['algorithm'] == alg]
            for tx, ty in zip(subset['timestamp'], subset[metric]):
                try:
                    ax.text(tx, ty, f"{ty:.3f}", fontsize=7, va='bottom', ha='center', rotation=30)
                except Exception:
                    # If text placement fails for any point, continue
                    continue
        ax.set_title(metric.replace('_', ' ').title())
        ax.set_ylabel(metric.title())
        ax.grid(True, linestyle='--', alpha=0.6)
        ax.legend()

    plt.xticks(rotation=45)
    plt.tight_layout()
    out_path = 'metrics_over_time.png'
    plt.savefig(out_path)
    plt.close()
    print(f"Saved {out_path}")
else:
    print("No historical metrics available to plot.")


# ================================
# 12. GENERATE CURRENT AND WEEKLY WEATHER PREDICTIONS
# ================================

print("\n" + "="*50)
print("WEATHER PREDICTIONS")
print("="*50)

current_weather = prediction_helpers.predict_current_weather(pipeline)
if current_weather:
    print("\n--- CURRENT WEATHER PREDICTION ---")
    print(f"Timestamp: {current_weather['timestamp']}")
    print(f"Predicted Weather Main: {current_weather['predicted_main']}")
    print(f"Predicted Description: {current_weather['predicted_description']}")
    print(f"Confidence: {current_weather['confidence']}%")
    print("Supporting data:")
    for k, v in current_weather['supporting_data'].items():
        print(f"  {k}: {v}")
else:
    print("Failed to generate current weather prediction")

tomorrow_weather = prediction_helpers.predict_tomorrow_weather(pipeline)
if tomorrow_weather:
    print("\n--- CURRENT WEATHER PREDICTION ---")
    print(f"Timestamp: {tomorrow_weather['timestamp']}")
    print(f"Predicted Weather Main: {tomorrow_weather['predicted_main']}")
    print(f"Predicted Description: {tomorrow_weather['predicted_description']}")
    print(f"Confidence: {tomorrow_weather['confidence']}%")
    print("Supporting data:")
    for k, v in tomorrow_weather['supporting_data'].items():
        print(f"  {k}: {v}")
else:
    print("Failed to generate current weather prediction")

weekly_forecast = prediction_helpers.predict_weekly_weather(pipeline)
if weekly_forecast:
    print("\n--- 7-DAY WEATHER FORECAST ---")
    for day_forecast in weekly_forecast:
        print(f"\n{day_forecast['day'].upper()} ({day_forecast['date']})")
        print(f"  Predicted Weather Main: {day_forecast['predicted_main']}")
        print(f"  Predicted Description: {day_forecast['predicted_description']}")
        print(f"  Confidence: {day_forecast['confidence']}%")
        print("  Supporting data:")
        for k, v in day_forecast['supporting_data'].items():
            print(f"    {k}: {v}")
else:
    print("Failed to generate weekly weather forecast")

predictions_output = {
    "generated_at": datetime.now().isoformat(),
    "current_weather": current_weather,
    "tomorrow_weather" : tomorrow_weather,
    "weekly_forecast": weekly_forecast
}

predictions_json_path = Path(__file__).resolve().parent / "weather_predictions.json"
try:
    with open(predictions_json_path, 'w') as f:
        json.dump(predictions_output, f, indent=4)
    print(f"\n✓ Predictions saved to weather_predictions.json")
except Exception as e:
    print(f"Error saving predictions: {e}")

print("\n" + "="*50)