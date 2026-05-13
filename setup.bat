@echo off
setlocal enabledelayedexpansion

echo ======================================
echo   Scheduler System Auto Setup
echo ======================================

REM ==================================================
REM Check Node.js
REM ==================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed.
    pause
    exit /b 1
)

echo [OK] Node.js Found

REM ==================================================
REM Check npm
REM ==================================================

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)

echo [OK] npm Found

REM ==================================================
REM Check Python
REM ==================================================

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python is not installed.
    pause
    exit /b 1
)

echo [OK] Python Found

REM ==================================================
REM Backend Setup
REM ==================================================

echo.
echo ======================================
echo   Setting Up Backend
echo ======================================

if not exist simple_backend (
    echo [ERROR] simple_backend folder not found.
    pause
    exit /b 1
)

cd simple_backend

REM --------------------------------------------------
REM Create Virtual Environment
REM --------------------------------------------------

if not exist .venv (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
) else (
    echo [OK] Virtual environment already exists.
)

REM --------------------------------------------------
REM Upgrade pip
REM --------------------------------------------------

echo [INFO] Upgrading pip...

call .venv\Scripts\python.exe -m pip install --upgrade pip

REM --------------------------------------------------
REM Install requirements
REM --------------------------------------------------

if exist requirements.txt (
    echo [INFO] Installing backend dependencies...
    call .venv\Scripts\pip.exe install -r requirements.txt
) else (
    echo [WARNING] requirements.txt not found.
)

REM --------------------------------------------------
REM Ensure FastAPI + Uvicorn
REM --------------------------------------------------

echo [INFO] Ensuring FastAPI and Uvicorn are installed...

call .venv\Scripts\pip.exe install fastapi uvicorn jwt

echo [OK] Backend setup complete.

cd ..

REM ==================================================
REM Frontend Setup
REM ==================================================

echo.
echo ======================================
echo   Setting Up Frontend
echo ======================================

if not exist frontend\SchedulerSys (
    echo [ERROR] frontend\SchedulerSys folder not found.
    pause
    exit /b 1
)

cd frontend\SchedulerSys

REM --------------------------------------------------
REM Verify package.json
REM --------------------------------------------------

if not exist package.json (
    echo [ERROR] package.json not found.
    pause
    exit /b 1
)

REM --------------------------------------------------
REM Install node_modules
REM --------------------------------------------------

if exist package-lock.json (
    echo [INFO] Installing dependencies using npm ci...
    call npm ci
) else (
    echo [WARNING] package-lock.json not found.
    echo [INFO] Falling back to npm install...
    call npm install
)

echo [OK] Frontend setup complete.

cd ..\..

REM ==================================================
REM Finished
REM ==================================================

echo.
echo ======================================
echo   Setup Complete Successfully
echo ======================================

echo.
echo Backend:
echo cd simple_backend
echo .venv\Scripts\activate
echo uvicorn main:app --reload

echo.
echo Frontend:
echo cd frontend\SchedulerSys
echo npm run dev

echo.
echo Everything is ready 🚀

pause