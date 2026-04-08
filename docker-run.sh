#!/bin/bash
# Docker Setup and Run Script for Waste Management Policy System

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Waste Management Policy System${NC}"
echo -e "${BLUE}Docker Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Docker
echo -e "${YELLOW}[1/5] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    exit 1
fi
DOCKER_VERSION=$(docker --version)
echo -e "${GREEN}✓ ${DOCKER_VERSION}${NC}"

# Check Docker Compose
echo -e "\n${YELLOW}[2/5] Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose.${NC}"
    exit 1
fi
COMPOSE_VERSION=$(docker-compose --version)
echo -e "${GREEN}✓ ${COMPOSE_VERSION}${NC}"

# Build images
echo -e "\n${YELLOW}[3/5] Building Docker images...${NC}"
docker-compose -f docker-compose.yml build
echo -e "${GREEN}✓ Images built successfully${NC}"

# Create directories for volumes
echo -e "\n${YELLOW}[4/5] Preparing directories...${NC}"
mkdir -p "The Output" logs data
echo -e "${GREEN}✓ Directories ready${NC}"

# Start services
echo -e "\n${YELLOW}[5/5] Starting services...${NC}"
docker-compose -f docker-compose.yml up -d
echo -e "${GREEN}✓ Services started${NC}"

# Wait for services
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check health
echo -e "\n${YELLOW}Checking service health...${NC}"

if docker-compose -f docker-compose.yml ps | grep -q "waste-management-api.*healthy"; then
    echo -e "${GREEN}✓ Backend API is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend API still initializing (this may take a moment)${NC}"
fi

# Display service URLs
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Services available at:${NC}"
echo -e "  Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:5000${NC}"
echo -e "  API:       ${BLUE}http://localhost:5000/api${NC}"

echo -e "\n${BLUE}Useful commands:${NC}"
echo -e "  View logs:     ${BLUE}docker-compose logs -f${NC}"
echo -e "  Stop services: ${BLUE}docker-compose down${NC}"
echo -e "  Restart:       ${BLUE}docker-compose restart${NC}"
echo -e "  Shell access:  ${BLUE}docker-compose exec backend bash${NC}\n"
