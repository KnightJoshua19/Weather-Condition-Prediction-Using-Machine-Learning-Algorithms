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
from datetime import datetime

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to prevent display issues
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ================================
# 2. LOAD DATASET
# ================================
DATA_DIR = Path(__file__).resolve().parent / "Weather Datasets"
Dataset_1 = DATA_DIR / "Weather Training Data.csv"
Dataset_2 = DATA_DIR / "Weather Reading from Major Cities Around the World.csv"

if Dataset_1.exists():
    data_file = Dataset_1
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

# Include Weather Reading from Major Cities Around the World dataset to add latitude and longitude features based on location
cities_df = pd.read_csv(Dataset_2)
if "Location" in preprocessed_df.columns and "City" in cities_df.columns:
    preprocessed_df = preprocessed_df.merge(cities_df[["City", "Latitude", "Longitude"]], left_on="Location", right_on="City", how="left")
    preprocessed_df = preprocessed_df.drop(columns=["City"], errors="ignore")
    
# Drop columns that are not useful for modeling
non_feature_columns = ["row ID"]
preprocessed_df = preprocessed_df.drop(columns=non_feature_columns, errors="ignore")


# Drop columns with more than 50% missing values
missing_ratio = preprocessed_df.isna().mean()
cols_to_drop = missing_ratio[missing_ratio > 0.5].index.tolist()
cols_to_drop = [c for c in cols_to_drop if c not in ["RainToday"]]
preprocessed_df = preprocessed_df.drop(columns=cols_to_drop, errors="ignore")
print(f"Dropped columns with too many missing values: {cols_to_drop}\n")


# Fill remaining missing values using column mean (average) instead of forward fill
for col in preprocessed_df.select_dtypes(include=["number"]).columns:
    if preprocessed_df[col].isna().any():
        preprocessed_df[col] = preprocessed_df[col].fillna(preprocessed_df[col].mean())


# Convert target to binary and use RainTomorrow as the label for this dataset
target_column = "RainTomorrow"

if preprocessed_df[target_column].dtype == object:
    preprocessed_df[target_column] = preprocessed_df[target_column].map({"Yes": 1, "No": 0})

print(f"Using target column: {target_column}\n")


# Convert categorical variables to numeric
label_encoder = LabelEncoder()
for col in preprocessed_df.select_dtypes(include=["object", "string"]).columns:
    preprocessed_df[col] = preprocessed_df[col].fillna("Unknown")
    preprocessed_df[col] = label_encoder.fit_transform(preprocessed_df[col])


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


corr = df.corr()
plt.figure(figsize=(14, 12))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0)
plt.title("Feature Correlation Matrix")
plt.tight_layout()
plt.savefig("correlation_heatmap.png")
plt.close()


# ================================
# 5. MODEL PREPARATION
# ================================


X = df.drop(target_column, axis=1)
y = df[target_column]


scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)


X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)


# ================================
# 6. MODEL TRAINING
# ================================


Logistic_Regression_Algorithm = LogisticRegression(max_iter=1000)
Logistic_Regression_Algorithm.fit(X_train, y_train)


Decision_Tree_Algorithm = DecisionTreeClassifier(random_state=42)
Decision_Tree_Algorithm.fit(X_train, y_train)


Random_Forest_Algorithm = RandomForestClassifier(random_state=42)
Random_Forest_Algorithm.fit(X_train, y_train)


# ================================
# 7. EVALUATION AND PLOTS
# ================================


