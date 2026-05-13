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
# Check OS
# ==================================================

OS="$(uname)"

echo "[INFO] Operating System: $OS"

# ==================================================
# Check Required Tools
# ==================================================

echo ""
echo "Checking required tools..."

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
else
    error_exit "Python3 is not installed."
fi

if command_exists pip3; then
    echo "[OK] pip3 installed"
else
    error_exit "pip3 is not installed."
fi

# ==================================================
# Optional Version Safety Checks
# ==================================================

REQUIRED_NODE_MAJOR=18
REQUIRED_PYTHON_MAJOR=3

NODE_MAJOR=$(node -v | cut -d '.' -f1 | tr -d 'v')
PYTHON_MAJOR=$(python3 --version | awk '{print $2}' | cut -d '.' -f1)

if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
    error_exit "Node.js 18+ required."
fi

if [ "$PYTHON_MAJOR" -lt "$REQUIRED_PYTHON_MAJOR" ]; then
    error_exit "Python 3+ required."
fi

# ==================================================
# BACKEND SETUP
# ==================================================

echo ""
echo "======================================"
echo " Setting Up Backend"
echo "======================================"

if [ ! -d "simple_backend" ]; then
    error_exit "simple_backend folder not found."
fi

cd simple_backend

# -----------------------------------
# Create virtual environment
# -----------------------------------

if [ ! -d ".venv" ]; then
    echo "[INFO] Creating virtual environment..."
    python3 -m venv .venv
else
    echo "[OK] Virtual environment already exists."
fi

# -----------------------------------
# Activate virtual environment
# -----------------------------------

source .venv/bin/activate

# -----------------------------------
# Upgrade pip
# -----------------------------------

echo "[INFO] Upgrading pip..."
pip install --upgrade pip

# -----------------------------------
# Install requirements
# -----------------------------------

if [ -f "requirements.txt" ]; then
    echo "[INFO] Installing backend dependencies..."
    pip install -r requirements.txt
else
    echo "[WARNING] requirements.txt not found."
    echo "[INFO] Installing FastAPI and Uvicorn manually..."
    pip install fastapi uvicorn
fi

# -----------------------------------
# Ensure FastAPI + Uvicorn
# -----------------------------------

pip install fastapi uvicorn

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

# -----------------------------------
# Install Node Modules
# -----------------------------------

if [ -f "package-lock.json" ]; then
    echo "[INFO] Installing frontend dependencies with npm ci..."
    npm ci
else
    echo "[INFO] package-lock.json not found."
    echo "[INFO] Falling back to npm install..."
    npm install
fi

echo "[OK] Frontend setup complete."

cd ../..

# ==================================================
# DONE
# ==================================================

echo ""
echo "======================================"
echo " Setup Complete Successfully"
echo "======================================"

echo ""
echo "Backend venv:"
echo "  source simple_backend/.venv/bin/activate"

echo ""
echo "Run backend:"
echo "  cd simple_backend"
echo "  uvicorn main:app --reload"

echo ""
echo "Run frontend:"
echo "  cd frontend/SchedulerSys"
echo "  npm run dev"
