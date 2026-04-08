# Waste Management Policy ML System - Complete Setup Guide

## Overview

This system provides an interactive platform for waste management policymakers to analyze regional data and generate evidence-based policy recommendations using machine learning.

### Components:
- **Backend**: Flask API with ML model (Python)
- **Frontend**: React.js interactive dashboard
- **Data**: Regional waste management metrics
- **Model**: Neural network for policy readiness assessment

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│         React.js Frontend (Port 5173/3000)              │
│   Policy Analysis Dashboard with Interactive Forms      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/JSON
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Flask API Server (Port 5000)                    │
│   RESTful endpoints for policy analysis                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│   Policy ML Model (TensorFlow/Keras)                    │
│   - Regional Profile Analysis                           │
│   - Waste Composition Assessment                        │
│   - Infrastructure Evaluation                           │
│   - Policy Recommendations                              │
└─────────────────────────────────────────────────────────┘
```

---

## 1. BACKEND SETUP (Python/Flask)

### Prerequisites
- Python 3.11+
- pip or conda
- Virtual environment (recommended)

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd Waste-Management-Policymaking-Assistant

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Create .env file (already provided)
# Edit .env with your settings if needed
# Key settings:
# - FLASK_HOST=127.0.0.1
# - FLASK_PORT=5000
# - DATA_PATH=./public_data_waste_fee.csv
```

### Step 3: Run Backend Server

```bash
# Activate virtual environment first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run Flask server
python api_server.py

# Expected output:
# [API] Initializing ML model...
# [API] Model initialized successfully
# * Running on http://127.0.0.1:5000
```

### Testing Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Get model status
curl http://localhost:5000/api/status

# Test regional analysis
curl -X POST http://localhost:5000/api/analyze/regional-profile \
  -H "Content-Type: application/json" \
  -d '{
    "region": "Metro Manila",
    "province": "NCR",
    "wden": 350000,
    "urb": 85,
    "msw": 5000,
    "sor": 35,
    "fee": "STANDARD",
    "organic": 55,
    "paper": 15,
    "glass": 8,
    "plastic": 12
  }'
```

---

## 2. FRONTEND SETUP (React.js)

### Prerequisites
- Node.js 16+ or pnpm
- npm or pnpm package manager

### Step 1: Install Dependencies

```bash
# Navigate to frontend directory
cd Non-Biodigradable\ Policymaking\ Assistant_UserInterface

# Install dependencies using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### Step 2: Configure Frontend Environment

```bash
# Create .env file in frontend root
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_ENV=development
```

### Step 3: Update App Configuration

In `src/app/App.tsx`, import the PolicyAnalysisPanel component:

```typescript
import PolicyAnalysisPanel from './components/PolicyAnalysisPanel';

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box sx={{ flex: 1 }}>
        <PolicyAnalysisPanel />
      </Box>
    </Box>
  );
}

export default App;
```

### Step 4: Start Development Server

```bash
# Start Vite development server
pnpm dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Step 5: Access Application

Open browser and navigate to:
```
http://localhost:5173/
```

---

## 3. API ENDPOINTS REFERENCE

All endpoints return JSON responses and use policymaker-focused terminology.

### Health & Status

```bash
GET /api/health
# Returns: { status: 'healthy', timestamp: ISO-8601, model_loaded: boolean }

GET /api/status
# Returns: { status: 'ready', model_name, parameters, timestamp }
```

### Regional Profile Analysis

```bash
POST /api/analyze/regional-profile
# Input: RegionalData object with waste metrics
# Output: PolicyAnalysis with recommendations and scores

Request body:
{
  "region": "Region Name",
  "province": "Province",
  "wden": 300000,            # Waste density kg/km²
  "urb": 75,                 # Urbanization %
  "msw": 5000,               # Municipal solid waste tons/year
  "sor": 40,                 # Source segregation rate %
  "fee": "PAYT",             # Fee type
  "organic": 55,             # Organic waste %
  "paper": 15,               # Paper %
  "glass": 8,                # Glass %
  "plastic": 12              # Plastic %
}

Response:
{
  "region": "Region Name",
  "metrics": {...},
  "recommendations": [
    {
      "category": "...",
      "severity": "critical|moderate|positive",
      "finding": "...",
      "recommendation": "...",
      "policy_instrument": "..."
    }
  ],
  "policy_readiness_score": 65.5,
  "timestamp": "ISO-8601"
}
```

### Waste Composition Analysis

```bash
POST /api/analyze/composition-assessment
# Input: Waste composition percentages
# Output: Segregation policy recommendations

Request body:
{
  "organic": 50,
  "paper": 15,
  "glass": 8,
  "plastic": 15,
  "metals": 5,
  "others": 7
}