def evaluate_model(model, name):
    y_pred = model.predict(X_test)
    result = {
        "name": name,
        "model": model,
        "accuracy": accuracy_score(y_test, y_pred),
        "report": classification_report(y_test, y_pred),
        "confusion_matrix": confusion_matrix(y_test, y_pred),
        "image_path": Path(f"{name.lower().replace(' ', '_')}_confusion_matrix.png"),
    }


    plt.figure(figsize=(6, 5))
    sns.heatmap(result["confusion_matrix"], annot=True, fmt="d", cmap="Blues")
    plt.title(f"{name} Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(result["image_path"])
    plt.close()


    return result


results = [
    evaluate_model(Logistic_Regression_Algorithm, "Logistic Regression"),
    evaluate_model(Decision_Tree_Algorithm, "Decision Tree"),
    evaluate_model(Random_Forest_Algorithm, "Random Forest"),
]


feature_importances = pd.Series(Random_Forest_Algorithm.feature_importances_, index=X.columns).sort_values(ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(x=feature_importances.values, y=feature_importances.index)
plt.title("Random Forest Feature Importances")
plt.xlabel("Importance")
plt.ylabel("Feature")
plt.tight_layout()
plt.savefig("feature_importance.png")
plt.close()


print("\nSaved visualizations: distribution.png, correlation_heatmap.png, logistic_regression_confusion_matrix.png, decision_tree_confusion_matrix.png, random_forest_confusion_matrix.png, feature_importance.png")


# ================================
# 8. PRINT RAW DATA, PREPROCESSED DATA, AND RESULTS
# ================================


print("===== RAW DATA SAMPLE =====")
key_columns = ['Location', 'MinTemp', 'MaxTemp', 'Rainfall', 'RainToday']
print(raw_df[key_columns].head(5))


print("\n===== PREPROCESSED DATA SAMPLE =====")
# For preprocessed, Location is encoded, so use numeric columns
numeric_columns = ['MinTemp', 'MaxTemp', 'Rainfall', 'RainToday']
print(preprocessed_df[numeric_columns].head(5))


print("\n===== MODEL RESULTS =====")
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

for result in results:
    # Parse the classification report to extract metrics
    report_dict = classification_report(y_test, result['model'].predict(X_test), output_dict=True)
    
    # compute mean predicted probability for the positive class if available
    try:
        proba = result['model'].predict_proba(X_test)[:, 1]
        mean_proba = float(proba.mean())
    except Exception:
        mean_proba = None

    algorithm_entry = {
        "algorithm": result['name'],
        "timestamp": datetime.now().isoformat(),
        "performance_metrics": {
            "accuracy": {
                "value": float(result['accuracy']),
                "description": "Classification accuracy - percentage of correct predictions",
                "value_range": "[0, 1]"
            },
            "precision": {
                "value": float(report_dict['weighted avg']['precision']),
                "description": "Weighted average precision across all classes",
                "value_range": "[0, 1]"
            },
            "recall": {
                "value": float(report_dict['weighted avg']['recall']),
                "description": "Weighted average recall across all classes",
                "value_range": "[0, 1]"
            },
            "f1_score": {
                "value": float(report_dict['weighted avg']['f1-score']),
                "description": "Weighted average F1-score across all classes",
                "value_range": "[0, 1]"
            }
        },
        "confusion_matrix": result['confusion_matrix'].tolist(),
        "rain_probability": {"value": mean_proba, "description": "Mean predicted probability of rain on the test set"}
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

print(f"\n✓ Metrics exported to algorithm_metrics.json")
# ================================
# 9. EXPORT METRICS TO JSON (append across runs)
# ================================

# Prepare metrics for JSON export
algorithms_data = []

for result in results:
    # Parse the classification report to extract metrics
    report_dict = classification_report(y_test, result['model'].predict(X_test), output_dict=True)
    # compute mean predicted probability for the positive class if available
    try:
        proba = result['model'].predict_proba(X_test)[:, 1]
        mean_proba = float(proba.mean())
    except Exception:
        mean_proba = None

    algorithm_entry = {
        "algorithm": result['name'],
        "timestamp": datetime.now().isoformat(),
        "performance_metrics": {
            "accuracy": {
                "value": float(result['accuracy']),
                "description": "Classification accuracy - percentage of correct predictions",
                "value_range": "[0, 1]"
            },
            "precision": {
                "value": float(report_dict['weighted avg']['precision']),
                "description": "Weighted average precision across all classes",
                "value_range": "[0, 1]"
            },
            "recall": {
                "value": float(report_dict['weighted avg']['recall']),
                "description": "Weighted average recall across all classes",
                "value_range": "[0, 1]"
            },
            "f1_score": {
                "value": float(report_dict['weighted avg']['f1-score']),
                "description": "Weighted average F1-score across all classes",
                "value_range": "[0, 1]"
            }
        },
        "confusion_matrix": result['confusion_matrix'].tolist(),
        "rain_probability": {"value": mean_proba, "description": "Mean predicted probability of rain on the test set"}
    }
    algorithms_data.append(algorithm_entry)

# Path to metrics file
json_path = Path(__file__).resolve().parent / "algorithm_metrics.json"

# Load existing metrics if present, then append new entries
if json_path.exists():
    try:
        with open(json_path, 'r') as f:
            existing = json.load(f)
            existing_algorithms = existing.get('algorithms', [])
    except Exception:
        existing_algorithms = []
    existing_algorithms.extend(algorithms_data)
    metrics_output = {"algorithms": existing_algorithms}
else:
    metrics_output = {"algorithms": algorithms_data}

# Write updated metrics back to file
with open(json_path, 'w') as f:
    json.dump(metrics_output, f, indent=4)

print(f"\n✓ Metrics appended to algorithm_metrics.json")

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
# 10. PLOT METRICS OVER TIME (multi-line per metric)
# ================================
records = []
for entry in metrics_output.get('algorithms', []):
    try:
        alg = entry.get('algorithm')
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
