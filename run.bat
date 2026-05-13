@echo off
setlocal

echo ======================================
echo   Scheduler System Launcher
echo ======================================

REM ==================================================
REM Start Backend
REM ==================================================

echo.
echo [INFO] Starting backend...

start "Backend Server" cmd /k "cd /d %~dp0simple_backend && run.bat"

REM ==================================================
REM Start Frontend
REM ==================================================

echo.
echo [INFO] Starting frontend...

start "Frontend Server" cmd /k "cd /d %~dp0frontend\SchedulerSys && run.bat"

echo.
echo ======================================
echo   Servers Started Successfully
echo ======================================

echo.
echo Frontend:
echo http://localhost:5173

echo Backend:
echo http://localhost:8000

echo.
echo Close the opened terminal windows to stop servers.

pause