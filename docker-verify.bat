@echo off
REM Docker Verification Script (Windows)
REM Verifies all Docker configurations and services are working

setlocal enabledelayedexpansion

set /a PASSED=0
set /a FAILED=0

echo.
echo ========================================
echo Docker Configuration Verification
echo ========================================
echo.

REM Docker checks
echo [1/4] Docker and Compose Checks

REM Check Docker
docker --version >nul 2>&1
if !errorlevel! equ 0 (
    echo. ✓ Docker installed
    set /a PASSED+=1
) else (
    echo. ✗ Docker not installed
    set /a FAILED+=1
)

REM Check Docker running
docker ps >nul 2>&1
if !errorlevel! equ 0 (
    echo. ✓ Docker running
    set /a PASSED+=1
) else (
    echo. ✗ Docker not running
    set /a FAILED+=1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if !errorlevel! equ 0 (
    echo. ✓ Docker Compose installed
    set /a PASSED+=1
) else (
    echo. ✗ Docker Compose not installed
    set /a FAILED+=1
)

REM Configuration file checks
echo.
echo [2/4] Configuration File Checks

if exist docker-compose.yml (
    echo. ✓ docker-compose.yml exists
    set /a PASSED+=1
) else (
    echo. ✗ docker-compose.yml missing
    set /a FAILED+=1
)

if exist Dockerfile (
    echo. ✓ Dockerfile exists
    set /a PASSED+=1
) else (
    echo. ✗ Dockerfile missing
    set /a FAILED+=1
)

if exist .dockerignore (
    echo. ✓ .dockerignore exists
    set /a PASSED+=1
) else (
    echo. ✗ .dockerignore missing
    set /a FAILED+=1
)

if exist .env.docker (
    echo. ✓ .env.docker exists
    set /a PASSED+=1
) else (
    echo. ✗ .env.docker missing
    set /a FAILED+=1
)

if exist "Non-Biodigradable Policymaking Assistant_UserInterface\Dockerfile" (
    echo. ✓ Frontend Dockerfile exists
    set /a PASSED+=1
) else (
    echo. ✗ Frontend Dockerfile missing
    set /a FAILED+=1
)

REM Data file checks
echo.
echo [3/4] Data File Checks

if exist public_data_waste_fee.csv (
    echo. ✓ CSV data file exists
    set /a PASSED+=1
) else (
    echo. ✗ CSV data file missing
    set /a FAILED+=1
)

if exist policy_model.py (
    echo. ✓ policy_model.py exists
    set /a PASSED+=1
) else (
    echo. ✗ policy_model.py missing
    set /a FAILED+=1
)

if exist api_server.py (
    echo. ✓ api_server.py exists
    set /a PASSED+=1
) else (
    echo. ✗ api_server.py missing
    set /a FAILED+=1
)

REM Port checks
echo.
echo [4/4] Port Availability Checks

netstat -ano | findstr :5000 >nul 2>&1
if !errorlevel! equ 0 (
    echo. ⚠ Port 5000 in use
) else (
    echo. ✓ Port 5000 available
    set /a PASSED+=1
)

netstat -ano | findstr :5173 >nul 2>&1
if !errorlevel! equ 0 (
    echo. ⚠ Port 5173 in use
) else (
    echo. ✓ Port 5173 available
    set /a PASSED+=1
)

REM Summary
echo.
echo ========================================
echo Verification Summary
echo ========================================
echo.
echo Passed: !PASSED!
echo Failed: !FAILED!
echo.

if !FAILED! equ 0 (
    echo. ✓ All checks passed! System is ready to run.
    echo.
    echo To start services, run:
    echo.   docker-compose up -d
    echo.
    pause
    exit /b 0
) else (
    echo. ✗ Some checks failed. Please fix issues above.
    echo.
    pause
    exit /b 1
)
