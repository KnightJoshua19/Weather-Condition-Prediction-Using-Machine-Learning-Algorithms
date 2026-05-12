from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.decomposition import PCA
from pandas import DataFrame
from pathlib import Path
import pandas as pd


class Pipeline:
    model : DecisionTreeClassifier
    scaler : StandardScaler
    pca : PCA
    target_le : LabelEncoder
    categorical_encoders : dict
    feature_columns : list[str]
    apply_pca : bool
    feature_names : list[str]
    feature_means : dict
    feature_modes : dict
    raw_df : DataFrame
    preprocessed_df : DataFrame

    def __init__(self, pipeline : dict = None, **kwargs):
        if isinstance(pipeline, dict):
            # Initialize from dictionary
            self.model = pipeline["model"]
            self.scaler = pipeline["scaler"]
            self.pca = pipeline["pca"]
            self.target_le = pipeline["target_encoder"]
            self.categorical_encoders = pipeline["categorical_encoders"]
            self.feature_columns = pipeline["feature_columns"]
            self.apply_pca = pipeline["apply_pca"]
            self.feature_names = pipeline["feature_names"]
            self.feature_means = pipeline["feature_means"]
            self.feature_modes = pipeline["feature_modes"]
            self.raw_df = self.load_df(pipeline["raw_df_path"])
            self.preprocessed_df = self.load_df(pipeline["preprocessed_df_path"])
        else:
            # Initialize from individual parameters
            self.model = kwargs.get("model")
            self.scaler = kwargs.get("scaler")
            self.pca = kwargs.get("pca")
            self.target_le = kwargs.get("target_encoder")
            self.categorical_encoders = kwargs.get("categorical_encoders")
            self.feature_columns = kwargs.get("feature_columns")
            self.apply_pca = kwargs.get("apply_pca")
            self.feature_names = kwargs.get("feature_names")
            self.feature_means = kwargs.get("feature_means")
            self.feature_modes = kwargs.get("feature_modes")
            self.raw_df = kwargs.get("raw_df")
            self.preprocessed_df = kwargs.get("preprocessed_df")
    
    def to_dict(self):
        pipeline = {
            "model": self.model,
            "scaler": self.scaler,
            "pca": self.pca,
            "target_encoder": self.target_le,
            "categorical_encoders": self.categorical_encoders,
            "feature_columns": self.feature_columns,
            "apply_pca": self.apply_pca,
            "feature_names": self.feature_names,
            "feature_means": self.feature_means,
            "feature_modes": self.feature_modes,
            "raw_df" : self.raw_df,
            "preprocessed_df" : self.preprocessed_df
        }
        return pipeline
    
    def load_df(self, filepath : str | Path):
        if type(filepath) != Path: filepath = Path(filepath)
        if filepath.exists():
            data_file = filepath
        else:
            raise FileNotFoundError(f"File does not exist: {filepath}")

        if data_file.suffix.lower() in [".xls", ".xlsx"]:
            return pd.read_excel(data_file)
        else:
            return pd.read_csv(data_file)
    
    