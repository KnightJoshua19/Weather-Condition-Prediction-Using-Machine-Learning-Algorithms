from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.decomposition import PCA

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

    def __init__(
            self,
            model : DecisionTreeClassifier,
            scaler : StandardScaler,
            pca : PCA,
            target_encoder : LabelEncoder,
            categorical_encoders : dict,
            feature_columns : list[str],
            apply_pca : bool,
            feature_names : list[str],
            feature_means : dict,
            feature_modes : dict
        ):
        self.model = model
        self.scaler = scaler
        self.pca = pca
        self.target_le = target_encoder
        self.categorical_encoders = categorical_encoders
        self.feature_columns = feature_columns
        self.apply_pca = apply_pca
        self.feature_names = feature_names
        self.feature_means = feature_means
        self.feature_modes = feature_modes
    
    def __init__(self, pipeline : dict):
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
            "feature_modes": self.feature_modes
        }
        return pipeline
    
    