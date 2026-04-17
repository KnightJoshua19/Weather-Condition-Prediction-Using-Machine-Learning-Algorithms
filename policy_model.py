"""
Project name:
Weather Condition Prediction Using Machine Learning Algorithms

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
DATA_PATH = Path(__file__).resolve().parent / "Weather Test Data.csv"


raw_df = pd.read_csv(DATA_PATH)
preprocessed_df = raw_df.copy()


# ================================
# 3. DATA PREPROCESSING
# ================================


# Drop columns that are not useful for modeling
non_feature_columns = ["row ID"]
preprocessed_df = preprocessed_df.drop(columns=non_feature_columns, errors="ignore")


# Drop columns with more than 50% missing values
missing_ratio = preprocessed_df.isna().mean()
cols_to_drop = missing_ratio[missing_ratio > 0.5].index.tolist()
cols_to_drop = [c for c in cols_to_drop if c not in ["RainToday"]]
preprocessed_df = preprocessed_df.drop(columns=cols_to_drop, errors="ignore")
print(f"Dropped columns with too many missing values: {cols_to_drop}\n")


# Forward-fill remaining missing values, then fill any remaining numeric gaps with column mean
preprocessed_df = preprocessed_df.ffill()
for col in preprocessed_df.select_dtypes(include=["number"]).columns:
    if preprocessed_df[col].isna().any():
        preprocessed_df[col] = preprocessed_df[col].fillna(preprocessed_df[col].mean())


# Convert target to binary and use RainToday as the label for this dataset
if "RainTomorrow" in preprocessed_df.columns:
    target_column = "RainTomorrow"
else:
    target_column = "RainToday"


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


sns.set(style="whitegrid")


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


lr = LogisticRegression(max_iter=1000)
lr.fit(X_train, y_train)


rt = DecisionTreeClassifier(random_state=42)
rt.fit(X_train, y_train)


rf = RandomForestClassifier(random_state=42)
rf.fit(X_train, y_train)


# ================================
# 7. EVALUATION AND PLOTS
# ================================


def evaluate_model(model, name):
    y_pred = model.predict(X_test)
    result = {
        "name": name,
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
    evaluate_model(lr, "Logistic Regression"),
    evaluate_model(rt, "Decision Tree"),
    evaluate_model(rf, "Random Forest"),
]


feature_importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
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
