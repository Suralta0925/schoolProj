#!/bin/bash

set -e

echo "======================================"
echo "  Scheduler System Auto Setup"
echo "======================================"

# ==================================================
# Utility Functions
# ==================================================

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

error_exit() {
    echo ""
    echo "[ERROR] $1"
    exit 1
}

# ==================================================
# Detect Operating System
# ==================================================

OS="$(uname)"

echo "[INFO] Operating System: $OS"

# ==================================================
# Check Required Tools
# ==================================================

echo ""
echo "======================================"
echo " Checking Required Tools"
echo "======================================"

if command_exists node; then
    echo "[OK] Node.js: $(node -v)"
else
    error_exit "Node.js is not installed."
fi

if command_exists npm; then
    echo "[OK] npm: $(npm -v)"
else
    error_exit "npm is not installed."
fi

if command_exists python3; then
    echo "[OK] Python: $(python3 --version)"
elif command_exists python; then
    echo "[OK] Python: $(python --version)"
    alias python3=python
else
    error_exit "Python is not installed."
fi

if command_exists pip3; then
    echo "[OK] pip3 installed"
elif command_exists pip; then
    echo "[OK] pip installed"
    alias pip3=pip
else
    error_exit "pip is not installed."
fi

# ==================================================
# Version Safety Checks
# ==================================================

echo ""
echo "======================================"
echo " Checking Version Compatibility"
echo "======================================"

REQUIRED_NODE_MAJOR=18
REQUIRED_PYTHON_MAJOR=3

NODE_MAJOR=$(node -v | cut -d '.' -f1 | tr -d 'v')
PYTHON_MAJOR=$(python3 --version | awk '{print $2}' | cut -d '.' -f1)

if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
    error_exit "Node.js 18+ required. Current: $(node -v)"
fi

if [ "$PYTHON_MAJOR" -lt "$REQUIRED_PYTHON_MAJOR" ]; then
    error_exit "Python 3+ required."
fi

echo "[OK] Version compatibility passed."

# ==================================================
# BACKEND SETUP
# ==================================================

echo ""
echo "======================================"
echo " Setting Up Backend"
echo "======================================"

BACKEND_PATH="simple_backend"

if [ ! -d "$BACKEND_PATH" ]; then
    error_exit "$BACKEND_PATH folder not found."
fi

cd "$BACKEND_PATH"

# --------------------------------------------------
# Create Virtual Environment
# --------------------------------------------------

if [ ! -d ".venv" ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv .venv
else
    echo "[OK] Virtual environment already exists."
fi

# --------------------------------------------------
# Detect Correct Python/Pip Paths
# --------------------------------------------------

if [[ "$OS" == "MINGW"* ]] || [[ "$OS" == "CYGWIN"* ]] || [[ "$OS" == *"NT"* ]]; then
    PIP_PATH=".venv/Scripts/pip"
    PYTHON_PATH=".venv/Scripts/python"
else
    PIP_PATH=".venv/bin/pip"
    PYTHON_PATH=".venv/bin/python"
fi

# --------------------------------------------------
# Validate Venv Executables
# --------------------------------------------------

if [ ! -f "$PIP_PATH" ]; then
    error_exit "Virtual environment pip not found."
fi

if [ ! -f "$PYTHON_PATH" ]; then
    error_exit "Virtual environment python not found."
fi

# --------------------------------------------------
# Upgrade Pip
# --------------------------------------------------

echo "[INFO] Upgrading pip..."

"$PIP_PATH" install --upgrade pip

# --------------------------------------------------
# Install Backend Dependencies
# --------------------------------------------------

if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing backend dependencies..."

    "$PIP_PATH" install -r requirements.txt
else
    echo "[WARNING] requirements.txt not found."
    echo "[INFO] Installing FastAPI and Uvicorn manually..."

    "$PIP_PATH" install fastapi uvicorn
fi

# --------------------------------------------------
# Ensure FastAPI + Uvicorn Installed
# --------------------------------------------------

echo "[INFO] Ensuring FastAPI and Uvicorn are installed..."

"$PIP_PATH" install fastapi uvicorn

echo "[OK] Backend setup complete."

cd ..

# ==================================================
# FRONTEND SETUP
# ==================================================

echo ""
echo "======================================"
echo " Setting Up Frontend"
echo "======================================"

FRONTEND_PATH="frontend/SchedulerSys"

if [ ! -d "$FRONTEND_PATH" ]; then
    error_exit "$FRONTEND_PATH folder not found."
fi

cd "$FRONTEND_PATH"

# --------------------------------------------------
# Verify package.json
# --------------------------------------------------

if [ ! -f "package.json" ]; then
    error_exit "package.json not found."
fi

# --------------------------------------------------
# Install Node Modules
# --------------------------------------------------

if [ -f "package-lock.json" ]; then
    echo "[INFO] Installing frontend dependencies with npm ci..."

    npm ci
else
    echo "[WARNING] package-lock.json not found."
    echo "[INFO] Falling back to npm install..."

    npm install
fi

echo "[OK] Frontend setup complete."

cd ../..

# ==================================================
# FINAL SUCCESS
# ==================================================

echo ""
echo "======================================"
echo " Setup Complete Successfully"
echo "======================================"

echo ""
echo "Backend Commands:"
echo "--------------------------------------"

if [[ "$OS" == "MINGW"* ]] || [[ "$OS" == "CYGWIN"* ]] || [[ "$OS" == *"NT"* ]]; then
    echo "cd simple_backend"
    echo ".venv\\Scripts\\activate"
    echo "uvicorn main:app --reload"
else
    echo "cd simple_backend"
    echo "source .venv/bin/activate"
    echo "uvicorn main:app --reload"
fi

echo ""
echo "Frontend Commands:"
echo "--------------------------------------"
echo "cd frontend/SchedulerSys"
echo "npm run dev"

echo ""
echo "======================================"
echo " Everything is ready 🚀"
echo "======================================"
