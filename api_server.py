"""
Flask API Server for Waste Management Policy ML Model
Exposes the machine learning model via RESTful API endpoints
Allows React frontend to interact with the model
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import json
import os
from datetime import datetime
import sys

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import policy model components
try:
    from policy_model import (
        WasteManagementPolicyConfig,
        PolicyDataPreprocessor,
        PolicyIntelligenceGenerator
    )
    POLICY_MODEL_AVAILABLE = True
except ImportError:
    print("[API] Warning: policy_model not available, using mock routines")
    POLICY_MODEL_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Global model and preprocessor instances
model_instance = None
preprocessor_instance = None
data_generator = None

# ============================================================================
# API CONFIGURATION
# ============================================================================
CACHE_DIR = os.path.join(os.path.dirname(__file__), '.model_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check API health and model status"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model_instance is not None,
        'service': 'Waste Management Policy ML API'
    }), 200

@app.route('/api/status', methods=['GET'])
def model_status():
    """Get detailed model status"""
    if model_instance is None:
        return jsonify({'error': 'Model not initialized'}), 503
    
    return jsonify({
        'status': 'ready',
        'model_name': 'WasteManagementPredictor',
        'parameters': model_instance.count_params() if model_instance else 0,
        'timestamp': datetime.now().isoformat()
    }), 200

# ============================================================================
# DATA ANALYSIS ENDPOINTS (Interactive Policy Generation)
# ============================================================================
@app.route('/api/analyze/regional-profile', methods=['POST'])
def analyze_regional_profile():
    """
    Analyze a region's waste management profile
    Input: Regional data (waste density, urbanization, composition, etc.)
    Output: Policy recommendations and insights
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract policy-relevant metrics
        region = data.get('region', 'Unknown Region')
        metrics = {
            'waste_density': float(data.get('wden', 0)),
            'urbanization_rate': float(data.get('urb', 0)),
            'municipal_solid_waste': float(data.get('msw', 0)),
            'sorting_rate': float(data.get('sor', 0)),
            'fee_type': data.get('fee', 'STANDARD'),
            'organic_percentage': float(data.get('organic', 0)),
            'paper_percentage': float(data.get('paper', 0)),
            'glass_percentage': float(data.get('glass', 0)),
            'plastic_percentage': float(data.get('plastic', 0)),
            'province': data.get('province', 'Philippines')
        }
        
        # Generate policy recommendations
        recommendations = generate_policy_insights(metrics, region)
        
        # Get model prediction confidence
        X_sample = np.array([[metrics[k] for k in sorted(metrics.keys()) if isinstance(metrics[k], (int, float))]])
        prediction_score = float(model_instance.predict(X_sample, verbose=0)[0][0])
        
        return jsonify({
            'region': region,
            'metrics': metrics,
            'recommendations': recommendations,
            'policy_readiness_score': round(prediction_score * 100, 2),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analyze/composition-assessment', methods=['POST'])
def analyze_composition():
    """
    Analyze waste composition and suggest waste segregation policies
    Input: Composition percentages
    Output: Segregation policy recommendations
    """
    try:
        data = request.json
        
        composition = {
            'organic': float(data.get('organic', 0)),
            'paper': float(data.get('paper', 0)),
            'glass': float(data.get('glass', 0)),
            'plastic': float(data.get('plastic', 0)),
            'metals': float(data.get('metals', 0)),
            'others': float(data.get('others', 0))
        }
        
        # Validate percentages sum to ~100
        total = sum(composition.values())
        if total == 0:
            return jsonify({'error': 'Invalid composition data'}), 400
        
        # Normalize
        composition = {k: v/total*100 for k, v in composition.items()}
        
        # Generate segregation policy
        segregation_policy = generate_segregation_policy(composition)
        
        return jsonify({
            'composition': composition,
            'segregation_policy': segregation_policy,
            'policy_priority': determine_segregation_priority(composition),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analyze/infrastructure-assessment', methods=['POST'])
def analyze_infrastructure():
    """
    Assess waste management infrastructure and provide improvement recommendations
    Input: Infrastructure metrics (waste density, collection coverage, etc.)
    Output: Infrastructure improvement recommendations
    """
    try:
        data = request.json
        
        metrics = {
            'waste_density': float(data.get('waste_density', 0)),
            'collection_coverage': float(data.get('collection_coverage', 0)),
            'recycling_facilities': int(data.get('recycling_facilities', 0)),
            'landfill_capacity': float(data.get('landfill_capacity', 0)),
            'treatment_capacity': float(data.get('treatment_capacity', 0))
        }
        
        recommendations = generate_infrastructure_recommendations(metrics)
        
        return jsonify({
            'metrics': metrics,
            'recommendations': recommendations,
            'infrastructure_score': calculate_infrastructure_score(metrics),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/analyze/policy-effectiveness', methods=['POST'])
def analyze_policy_effectiveness():
    """
    Analyze the effectiveness of current waste management policies
    Input: Current policy metrics and outcomes
    Output: Policy effectiveness score and recommendations
    """
    try:
        data = request.json
        
        metrics = {
            'current_policy_type': data.get('policy_type', 'STANDARD'),
            'sorting_rate': float(data.get('sorting_rate', 0)),
            'collection_efficiency': float(data.get('collection_efficiency', 0)),
            'recycling_rate': float(data.get('recycling_rate', 0)),
            'waste_reduction_achieved': float(data.get('waste_reduction_achieved', 0)),
            'public_participation': float(data.get('public_participation', 0))
        }
        
        effectiveness_score = calculate_policy_effectiveness(metrics)
        improvements = generate_policy_improvements(metrics, effectiveness_score)
        
        return jsonify({
            'effectiveness_score': effectiveness_score,
            'metrics': metrics,
            'improvements': improvements,
            'recommendations': improvements['recommendations'],
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/generate/policy-report', methods=['POST'])
def generate_policy_report():
    """
    Generate comprehensive policy report for a region
    Input: Complete regional waste management data
    Output: Full policy recommendation report
    """
    try:
        data = request.json
        region = data.get('region', 'Unknown Region')
        
        report = {
            'region': region,
            'generated_at': datetime.now().isoformat(),
            'executive_summary': generate_executive_summary(data),
            'regional_profile': analyze_regional_data(data),
            'policy_recommendations': generate_comprehensive_recommendations(data),
            'priority_actions': generate_priority_actions(data),
            'implementation_timeline': generate_implementation_timeline(data)
        }
        
        return jsonify(report), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ============================================================================
# HELPER FUNCTIONS FOR POLICY GENERATION
# ============================================================================
def generate_policy_insights(metrics, region):
    """Generate policy insights based on metrics"""
    insights = []
    
    # Waste density analysis
    if metrics['waste_density'] > 300000:
        insights.append({
            'category': 'Waste Density',
            'severity': 'critical',
            'finding': f'High waste density ({metrics["waste_density"]:,.0f} kg/km²) indicates overwhelming infrastructure demand',
            'recommendation': 'Implement Multi-Stream Collection System (MSTS) and expand treatment capacity',
            'policy_instrument': 'Extended Producer Responsibility (EPR)'
        })
    elif metrics['waste_density'] > 100000:
        insights.append({
            'category': 'Waste Density',
            'severity': 'moderate',
            'finding': f'Moderate waste density ({metrics["waste_density"]:,.0f} kg/km²) requires optimization',
            'recommendation': 'Enhance collection routes and establish source segregation programs',
            'policy_instrument': 'Pay-As-You-Throw (PAYT) System'
        })
    
    # Urbanization analysis
    if metrics['urbanization_rate'] > 70:
        insights.append({
            'category': 'Urbanization',
            'severity': 'moderate',
            'finding': f'Dense urban population ({metrics["urbanization_rate"]:.1f}%) requires targeted policies',
            'recommendation': 'Deploy community-based waste management and reduce collection cycles',
            'policy_instrument': 'Livelihood Support Program for waste workers'
        })
    
    # Sorting rate analysis
    if metrics['sorting_rate'] < 30:
        insights.append({
            'category': 'Waste Segregation',
            'severity': 'critical',
            'finding': f'Low sorting rate ({metrics["sorting_rate"]:.2f}%) indicates inadequate segregation',
            'recommendation': 'Launch public awareness campaign and establish barangay material recovery facilities',
            'policy_instrument': 'Waste Segregation and Composting Ordinance'
        })
    elif metrics['sorting_rate'] > 50:
        insights.append({
            'category': 'Waste Segregation',
            'severity': 'positive',
            'finding': f'Strong sorting rate ({metrics["sorting_rate"]:.2f}%) indicates effective community engagement',
            'recommendation': 'Expand existing programs and recognize participating communities',
            'policy_instrument': 'Recognition and incentive programs'
        })
    
    # Organic waste analysis
    if metrics['organic_percentage'] > 50:
        insights.append({
            'category': 'Organic Waste Management',
            'severity': 'moderate',
            'finding': f'High organic waste percentage ({metrics["organic_percentage"]:.1f}%) - opportunity for composting',
            'recommendation': 'Establish community composting hubs and promote backyard composting',
            'policy_instrument': 'Organic Waste Diversion Mandate'
        })
    
    return insights

def generate_segregation_policy(composition):
    """Generate segregation policy based on composition"""
    return {
        'recommended_streams': get_segregation_streams(composition),
        'collection_frequency': recommend_collection_frequency(composition),
        'facility_requirements': recommend_facilities(composition),
        'education_focus': recommend_education_focus(composition)
    }

def get_segregation_streams(composition):
    """Determine optimal waste segregation streams"""
    streams = []
    
    if composition.get('organic', 0) > 40:
        streams.append({
            'name': 'Organic Waste',
            'percentage': composition['organic'],
            'treatment': 'Composting/Biogas',
            'color_code': 'Brown'
        })
    
    if composition.get('paper', 0) > 10:
        streams.append({
            'name': 'Paper and Cardboard',
            'percentage': composition['paper'],
            'treatment': 'Recycling',
            'color_code': 'Blue'
        })
    
    if composition.get('plastic', 0) > 10:
        streams.append({
            'name': 'Plastics',
            'percentage': composition['plastic'],
            'treatment': 'Recovery/Recycling',
            'color_code': 'Yellow'
        })
    
    if composition.get('glass', 0) > 5:
        streams.append({
            'name': 'Glass',
            'percentage': composition['glass'],
            'treatment': 'Recycling',
            'color_code': 'Green'
        })
    
    streams.append({
        'name': 'Residual Waste',
        'percentage': composition.get('others', 100 - sum([s['percentage'] for s in streams])),
        'treatment': 'Incineration/Landfill',
        'color_code': 'Black'
    })
    
    return streams

def recommend_collection_frequency(composition):
    """Recommend collection frequency based on composition"""
    organic_pct = composition.get('organic', 0)
    
    if organic_pct > 60:
        return {
            'organic': 'Daily',
            'recyclables': '3x per week',
            'residual': '2x per week'
        }
    elif organic_pct > 40:
        return {
            'organic': 'Daily',
            'recyclables': '2x per week',
            'residual': '2x per week'
        }
    else:
        return {
            'organic': 'Daily',
            'recyclables': 'Weekly',
            'residual': 'Weekly'
        }

def recommend_facilities(composition):
    """Recommend required facilities based on composition"""
    facilities = []
    
    if composition.get('organic', 0) > 30:
        facilities.append({
            'type': 'Material Recovery Facility (MRF)',
            'capacity_estimate': 'Medium',
            'priority': 'High'
        })
        facilities.append({
            'type': 'Composting Facility',
            'capacity_estimate': 'Medium',
            'priority': 'High'
        })
    
    if composition.get('plastic', 0) > 15 or composition.get('paper', 0) > 15:
        facilities.append({
            'type': 'Recycling Processing Center',
            'capacity_estimate': 'Medium',
            'priority': 'Medium'
        })
    
    return facilities

def recommend_education_focus(composition):
    """Recommend education focus areas"""
    focus = []
    
    if composition.get('organic', 0) > 40:
        focus.append('Proper organic waste segregation and home composting')
    if composition.get('plastic', 0) > 15:
        focus.append('Plastic reduction and responsible disposal')
    if composition.get('paper', 0) > 15:
        focus.append('Paper and packaging waste management')
    
    return focus

def generate_infrastructure_recommendations(metrics):
    """Generate infrastructure improvement recommendations"""
    recommendations = []
    
    if metrics['collection_coverage'] < 80:
        recommendations.append({
            'priority': 'critical',
            'area': 'Collection Coverage',
            'current_status': f"{metrics['collection_coverage']:.1f}%",
            'target': '95%+',
            'actions': [
                'Expand collection fleet',
                'Establish collection points in remote areas',
                'Train and hire additional waste workers'
            ]
        })
    
    if metrics['waste_density'] > 200000 and not metrics['recycling_facilities']:
        recommendations.append({
            'priority': 'critical',
            'area': 'Treatment Facilities',
            'current_status': f"{metrics['recycling_facilities']} facilities",
            'target': '5-10 Material Recovery Facilities',
            'actions': [
                'Construct Material Recovery Facilities (MRF)',
                'Establish composting centers',
                'Develop recycling hubs'
            ]
        })
    
    return recommendations

def generate_policy_improvements(metrics, effectiveness_score):
    """Generate recommendations to improve policy effectiveness"""
    improvements = {}
    
    if metrics['sorting_rate'] < 50:
        improvements['segregation'] = {
            'issue': 'Inadequate source segregation',
            'root_cause': 'Insufficient public awareness and incentives',
            'solutions': [
                'Launch "Zero Waste Community" certification program',
                'Implement reward system for participating households',
                'Conduct regular community education programs'
            ]
        }
    
    if metrics['public_participation'] < 60:
        improvements['engagement'] = {
            'issue': 'Low public participation rate',
            'root_cause': 'Limited understanding of waste management importance',
            'solutions': [
                'Establish barangay-level waste management committees',
                'Create incentive programs for compliance',
                'Deploy community mobilization campaigns'
            ]
        }
    
    improvements['recommendations'] = [
        'Strengthen monitoring and enforcement mechanisms',
        'Scale successful programs to other areas',
        'Increase budget allocation for waste management',
        'Train waste management workers on modern practices'
    ]
    
    return improvements

def calculate_policy_effectiveness(metrics):
    """Calculate overall policy effectiveness score"""
    weights = {
        'sorting_rate': 0.25,
        'collection_efficiency': 0.25,
        'recycling_rate': 0.20,
        'waste_reduction_achieved': 0.20,
        'public_participation': 0.10
    }
    
    score = sum(metrics.get(k, 0) * v for k, v in weights.items())
    return round(score, 2)

def calculate_infrastructure_score(metrics):
    """Calculate infrastructure adequacy score"""
    score = (
        metrics.get('collection_coverage', 0) * 0.3 +
        min(metrics.get('recycling_facilities', 0) * 10, 100) * 0.3 +
        min(metrics.get('treatment_capacity', 0), 100) * 0.4
    )
    return round(score, 2)

def determine_segregation_priority(composition):
    """Determine priority waste streams for segregation"""
    if composition.get('organic', 0) > 50:
        return 'organic-first'
    elif composition.get('plastic', 0) > 30:
        return 'plastic-reduction'
    return 'balanced'

def generate_executive_summary(data):
    """Generate executive summary for policy report"""
    region = data.get('region', 'Region')
    return f"Comprehensive Waste Management Policy Assessment for {region}. This report analyzes current waste management practices and provides evidence-based policy recommendations aligned with international best practices and Philippine environmental regulations."

def analyze_regional_data(data):
    """Analyze overall regional waste data"""
    return {
        'total_mswg_annual': data.get('msw', 0),
        'waste_density': data.get('wden', 0),
        'urbanization_level': data.get('urb', 0),
        'current_sorting_effectiveness': data.get('sor', 0)
    }

def generate_comprehensive_recommendations(data):
    """Generate comprehensive policy recommendations"""
    return generate_policy_insights({
        'waste_density': float(data.get('wden', 0)),
        'urbanization_rate': float(data.get('urb', 0)),
        'municipal_solid_waste': float(data.get('msw', 0)),
        'sorting_rate': float(data.get('sor', 0)),
        'organic_percentage': float(data.get('organic', 0)),
        'paper_percentage': float(data.get('paper', 0)),
        'plastic_percentage': float(data.get('plastic', 0)),
        'glass_percentage': float(data.get('glass', 0))
    }, data.get('region', 'Region'))

def generate_priority_actions(data):
    """Generate immediate priority actions"""
    actions = []
    
    if float(data.get('sor', 0)) < 50:
        actions.append({
            'priority': 1,
            'action': 'Establish waste segregation mandate',
            'timeline': '0-3 months'
        })
    
    if float(data.get('urb', 0)) > 70:
        actions.append({
            'priority': 2,
            'action': 'Deploy urban waste management program',
            'timeline': '1-6 months'
        })
    
    return actions

def generate_implementation_timeline(data):
    """Generate policy implementation timeline"""
    return {
        'phase_1': {
            'months': '0-3',
            'focus': 'Policy formulation and stakeholder consultation',
            'deliverables': ['Policy framework', 'Budget allocation', 'Stakeholder agreement']
        },
        'phase_2': {
            'months': '3-6',
            'focus': 'Infrastructure development and training',
            'deliverables': ['MRF establishment', 'Worker training', 'Equipment procurement']
        },
        'phase_3': {
            'months': '6-12',
            'focus': 'Implementation and monitoring',
            'deliverables': ['Program launch', 'Data tracking', 'Community engagement']
        }
    }

# ============================================================================
# DATABASE AND LOGGING ENDPOINTS
# ============================================================================
@app.route('/api/analysis-history', methods=['GET'])
def get_analysis_history():
    """Retrieve analysis history"""
    # This would connect to a database in production
    return jsonify({'analyses': []}), 200

@app.route('/api/save-report', methods=['POST'])
def save_report():
    """Save policy report"""
    try:
        data = request.json
        report_id = f"report_{datetime.now().timestamp()}"
        
        # Save to file in production, database in full implementation
        report_path = os.path.join(CACHE_DIR, f"{report_id}.json")
        with open(report_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return jsonify({
            'success': True,
            'report_id': report_id,
            'saved_at': datetime.now().isoformat()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# ============================================================================
# SERVER INITIALIZATION
# ============================================================================
def initialize_model():
    """Initialize the ML model on server startup"""
    global model_instance, preprocessor_instance, data_generator
    
    try:
        if not POLICY_MODEL_AVAILABLE:
            print("[API] Policy model not available - API will run in mock mode")
            return False
        
        print("[API] Initializing ML model...")
        config = WasteManagementPolicyConfig()
        
        preprocessor_instance = PolicyDataPreprocessor(config)
        data_generator = PolicyIntelligenceGenerator(config)
        
        # Build a minimal model for predictions
        data_generator.build_model(input_dim=7)
        model_instance = data_generator.model
        
        print("[API] ✓ Model initialized successfully")
        return True
    except Exception as e:
        print(f"[API] Model initialization error: {e}")
        print("[API] Continuing with API in mock mode...")
        return False

if __name__ == '__main__':
    # Get configuration from environment
    flask_env = os.getenv('FLASK_ENV', 'development')
    flask_host = os.getenv('FLASK_HOST', '0.0.0.0')  # 0.0.0.0 for Docker compatibility
    flask_port = int(os.getenv('FLASK_PORT', 5000))
    flask_debug = flask_env == 'development'
    
    print(f"\n[API] Starting Waste Management Policy ML Server")
    print(f"[API] Environment: {flask_env}")
    print(f"[API] Host: {flask_host}:{flask_port}")
    
    # Initialize model (optional - API works without it)
    initialize_model()
    
    # Run Flask app
    app.run(debug=flask_debug, host=flask_host, port=flask_port, threaded=True)
