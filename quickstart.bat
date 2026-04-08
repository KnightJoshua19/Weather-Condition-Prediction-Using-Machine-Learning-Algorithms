@echo off
REM Quick Start Script for Waste Management Policy System (Windows)
REM Run this batch file to setup and configure the system

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Waste Management Policy Analysis System
echo Quick Start Setup (Windows)
echo ========================================
echo.

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.11+
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do (
    echo. ✓ Python %%i found
)

REM Check Node.js
echo.
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do (
    echo. ✓ Node.js %%i found
)

REM Setup Backend
echo.
echo [3/5] Setting up Backend...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -q -r requirements.txt
echo. ✓ Backend dependencies installed

REM Setup Frontend
echo.
echo [4/5] Setting up Frontend...
cd "Non-Biodigradable Policymaking Assistant_UserInterface"

where pnpm >nul 2>&1
if %errorlevel% equ 0 (
    echo Installing frontend dependencies with pnpm...
    pnpm install -q
) else (
    echo Installing frontend dependencies with npm...
    npm install -q
)

echo. ✓ Frontend dependencies installed
cd ..

REM Summary
echo.
echo ========================================
echo. ✓ Setup Complete!
echo ========================================
echo.

echo.
echo To start the system, run the following in separate terminals:
echo.
echo Terminal 1 ^(Backend - Python API^):
echo venv\Scripts\activate
echo python api_server.py
echo.

echo Terminal 2 ^(Frontend - React^):
echo cd "Non-Biodigradable Policymaking Assistant_UserInterface"
echo pnpm dev
echo.

echo Then open your browser to:
echo http://localhost:5173
echo.

echo API will be available at:
echo http://localhost:5000/api
echo.

echo. ✓ System is ready to use!
echo.

pause
