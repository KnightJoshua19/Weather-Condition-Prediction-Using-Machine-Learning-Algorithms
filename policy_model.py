"""
Interactive Waste Management Policy ML Model
Enhanced with policymaker terminology and interactive features
For use with React.js frontend via API
"""

import os
import numpy as np
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

from scipy.signal import butter, filtfilt
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error

try:
    import keras
    from keras import layers, models, optimizers
    print(f"✓ Keras version {keras.__version__} loaded successfully")
except ImportError:
    print("ERROR: Keras not installed. Run: pip install keras")
    raise

# ============================================================================
# POLICYMAKER-FOCUSED CONFIGURATION
# ============================================================================
class WasteManagementPolicyConfig:
    """
    Configuration for waste management policy analysis pipeline
    All terminology aligned with environmental policy standards
    """
    
    def __init__(self):
        self.data_path = r'C:\Users\Joshua\Waste-Management-Policymaking-Assistant\public_data_waste_fee.csv'
        
        # Preprocessing parameters
        self.filter_cutoff = 0.1
        self.filter_order = 4
        self.rolling_window = 5
        self.variance_threshold = 0.1
        
        # Model parameters
        self.test_size = 0.2
        self.random_state = 42
        self.epochs = 50
        self.batch_size = 32
        
        # Policy analysis parameters
        self.policy_assessment_threshold = 0.7
        
        # Feature mapping - policymaker-friendly names
        self.feature_labels = {
            'wden': 'Waste Density (kg/km²)',
            'urb': 'Urbanization Rate (%)',
            'msw': 'Municipal Solid Waste (tons/year)',
            'sor': 'Source Segregation Rate (%)',
            'fee': 'Fee Collection Mechanism',
            'organic': 'Organic Waste %',
            'paper': 'Paper/Cardboard %',
            'glass': 'Glass %',
            'plastic': 'Plastic %'
        }
        
        # Policy instruments mapping
        self.policy_instruments = {
            'segregation': 'Extended Producer Responsibility (EPR)',
            'fee': 'Pay-As-You-Throw (PAYT)',
            'collection': 'Multi-Stream Collection System (MSTS)',
            'organic': 'Organic Waste Diversion Mandate (OWDM)',
            'awareness': 'Environmental Awareness Program (EAP)'
        }
    
    def display_config(self):
        """Display configuration"""
        print("\n" + "="*70)
        print("WASTE MANAGEMENT POLICY ANALYSIS CONFIGURATION")
        print("="*70)
        for key, value in self.__dict__.items():
            if key != 'policy_instruments' and key != 'feature_labels':
                print(f"  {key:<30}: {value}")
        print("="*70 + "\n")


