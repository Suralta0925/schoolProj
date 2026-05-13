@echo off

if not exist .venv (
    echo [ERROR] .venv folder not found.
    pause
    exit /b 1
)

call .venv\Scripts\uvicorn.exe src.app:app --host 0.0.0.0 --port 8000

pause