Response:
{
  "composition": {...},
  "segregation_policy": {
    "recommended_streams": [...],
    "collection_frequency": {...},
    "facility_requirements": [...]
  },
  "policy_priority": "organic-first|plastic-reduction|balanced"
}
```

### Infrastructure Assessment

```bash
POST /api/analyze/infrastructure-assessment
# Input: Current infrastructure metrics
# Output: Infrastructure improvement recommendations

Request body:
{
  "waste_density": 300000,
  "collection_coverage": 85,
  "recycling_facilities": 3,
  "landfill_capacity": 500,
  "treatment_capacity": 60
}

Response:
{
  "metrics": {...},
  "recommendations": [...],
  "infrastructure_score": 72.5
}
```

### Generate Policy Report

```bash
POST /api/generate/policy-report
# Input: Complete regional data
# Output: Comprehensive policy report

Response:
{
  "region": "...",
  "generated_at": "ISO-8601",
  "executive_summary": "...",
  "regional_profile": {...},
  "policy_recommendations": [...],
  "priority_actions": [...],
  "implementation_timeline": {...}
}
```

### Save Report

```bash
POST /api/save-report
# Input: Report data
# Output: Save confirmation with ID

Response:
{
  "success": true,
  "report_id": "report_1234567890.1234",
  "saved_at": "ISO-8601"
}
```

---

## 4. RUNNING WITH DOCKER (Optional)

### Build Docker Image

```bash
# Build from Dockerfile
docker build -t waste-management-api:latest .
```

### Run Docker Container

```bash
# Run with port mapping
docker run -p 5000:5000 \
  -e FLASK_ENV=production \
  waste-management-api:latest
```

---

## 5. POLICYMAKER TERMINOLOGY USED

The system uses standard environmental policy terminology:

- **PAYT**: Pay-As-You-Throw fee system
- **MRF**: Material Recovery Facility
- **MSW**: Municipal Solid Waste
- **EPR**: Extended Producer Responsibility
- **SOR**: Source Segregation Rate
- **MSTS**: Multi-Stream Collection System
- **OWDM**: Organic Waste Diversion Mandate

---

## 6. INTERACTIVE FEATURES

### Regional Profile Analysis
- Input waste metrics for any region
- Get policy readiness score (0-100)
- Receive specific policy recommendations
- View implementation roadmap

### Waste Composition Assessment
- Analyze waste stream breakdown
- Get segregation policy recommendations
- View required treatment facilities
- Receive collection frequency suggestions

### Infrastructure Evaluation
- Assess current infrastructure capacity
- Identify critical gaps
- Get improvement recommendations
- Calculate infrastructure adequacy score

### Policy Report Generation
- Create comprehensive assessment reports
- Export as JSON or PDF
- Save for future reference
- Track historical analyses

---

## 7. TROUBLESHOOTING

### Backend Issues

**Port already in use**
```bash
# Change port in .env or find process using port
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

**Model initialization fails**
```bash
# Ensure data file exists:
# public_data_waste_fee.csv must be in project root

# Verify Python version:
python --version  # Should be 3.11+
```

**CORS errors**
- Verify CORS_ORIGINS in .env includes frontend URL
- Check backend is running on correct port

### Frontend Issues

**API connection error**
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check REACT_APP_API_URL in .env
- Check browser console for errors

**Missing dependencies**
```bash
pnpm install  # Reinstall all dependencies
pnpm update   # Update to latest versions
```

---

## 8. DEPLOYMENT CHECKLIST

- [ ] Backend server running and responding
- [ ] Frontend connects to API successfully
- [ ] Regional analysis returns policy recommendations
- [ ] Composition analysis works correctly
- [ ] Infrastructure assessment functioning
- [ ] Reports can be saved and downloaded
- [ ] Error handling working properly
- [ ] No console errors in browser
- [ ] Performance acceptable for large datasets

---

## 9.PROJECT STRUCTURE

```
Waste-Management-Policymaking-Assistant/
├── api_server.py                      # Flask API server
├── policy_model.py                    # Enhanced ML model
├── Assistant Prototype                # Original Python script
├── public_data_waste_fee.csv          # Input data
├── requirements.txt                   # Python dependencies
├── Dockerfile                         # Docker configuration
├── .env                               # Environment variables
│
├── Non-Biodigradable Policymaking Assistant_UserInterface/
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx               # Main component
│   │   │   ├── components/
│   │   │   │   └── PolicyAnalysisPanel.tsx  # Main UI component
│   │   │   └── services/
│   │   │       └── policyAPI.ts      # API service layer
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── The Output/                        # Generated reports
```

---

## Support & Documentation

For detailed API documentation, see the inline comments in:
- `api_server.py` - Flask API endpoints
- `policy_model.py` - Machine learning model
- `src/app/services/policyAPI.ts` - Frontend API client

---

## License

This project is developed for waste management policy analysis in the Philippines.