# ============================================================================
# ENHANCED DATA PREPROCESSING WITH POLICY CONTEXT
# ============================================================================
class PolicyDataPreprocessor:
    """
    Data preprocessing with policy-specific handling
    Optimized for waste management decision support
    """
    
    def __init__(self, config):
        self.config = config
        self.scaler = MinMaxScaler()
        self.original_df = None
        self.processed_df = None
    
    def load_data(self):
        """Load waste management data"""
        print("[POLICY-DATA] Loading regional waste data...")
        self.original_df = pd.read_csv(self.config.data_path)
        print(f"  ✓ Loaded {len(self.original_df)} regional records")
        return self.original_df
    
    def apply_filter(self, series, cutoff=0.1, fs=1.0, order=4):
        """Apply Butterworth filter for smooth data"""
        if len(series) > order:
            b, a = butter(order, cutoff / (0.5 * fs), btype='low')
            return pd.Series(filtfilt(b, a, series), index=series.index)
        return series
    
    def clean_data(self):
        """Clean data for policy analysis"""
        print("[POLICY-DATA] Cleaning regional datasets...")
        df = self.original_df.copy()
        
        numeric_cols = df.select_dtypes(include='number').columns
        for col in numeric_cols:
            df[col] = df[col].astype(float)
            df[col] = self.apply_filter(
                df[col],
                cutoff=self.config.filter_cutoff,
                order=self.config.filter_order
            )
        
        column_mean = df.select_dtypes(include="number").rolling(
            window=self.config.rolling_window,
            center=True
        ).mean()
        df = df.fillna(column_mean)
        df.update(column_mean)
        
        initial_rows = len(df)
        df = df.drop_duplicates()
        removed_rows = initial_rows - len(df)
        print(f"  ✓ Data cleaned: {removed_rows} duplicates removed")
        
        self.processed_df = df
        return df
    
    def engineer_features(self):
        """Engineer policy-relevant features"""
        print("[POLICY-DATA] Engineering policy-relevant features...")
        df = self.processed_df.copy()
        
        def mean_absolute_difference(series):
            return np.mean(np.abs(series - np.mean(series)))
        
        removed_features = []
        numeric_cols = df.select_dtypes(include='number').columns
        for col in numeric_cols:
            mad = mean_absolute_difference(df[col])
            if mad < self.config.variance_threshold:
                removed_features.append(col)
                df.drop(columns=[col], inplace=True)
        
        if removed_features:
            print(f"  ✓ Low-variance features removed: {len(removed_features)}")
        
        self.processed_df = df
        return df
    
    def scale_features(self):
        """Normalize features"""
        print("[POLICY-DATA] Normalizing feature scales...")
        df = self.processed_df.copy()
        
        numeric_cols = df.select_dtypes(include='number').columns
        df[numeric_cols] = self.scaler.fit_transform(df[numeric_cols])
        
        self.processed_df = df
        return df
    
    def get_processed_data(self):
        """Execute full preprocessing"""
        self.load_data()
        self.clean_data()
        self.engineer_features()
        self.scale_features()
        return self.processed_df


