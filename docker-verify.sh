#!/bin/bash
# Docker Verification Script
# Verifies all Docker configurations and services are working

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker Configuration Verification${NC}"
echo -e "${BLUE}========================================\n${NC}"

# Counter
PASSED=0
FAILED=0

# Test function
test_command() {
    local name=$1
    local command=$2
    
    echo -n "Testing $name... "
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
    fi
}

# Docker checks
echo -e "${YELLOW}[1/4] Docker & Compose Checks${NC}"
test_command "Docker installed" "docker --version"
test_command "Docker running" "docker ps"
test_command "Docker Compose installed" "docker-compose --version"

# Configuration file checks
echo -e "\n${YELLOW}[2/4] Configuration File Checks${NC}"
test_command "docker-compose.yml exists" "test -f docker-compose.yml"
test_command "Dockerfile exists" "test -f Dockerfile"
test_command ".dockerignore exists" "test -f .dockerignore"
test_command ".env.docker exists" "test -f .env.docker"
test_command "Frontend Dockerfile exists" "test -f 'Non-Biodigradable Policymaking Assistant_UserInterface/Dockerfile'"

# Data file checks
echo -e "\n${YELLOW}[3/4] Data File Checks${NC}"
test_command "CSV data file exists" "test -f public_data_waste_fee.csv"
test_command "policy_model.py exists" "test -f policy_model.py"
test_command "api_server.py exists" "test -f api_server.py"

# Port availability checks
echo -e "\n${YELLOW}[4/4] Port Availability Checks${NC}"

# Check if ports are available (or already in use by our containers)
echo -n "Checking port 5000... "
if netstat -tuln 2>/dev/null | grep -q :5000 || docker ps -q | xargs docker port 2>/dev/null | grep -q 5000; then
    echo -e "${YELLOW}⚠ In use (may be okay if it's our container)${NC}"
else
    echo -e "${GREEN}✓ Available${NC}"
    ((PASSED++))
fi

echo -n "Checking port 5173... "
if netstat -tuln 2>/dev/null | grep -q :5173 || docker ps -q | xargs docker port 2>/dev/null | grep -q 5173; then
    echo -e "${YELLOW}⚠ In use (may be okay if it's our container)${NC}"
else
    echo -e "${GREEN}✓ Available${NC}"
    ((PASSED++))
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is ready to run.${NC}\n"
    echo -e "${BLUE}To start services, run:${NC}"
    echo -e "  ${BLUE}docker-compose up -d${NC}\n"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix issues above.${NC}\n"
    exit 1
fi
