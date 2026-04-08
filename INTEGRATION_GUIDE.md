# Waste Management Policy Analysis System - React Integration

## 🎯 Overview

This is an **interactive, policy-maker-focused** waste management analysis platform that combines:

- **Backend**: Flask API with ML-powered policy recommendations
- **Frontend**: React.js dashboard with intuitive policy analysis interface
- **Model**: Deep learning model for waste management policy assessment
- **Terminology**: Industry-standard environmental policy language

Users (policymakers, regulatory officials, waste management professionals) can:
- Analyze regional waste management profiles
- Get AI-powered policy recommendations
- Assess waste composition and segregation needs
- Evaluate infrastructure capacity
- Generate comprehensive policy reports

---

## 🏗️ Architecture

### System Components

```
┌──────────────────────────────────────────────────────────────┐
│                    USER (React Dashboard                     │
│          Interactive Policy Analysis Interface              │
└──────────────────────────┬─────────────────────────────────┘
                           │
                       HTTP/JSON
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              Flask REST API (Python/Backend)                 │
│  - /api/analyze/regional-profile                            │
│  - /api/analyze/composition-assessment                      │
│  - /api/analyze/infrastructure-assessment                   │
│  - /api/generate/policy-report                              │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│         ML Model (TensorFlow/Keras)                          │
│     Feature Extraction → Pattern Recognition → 
│     Policy Synthesis                                         │
└──────────────────────────┬─────────────────────────────────┘
                           │
                           ▼
                    Regional Waste Data
```

---

## 📁 File Structure

### Backend Files (Python)

```
├── api_server.py              ✨ Flask API with all endpoints
├── policy_model.py            ✨ Enhanced ML model with policymaker terms
├── Assistant Prototype        Original Python script
├── requirements.txt           Python dependencies
├── Dockerfile                 Docker image for backend
└── .env                       Environment configuration
```

### Frontend Files (React/TypeScript)

```
├── Non-Biodigradable Policymaking Assistant_UserInterface/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   └── PolicyAnalysisPanel.tsx      ✨ NEW: Main UI component
│   │   │   └── services/
│   │   │       └── policyAPI.ts                 ✨ NEW: API client
│   │   └── main.tsx
│   ├── Dockerfile                               ✨ NEW: Docker for frontend
│   ├── .env                                     ✨ NEW: Frontend env config
│   └── vite.config.ts
```

---

## 🚀 Quick Start

### Option 1: Manual Setup (Recommended for Development)

#### Backend Setup

```bash
# Navigate to project root
cd Waste-Management-Policymaking-Assistant

# Create virtual environment
python -m venv venv

# Activate
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run API server
python api_server.py
# ✓ Server running at http://localhost:5000
```

#### Frontend Setup

```bash
# In another terminal, navigate to UI folder
cd Non-Biodigradable\ Policymaking\ Assistant_UserInterface

# Install dependencies
pnpm install

# Run dev server
pnpm dev
# ✓ App running at http://localhost:5173
```

#### Access Application

Open http://localhost:5173 in your browser

---

### Option 2: Docker (Production-Ready)

```bash
# Build and run with docker-compose
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## 💡 Using the System

### 1. Regional Profile Analysis

**Input:**
- Region name and province
- Waste metrics (density, urbanization, MSW generation)
- Current sorting rate
- Fee collection mechanism

**Output:**
- Waste Management Maturity Score (0-100)
- Policy readiness level
- Critical findings
- Specific policy recommendations with priority levels

**Example:**
```json
{
  "region": "Metro Manila",
  "wden": 350000,        // High waste density
  "urb": 85,             // Highly urbanized
  "sor": 35,             // Low sorting rate (problem!)
  "msw": 5000
}

// Returns policy recommendations for:
// - Enhanced segregation programs
// - Infrastructure scaling
// - Community engagement initiatives
```

### 2. Waste Composition Assessment

**Input:**
- Percentage breakdown by waste type
  - Organic, Paper, Glass, Plastic, Metals, Others

**Output:**
- Recommended waste segregation streams
- Collection frequency for each stream
- Required treatment facilities
- Color-coding suggestions
- Education focus areas

### 3. Infrastructure Assessment

**Input:**
- Collection coverage %
- Number of existing facilities
- Landfill and treatment capacity

**Output:**
- Infrastructure adequacy score
- Identified gaps
- Specific improvement recommendations
- Priority interventions

### 4. Policy Report Generation

**Input:**
- Complete regional data

**Output:**
- Executive summary
- Key findings and implications
- Comprehensive policy recommendations
- 3-phase implementation roadmap
- Downloadable JSON report

---

## 🎓 Policymaker Terminology

The system uses standard environmental policy terms:

| Term | Full Form | Meaning |
|------|-----------|---------|
| **PAYT** | Pay-As-You-Throw | Fee system based on waste volume |
| **MRF** | Material Recovery Facility | Waste segregation and sorting plant |
| **EPR** | Extended Producer Responsibility | Producer responsibility for end-of-life |
| **SOR** | Source Segregation Rate | % of waste properly sorted at source |
| **MSTS** | Multi-Stream Collection System | Separate collection for different waste types |
| **OWDM** | Organic Waste Diversion Mandate | Policy requiring organic waste diversion |
| **MSW** | Municipal Solid Waste | Total waste generated by city/region |
| **Waste Density** | kg/km² | Waste generated per unit area |

---

## 🔌 API Endpoints

### Health & Status
```bash
GET /api/health
GET /api/status
```

### Analysis Endpoints
```bash
POST /api/analyze/regional-profile
POST /api/analyze/composition-assessment
POST /api/analyze/infrastructure-assessment
POST /api/analyze/policy-effectiveness
```

### Report Endpoints
```bash
POST /api/generate/policy-report
POST /api/save-report
GET /api/analysis-history
```

### Full API Documentation
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed endpoint specifications

---

## 🔧 Configuration

### Environment Variables

**.env (Backend)**
```
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
CORS_ORIGINS=http://localhost:5173
```

**.env (Frontend)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## 📊 Data Flow

```
User Input (React Form)
    ↓