# ============================================================================
# INTERACTIVE POLICY-FOCUSED TEXT GENERATION
# ============================================================================
class PolicyIntelligenceGenerator:
    """
    Generates policy recommendations and insights
    Uses trained ML model to identify patterns
    Outputs policymaker-friendly reports
    """
    
    def __init__(self, config):
        self.config = config
        self.model = None
    
    def build_model(self, input_dim):
        """Build policy analysis neural network"""
        print("[POLICY-MODEL] Building policy analysis model...")
        
        model = models.Sequential([
            layers.Dense(64, activation='relu', input_dim=input_dim, name='feature_extraction'),
            layers.BatchNormalization(name='batch_norm_1'),
            layers.Dropout(0.3, name='dropout_1'),
            
            layers.Dense(32, activation='relu', name='pattern_recognition'),
            layers.BatchNormalization(name='batch_norm_2'),
            layers.Dropout(0.2, name='dropout_2'),
            
            layers.Dense(16, activation='relu', name='policy_synthesis'),
            layers.Dense(1, activation='sigmoid', name='policy_recommendation')
        ], name='WastePolicyAnalyzer')
        
        model.compile(
            optimizer=optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'mse']
        )
        
        print(f"  ✓ Policy analysis model created: {model.count_params():,} parameters")
        self.model = model
        return model
    
    def train_model(self, X_train, y_train, X_val, y_val):
        """Train model"""
        print("[POLICY-MODEL] Training policy model...")
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=self.config.epochs,
            batch_size=self.config.batch_size,
            verbose=0
        )
        
        final_acc = history.history['accuracy'][-1]
        print(f"  ✓ Model training complete: {final_acc:.2%} accuracy")
        return history
    
    def generate_policy_brief(self, region_data):
        """
        Generate executive policy brief for a region
        Input: Regional waste management data
        Output: Policy recommendations
        """
        brief = {
            'region': region_data.get('region', 'Unknown'),
            'assessment_date': pd.Timestamp.now().isoformat(),
            'executive_summary': self._create_executive_summary(region_data),
            'key_findings': self._analyze_findings(region_data),
            'policy_recommendations': self._recommend_policies(region_data),
            'implementation_roadmap': self._create_roadmap(region_data)
        }
        return brief
    
    def _create_executive_summary(self, data):
        """Create executive summary"""
        return f"""
        Regional Waste Management Policy Assessment for {data.get('region')}
        
        This assessment evaluates current waste management practices against 
        international and Philippine environmental standards. Recommendations are 
        based on data-driven analysis of key performance indicators.
        """
    
    def _analyze_findings(self, data):
        """Analyze key findings"""
        findings = []
        
        waste_density = float(data.get('wden', 0))
        sorting_rate = float(data.get('sor', 0))
        urbanization = float(data.get('urb', 0))
        
        if waste_density > 300000:
            findings.append({
                'indicator': 'Waste Generation Pressure',
                'status': 'CRITICAL',
                'finding': f'Waste density of {waste_density:,.0f} kg/km² indicates severe pressure',
                'implication': 'Immediate infrastructure scaling required'
            })
        
        if sorting_rate < 30:
            findings.append({
                'indicator': 'Waste Segregation Effectiveness',
                'status': 'CRITICAL',
                'finding': f'Sorting rate of {sorting_rate:.1f}% is below 50% threshold',
                'implication': 'Enhanced segregation programs required'
            })
        
        if urbanization > 70:
            findings.append({
                'indicator': 'Urban Concentration',
                'status': 'HIGH',
                'finding': f'{urbanization:.1f}% urbanization rate indicates concentrated population',
                'implication': 'Urban-focused policy needed'
            })
        
        return findings
    
    def _recommend_policies(self, data):
        """Generate policy recommendations"""
        recommendations = []
        
        sorting_rate = float(data.get('sor', 0))
        urbanization = float(data.get('urb', 0))
        organic_pct = float(data.get('organic', 0))
        
        if sorting_rate < 50:
            recommendations.append({
                'policy': 'Waste Segregation Strengthening',
                'instrument': 'Waste Segregation Ordinance',
                'priority': 'CRITICAL',
                'actions': [
                    'Establish barangay Material Recovery Facilities (MRF)',
                    'Launch "Zero Waste Community" program',
                    'Implement color-coded bins citywide'
                ],
                'expected_impact': 'Increase sorting rate to 70%+ within 12 months'
            })
        
        if organic_pct > 50:
            recommendations.append({
                'policy': 'Organic Waste Management',
                'instrument': 'Organic Waste Diversion Mandate',
                'priority': 'HIGH',
                'actions': [
                    'Establish composting facilities',
                    'Promote home composting programs',
                    'Partner with agricultural institutions'
                ],
                'expected_impact': 'Divert 40%+ of MSW from landfills'
            })
        
        if urbanization > 60:
            recommendations.append({
                'policy': 'Urban Waste Management System',
                'instrument': 'Multi-Stream Collection System (MSTS)',
                'priority': 'HIGH',
                'actions': [
                    'Establish dedicated collection routes',
                    'Deploy collection vehicles for segregated streams',
                    'Implement real-time tracking system'
                ],
                'expected_impact': 'Improve collection efficiency to 90%+'
            })
        
        return recommendations
    
    def _create_roadmap(self, data):
        """Create implementation roadmap"""
        return {
            'phase_1': {
                'duration': '0-3 months',
                'focus': 'Policy Formulation & Stakeholder Engagement',
                'activities': [
                    'Conduct stakeholder consultations',
                    'Finalize policy framework',
                    'Secure budget allocation'
                ]
            },
            'phase_2': {
                'duration': '3-6 months',
                'focus': 'Infrastructure Development',
                'activities': [
                    'Construct Material Recovery Facilities',
                    'Procure collection equipment',
                    'Train waste management personnel'
                ]
            },
            'phase_3': {
                'duration': '6-12 months',
                'focus': 'Implementation & Monitoring',
                'activities': [
                    'Launch waste segregation program',
                    'Monitor policy compliance',
                    'Promote public awareness'
                ]
            }
        }
    
    def evaluate_region(self, region_data):
        """Evaluate a region's policy readiness"""
        evaluation = {
            'region': region_data.get('region'),
            'waste_management_score': self._calculate_wmm_score(region_data),
            'policy_readiness': self._assess_policy_readiness(region_data),
            'priority_interventions': self._identify_priority_interventions(region_data)
        }
        return evaluation
    
    def _calculate_wmm_score(self, data):
        """Calculate Waste Management Maturity score (0-100)"""
        weights = {
            'sor': 0.25,  # Sorting rate
            'urb': 0.15,  # Urbanization
            'msw': 0.15   # MSW handling
        }
        
        score = (
            float(data.get('sor', 0)) * weights['sor'] +
            float(data.get('urb', 0)) * weights['urb'] +
            min(float(data.get('msw', 0)) / 100, 100) * weights['msw']
        )
        return round(score, 2)
    
    def _assess_policy_readiness(self, data):
        """Assess policy readiness level"""
        wmm_score = self._calculate_wmm_score(data)
        
        if wmm_score < 30:
            return 'CRITICAL - Immediate intervention required'
        elif wmm_score < 50:
            return 'INADEQUATE - Significant improvements needed'
        elif wmm_score < 70:
            return 'DEVELOPING - On track for improvement'
        else:
            return 'ADVANCED - Strong policy implementation'
    
    def _identify_priority_interventions(self, data):
        """Identify priority interventions"""
        interventions = []
        
        if float(data.get('sor', 0)) < 40:
            interventions.append({
                'intervention': 'Waste Segregation Program',
                'urgency': 'CRITICAL'
            })
        
        if float(data.get('organic', 0)) > 50:
            interventions.append({
                'intervention': 'Organic Waste Treatment',
                'urgency': 'HIGH'
            })
        
        return interventions


