# Docker Setup Checklist

## Pre-Flight Checks

- [ ] Docker Desktop installed
- [ ] Docker Compose installed
- [ ] Project files extracted/cloned
- [ ] Terminal/PowerShell opened in project root

## Configuration Verification

- [ ] `.env` file exists
- [ ] `.env.docker` file exists
- [ ] `docker-compose.yml` exists
- [ ] `Dockerfile` exists
- [ ] `.dockerignore` exists
- [ ] `public_data_waste_fee.csv` exists
- [ ] `api_server.py` exists
- [ ] `policy_model.py` exists

## Environment Setup

- [ ] Backend Flask config correct (check `.env`)
- [ ] Frontend React config correct (check `Non-Biodigradable Policymaking Assistant_UserInterface/.env`)
- [ ] Port 5000 available (or set to different in `.env`)
- [ ] Port 5173 available (or set to different in `.env`)

## Verification

- [ ] Run `docker-verify.bat` (Windows) OR `./docker-verify.sh` (macOS/Linux)
- [ ] All checks pass ✓

## Docker Build

- [ ] Run `docker-compose build`
- [ ] No build errors
- [ ] Both images built successfully
  - [ ] Backend image
  - [ ] Frontend image

## Service Startup

- [ ] Run `docker-compose up -d`
- [ ] Wait 30 seconds for services to initialize
- [ ] Check `docker-compose ps`
  - [ ] Backend service: running
  - [ ] Frontend service: running

## Service Testing

### Backend API
- [ ] Test health: `curl http://localhost:5000/api/health`
- [ ] Response: `{"status": "healthy", ...}`
- [ ] Test status: `curl http://localhost:5000/api/status`
- [ ] Response: `{"status": "ready", ...}`

### Frontend React
- [ ] Open browser to http://localhost:5173
- [ ] Page loads (title visible)
- [ ] No console errors
- [ ] No network errors

### API-Frontend Communication
- [ ] Navigate to output view in React
- [ ] Try "Regional Profile Analysis"
- [ ] Success: recommendations display OR appropriate error message

## Data Integrity

- [ ] Data directory created: `The Output/`
- [ ] Data directory created: `logs/`
- [ ] Data directory created: `data/`
- [ ] CSV data file accessible: `public_data_waste_fee.csv`
- [ ] Model can initialize (check logs)

## Logs Review

```bash
# Check backend logs for errors
docker-compose logs backend | tail -20

# Check frontend logs
docker-compose logs frontend | tail -20

# Look for:
# - No exception/error messages
# - "Model initialized successfully"
# - "Frontend started"
```

- [ ] No error messages in logs
- [ ] Model initialized successfully
- [ ] Frontend started without issues

## Volume Persistence

- [ ] Create a test policy report in React
- [ ] Stop containers: `docker-compose down`
- [ ] Start containers: `docker-compose up -d`
- [ ] Data persists (if saved to volume)

## Performance Check

- [ ] Services respond quickly (< 2 seconds)
- [ ] CPU usage reasonable (< 50% per container)
- [ ] Memory usage acceptable (< 1GB per container)

Check with:
```bash
docker stats
```

## Cleanup & Maintenance

- [ ] Verified services can be stopped: `docker-compose down`
- [ ] Verified services can be restarted: `docker-compose up -d`
- [ ] Logs can be viewed: `docker-compose logs -f`
- [ ] No orphaned containers/volumes

## Production Readiness (Optional)

- [ ] Read `DOCKER_GUIDE.md` production section
- [ ] Considered security settings
- [ ] Reviewed environment variables for production
- [ ] Set strong credentials (not default)

## Documentation

- [ ] Read `DOCKER_QUICK_START.md`
- [ ] Read `DOCKER_GUIDE.md` for advanced topics
- [ ] Read `DOCKER_FIXES_SUMMARY.md` for what was fixed
- [ ] Understand common Docker commands

## Final System Test

### Complete Workflow Test

1. [ ] Access http://localhost:5173
2. [ ] Fill in regional data:
   - Region: "Test Region"
   - Province: "Test Province"
   - Waste Density: 250000
   - Urbanization: 75%
   - MSW: 5000
   - Sorting Rate: 40%
3. [ ] Click "Analyze Regional Profile"
4. [ ] Wait for results (should take 5-10 seconds)
5. [ ] Verify recommendations appear
6. [ ] Try waste composition analysis
7. [ ] Try infrastructure assessment
8. [ ] Generate policy report
9. [ ] Download/save report
10. [ ] Check "The Output/" folder for generated files

## Troubleshooting Notes

If any check fails:
1. [ ] Review `DOCKER_GUIDE.md` troubleshooting section
2. [ ] Check logs: `docker-compose logs`
3. [ ] Verify configuration files
4. [ ] Restart services: `docker-compose restart`
5. [ ] Full reset if needed: `docker-compose down -v && docker-compose up -d`

## Sign-Off

- [ ] All checks passed
- [ ] System working as expected
- [ ] Documentation reviewed
- [ ] Ready for production use (if needed)

---

## Quick Reference

| Task | Command |
|------|---------|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Logs | `docker-compose logs -f` |
| Status | `docker-compose ps` |
| Restart | `docker-compose restart` |
| Build | `docker-compose build` |
| Shell | `docker-compose exec backend bash` |

---

## Date Completed: _______________

**Verified By:** _______________

**Notes:** 
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

For detailed information, refer to:
- DOCKER_FIXES_SUMMARY.md
- DOCKER_GUIDE.md
- DOCKER_QUICK_START.md