PolicyAnalysisPanel Component
    ↓
policyAPI Service (TypeScript/Axios)
    ↓
Flask API Endpoint (Python)
    ↓
Policy Model Processing
    ↓
ML Model Inference
    ↓
Policy Recommendation Generation
    ↓
JSON Response
    ↓
React Component Display
    ↓
User Views Results
```

---

## 🎨 React Component Hierarchy

```
App
└── PolicyAnalysisPanel
    ├── Tab 1: Regional Profile Analysis
    │   ├── RegionalDataInputCard
    │   └── AnalysisResultsCard
    ├── Tab 2: Waste Composition
    │   ├── CompositionInputForm
    │   └── SegregationPolicyResults
    ├── Tab 3: Infrastructure Assessment
    │   ├── InfrastructureMetricsForm
    │   └── AssessmentResultsCard
    └── Tab 4: Policy Report
        └── ReportDisplay (with Download/Save options)
```

---

## 🧠 ML Model Features

The TensorFlow/Keras model includes:

1. **Feature Extraction Layer** (64 neurons)
   - Processes waste management metrics

2. **Pattern Recognition Layers** (32, 16 neurons)
   - Identifies policy-relevant patterns
   - Batch normalization for stability

3. **Policy Synthesis Output** (1 neuron, sigmoid)
   - Predicts policy readiness score

The model is trained on historical waste management data to predict which policy interventions will be most effective for each region.

---

## ✅ Features Implemented

- [x] Flask API server with 10+ endpoints
- [x] React interactive dashboard
- [x] Regional profile analysis with scoring
- [x] Waste composition assessment
- [x] Infrastructure evaluation
- [x] Policy recommendation engine
- [x] Report generation and export
- [x] Policymaker-focused terminology
- [x] Docker containerization
- [x] Environment configuration
- [x] Type-safe API client (TypeScript)
- [x] Error handling and validation
- [x] CORS configuration
- [x] Database-ready architecture

---

## 🟢 Ready for Development

### Backend
- ✅ API fully functional
- ✅ ML model integrated
- ✅ Policy recommendation engine
- ✅ Error handling
- ✅ CORS enabled for React

### Frontend
- ✅ Interactive dashboard created
- ✅ API integration complete
- ✅ All analysis features connected
- ✅ Report export functionality
- ✅ Material-UI components

---

## 🔍 Troubleshooting

**Backend Issues:**
- Ensure Python 3.11+ installed
- Check data file exists: `public_data_waste_fee.csv`
- Port 5000 available

**Frontend Issues:**
- Verify backend running before starting frontend
- Check .env has correct API_URL
- Clear node_modules and reinstall if issues persist

**Connection Issues:**
- Backend: `curl http://localhost:5000/api/health`
- Frontend: Check browser console for errors
- Verify CORS settings in .env

---

## 📚 Additional Resources

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- [api_server.py](./api_server.py) - Backend API source
- [policy_model.py](./policy_model.py) - ML model source
- [PolicyAnalysisPanel.tsx](./Non-Biodigradable%20Policymaking%20Assistant_UserInterface/src/app/components/PolicyAnalysisPanel.tsx) - React component
- [policyAPI.ts](./Non-Biodigradable%20Policymaking%20Assistant_UserInterface/src/app/services/policyAPI.ts) - API client

---

## 🎯 Next Steps

1. **Start the backend**: `python api_server.py`
2. **Start the frontend**: `pnpm dev`
3. **Open browser**: http://localhost:5173
4. **Try regional analysis**: Enter region data and click "Analyze"
5. **View recommendations**: See AI-powered policy suggestions
6. **Export reports**: Download analysis as JSON

---

## 📝 License

This system is developed for waste management policy analysis in the Philippines.

**System Created:** April 2026
**Status:** ✅ Production Ready
