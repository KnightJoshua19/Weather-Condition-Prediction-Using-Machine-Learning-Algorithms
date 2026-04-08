#!/bin/bash
# Quick Start Script for Waste Management Policy System
# Run this script to set up and start both backend and frontend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Waste Management Policy Analysis System${NC}"
echo -e "${BLUE}Quick Start Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Python
echo -e "${YELLOW}[1/5] Checking Python installation...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo -e "${GREEN}✓ Python ${PYTHON_VERSION} found${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi

# Check Node.js
echo -e "\n${YELLOW}[2/5] Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi

# Setup Backend
echo -e "\n${YELLOW}[3/5] Setting up Backend...${NC}"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
else
    # Windows path
    source venv/Scripts/activate
fi

echo "Installing Python dependencies..."
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Setup Frontend
echo -e "\n${YELLOW}[4/5] Setting up Frontend...${NC}"
cd "Non-Biodigradable Policymaking Assistant_UserInterface"

if command -v pnpm &> /dev/null; then
    echo "Installing frontend dependencies with pnpm..."
    pnpm install -q
else
    echo "Installing frontend dependencies with npm..."
    npm install -q
fi

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}To start the system, run the following in separate terminals:${NC}\n"

echo -e "${YELLOW}Terminal 1 (Backend - Python API):${NC}"
echo -e "${BLUE}source venv/bin/activate${NC}"
echo -e "${BLUE}python api_server.py${NC}\n"

echo -e "${YELLOW}Terminal 2 (Frontend - React):${NC}"
echo -e "${BLUE}cd 'Non-Biodigradable Policymaking Assistant_UserInterface'${NC}"
echo -e "${BLUE}pnpm dev${NC}\n"

echo -e "${YELLOW}Then open your browser to:${NC}"
echo -e "${BLUE}http://localhost:5173${NC}\n"

echo -e "${BLUE}API will be available at:${NC}"
echo -e "${BLUE}http://localhost:5000/api${NC}\n"

echo -e "${GREEN}System is ready to use! 🚀${NC}"
