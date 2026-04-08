@echo off
REM Docker Setup and Run Script for Windows
REM Waste Management Policy System

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Waste Management Policy System
echo Docker Setup (Windows)
echo ========================================
echo.

REM Check Docker
echo [1/5] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found. Please install Docker Desktop for Windows.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do (
    echo. ✓ %%i
)

REM Check Docker Compose
echo.
echo [2/5] Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose not found. Please install Docker Compose.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker-compose --version') do (
    echo. ✓ %%i
)

REM Build images
echo.
echo [3/5] Building Docker images...
docker-compose -f docker-compose.yml build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build Docker images.
    pause
    exit /b 1
)
echo. ✓ Images built successfully

REM Create directories
echo.
echo [4/5] Preparing directories...
if not exist "The Output" mkdir "The Output"
if not exist "logs" mkdir "logs"
if not exist "data" mkdir "data"
echo. ✓ Directories ready

REM Start services
echo.
echo [5/5] Starting services...
docker-compose -f docker-compose.yml up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services.
    pause
    exit /b 1
)
echo. ✓ Services started

REM Wait for services
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak

REM Display URLs
echo.
echo ========================================
echo. ✓ Setup Complete!
echo ========================================
echo.

echo Services available at:
echo.   Frontend:  http://localhost:5173
echo.   Backend:   http://localhost:5000
echo.   API:       http://localhost:5000/api
echo.

echo Useful commands:
echo.   View logs:     docker-compose logs -f
echo.   Stop services: docker-compose down
echo.   Restart:       docker-compose restart
echo.   Shell access:  docker-compose exec backend bash
echo.

pause