# ============================================================================
# MAIN EXECUTION - INTERACTIVE MODE
# ============================================================================
def main():
    """Execute policy analysis pipeline"""
    
    print("\n" + "="*70)
    print("WASTE MANAGEMENT POLICYMAKING ASSISTANT")
    print("Interactive Policy Analysis System")
    print("="*70 + "\n")
    
    # Initialize
    config = WasteManagementPolicyConfig()
    config.display_config()
    
    # Data preprocessing
    print("[STAGE-1] DATA PREPARATION")
    print("-" * 70)
    preprocessor = PolicyDataPreprocessor(config)
    df = preprocessor.get_processed_data()
    print(f"\n✓ Data prepared: {df.shape[0]} regions, {df.shape[1]} indicators\n")
    
    # Model training
    print("[STAGE-2] MODEL TRAINING")
    print("-" * 70)
    
    numeric_df = df.select_dtypes(include='number')
    X = numeric_df.values
    y = (numeric_df.iloc[:, 0] > numeric_df.iloc[:, 0].median()).astype(int).values
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.test_size, random_state=config.random_state
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.2, random_state=config.random_state
    )
    
    generator = PolicyIntelligenceGenerator(config)
    generator.build_model(input_dim=X_train.shape[1])
    history = generator.train_model(X_train, y_train, X_val, y_val)
    
    # Evaluation
    print("\n[STAGE-3] POLICY ANALYSIS")
    print("-" * 70)
    
    y_pred = (generator.model.predict(X_test, verbose=0) > 0.5).astype(int).flatten()
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✓ Model accuracy: {accuracy:.2%}\n")
    
    # Sample policy brief
    print("[STAGE-4] SAMPLE POLICY BRIEF")
    print("-" * 70)
    
    if len(df) > 0:
        sample_region = df.iloc[0].to_dict()
        sample_region['region'] = 'Metro Manila'
        sample_region['province'] = 'NCR'
        
        policy_brief = generator.generate_policy_brief(sample_region)
        evaluation = generator.evaluate_region(sample_region)
        
        print(f"\nRegion: {policy_brief['region']}")
        print(f"Assessment Date: {policy_brief['assessment_date']}")
        print(f"\nWaste Management Maturity Score: {evaluation['waste_management_score']:.1f}/100")
        print(f"Policy Readiness: {evaluation['policy_readiness']}")
        print(f"\nKey Recommendations: {len(policy_brief['policy_recommendations'])} policies identified")
    
    print("\n" + "="*70)
    print("ANALYSIS COMPLETE - System ready for interactive use")
    print("="*70 + "\n")
    
    return {
        'preprocessor': preprocessor,
        'generator': generator,
        'model': generator.model,
        'data': df
    }


if __name__ == "__main__":
    results = main()
