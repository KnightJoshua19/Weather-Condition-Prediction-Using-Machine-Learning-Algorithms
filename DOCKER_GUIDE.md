# Docker Configuration Guide

## Overview

This guide explains how to deploy the Waste Management Policy System using Docker and Docker Compose.

---

## Prerequisites

- **Docker**: 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ ([Install Compose](https://docs.docker.com/compose/install/))
- **Git**: For cloning the repository
- **At least 4GB RAM**: For running both containers

---

## Quick Start

### Windows Users (Easiest)

```bash
# Double-click the file:
docker-run.bat

# Or run in PowerShell:
./docker-run.bat
```

### macOS/Linux Users

```bash
# Make script executable
chmod +x docker-run.sh

# Run the setup
./docker-run.sh
```

### Manual Setup

```bash
# Check Docker is installed
docker --version
docker-compose --version

# Build and start services
docker-compose up -d

# Wait for ~30 seconds for services to initialize

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## File Descriptions

### docker-compose.yml
- **Primary configuration** for development/local testing
- Maps ports 5000 (backend) and 5173 (frontend)
- Uses local volumes for easy development

### docker-compose.prod.yml
- **Production-ready** configuration
- Enhanced healthchecks
- Named volumes for data persistence
- Environment optimizations

### Dockerfile (root)
- Backend Python/Flask API container
- Installed dependencies: Python 3.11, TensorFlow, scikit-learn
- Exposes port 5000

### Non-Biodigradable Policymaking Assistant_UserInterface/Dockerfile
- Frontend React container
- Built with Node 18
- Exposes port 5173

### .dockerignore
- Optimizes Docker builds by excluding unnecessary files
- Prevents large dependencies from being copied

---

## Service Configuration

### Backend Service (waste-management-api)
- **Port**: 5000
- **Container**: `waste-management-api`
- **Health Check**: `/api/health` endpoint
- **Environment**:
  - `FLASK_ENV`: production/development
  - `FLASK_HOST`: 0.0.0.0 (Docker-compatible)
  - `FLASK_PORT`: 5000
  - `CORS_ORIGINS`: http://localhost:5173,http://frontend:5173

### Frontend Service (waste-management-ui)
- **Port**: 5173
- **Container**: `waste-management-ui`
- **Environment**:
  - `REACT_APP_API_URL`: http://backend:5000/api
  - `REACT_APP_ENV`: production

### Network
- **Name**: `waste-management-network`
- **Driver**: bridge
- **Purpose**: Enables service-to-service communication

---

## Common Commands

```bash
# Start services in background
docker-compose up -d

# Start with foreground logs
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs -f  # Follow logs

# Restart services
docker-compose restart
docker-compose restart backend
docker-compose restart frontend

# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend bash

# View service configuration
docker-compose config

# Build only (without starting)
docker-compose build

# Remove all containers and volumes
docker-compose down -v

# View resource usage
docker stats
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check for port conflicts
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# macOS/Linux:
lsof -i :5000
lsof -i :5173

# Kill conflicting processes
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

### Backend Service Failing

```bash
# Check logs
docker-compose logs backend

# Access container shell
docker-compose exec backend bash

# Check file permissions
docker-compose exec backend ls -la

# Verify data file exists
docker-compose exec backend cat /app/public_data_waste_fee.csv | head -5
```

### Frontend Not Connecting

```bash
# Check API URL
docker-compose exec frontend cat /app/.env | grep REACT_APP_API_URL

# Test API connectivity from frontend
docker-compose exec frontend curl http://backend:5000/api/health

# Check browser console for CORS errors
# Browser DevTools → Console → Network tab
```

### Persistent Storage Issues

```bash
# Check volumes
docker volume ls | grep waste

# Inspect volume
docker volume inspect waste-management-policymaking-assistant_backend-data

# Remove volume and recreate
docker-compose down -v
docker-compose up -d
```

---

## Performance Optimization

### Reduce Build Time
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1
docker-compose build --no-cache
```

### Reduce Image Size
```bash
# Multi-stage builds are already used
# View image sizes
docker images | grep waste-management
```

### Monitor Resource Usage
```bash
# Real-time stats
docker stats

# Memory usage
docker-compose exec backend free -h
```

---

## Production Deployment

### Using docker-compose.prod.yml
```bash
# Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d

# Check services
docker-compose -f docker-compose.prod.yml ps
```

### Environment Variables for Production
```bash
# Create .env.prod file
FLASK_ENV=production
FLASK_DEBUG=False
CORS_ORIGINS=your-production-domain.com
DATABASE_URL=postgresql://user:pass@db:5432/waste_policy
```

### Backup Data Volumes
```bash
# Backup
docker run --rm -v waste-management-policymaking-assistant_backend-data:/data \
  -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore
docker run --rm -v waste-management-policymaking-assistant_backend-data:/data \
  -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

---

## Security Considerations

1. **Change Default Passwords**: Update any hardcoded credentials
2. **Use HTTPS**: In production, use a reverse proxy (nginx)
3. **Restrict CORS**: Set specific domains in `CORS_ORIGINS`
4. **Update Base Images**: Regularly pull new base images
5. **Scan for Vulnerabilities**: Use `docker scan` or third-party tools

```bash
# Scan for vulnerabilities
docker scan waste-management-api
docker scan waste-management-ui
```

---

## Logs and Monitoring

### View Application Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Last 100 lines
docker-compose logs --tail=100

# Follow in real-time
docker-compose logs -f
```

### Access Container Shell
```bash
# Backend Python shell
docker-compose exec backend bash

# Frontend Node shell
docker-compose exec frontend ash

# Run Python scripts
docker-compose exec backend python script.py
```

---

## Updating Services

```bash
# Update images
docker-compose pull

# Rebuild from source
docker-compose build --no-cache

# Restart with new images
docker-compose down
docker-compose up -d
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Healthchecks](https://docs.docker.com/engine/reference/builder/#healthcheck)

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review Docker documentation
3. Check Docker logs: `docker-compose logs`
4. Open an issue in the repository
