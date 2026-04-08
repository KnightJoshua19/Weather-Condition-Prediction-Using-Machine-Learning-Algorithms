# Quick Docker Setup Reference

## One-Command Setup

Choose your operating system:

### Windows
```bash
docker-run.bat
```

### macOS/Linux
```bash
chmod +x docker-run.sh
./docker-run.sh
```

### Manual (All OS)
```bash
docker-compose up -d
```

---

## Verify Setup

### Windows
```bash
docker-verify.bat
```

### macOS/Linux
```bash
chmod +x docker-verify.sh
./docker-verify.sh
```

---

## Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | React dashboard |
| Backend API | http://localhost:5000/api | ML API endpoints |
| Health Check | http://localhost:5000/api/health | API status |

---

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Access Container Shell
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh
```

### View Service Status
```bash
docker-compose ps
```

---

## Important Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Development configuration |
| `docker-compose.prod.yml` | Production configuration |
| `Dockerfile` | Backend image definition |
| `Non-Biodigradable Policymaking Assistant_UserInterface/Dockerfile` | Frontend image |
| `.env.docker` | Docker environment variables |
| `.dockerignore` | Excludes files from Docker build |

---

## Fixed Issues

✓ Frontend path with spaces in docker-compose.yml  
✓ Added curl to Dockerfile for healthchecks  
✓ Fixed api_server.py imports and host binding  
✓ Created .dockerignore for optimized builds  
✓ Added Docker-specific environment variables  
✓ Created setup and verification scripts  
✓ Added comprehensive Docker guide  

---

## Troubleshooting

**Services won't start?**
```bash
docker-compose logs
```

**Ports in use?**
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

**Need fresh start?**
```bash
docker-compose down -v
docker-compose up -d
```

---

## Configuration

### For Local Development
Use `.env` (default)

### For Docker Deployment
Use `.env.docker` with:
```bash
# Copy environment
cp .env.docker .env

# Or set in docker-compose.yml
docker-compose --env-file .env.docker up -d
```

---

## Next Steps

1. Run setup: `docker-run.bat` (Windows) or `./docker-run.sh` (macOS/Linux)
2. Wait for services to initialize (~30 seconds)
3. Open http://localhost:5173 in browser
4. Test the system

---

For detailed information, see `DOCKER_GUIDE.md`
