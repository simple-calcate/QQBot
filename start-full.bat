@echo off
chcp 65001 >nul
title QQ Bot + Hermes Agent

echo ========================================
echo   QQ Bot + Hermes Agent
echo   (Restart: just close and re-run)
echo ========================================
echo.

echo [0] Killing all old node processes...
taskkill /F /IM node.exe >nul 2>&1
:: Also kill any leftover cmd windows with our titles
taskkill /F /FI "WINDOWTITLE eq SnowLuma*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Hermes Worker*" >nul 2>&1
ping -n 3 127.0.0.1 >nul

echo [1/4] Starting SnowLuma...
start "SnowLuma" cmd /c "chcp 65001 >nul && cd /d C:\Users\27554\Desktop\SnowLuma && node.exe index.mjs"
ping -n 3 127.0.0.1 >nul

echo [2/4] Waiting for SnowLuma WebUI...
:WAIT_WEBUI
curl -s --max-time 2 http://127.0.0.1:5099 >nul 2>&1
if errorlevel 1 (
    ping -n 2 127.0.0.1 >nul
    goto WAIT_WEBUI
)
echo       WebUI ready at http://localhost:5099
echo.

echo ========================================
echo   Please login QQ via WebUI:
echo   http://localhost:5099
echo.
echo   After login, OneBot ports 3000/3001
echo   will become available automatically.
echo ========================================
echo.
echo [3/4] Waiting for OneBot port 3000...
:WAIT_ONEBOT
netstat -an | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if errorlevel 1 (
    ping -n 3 127.0.0.1 >nul
    goto WAIT_ONEBOT
)
echo       OneBot ready!
echo.

echo [4/4] Starting Hermes Worker and QQ Bridge...
start "Hermes Worker" cmd /c "chcp 65001 >nul && cd /d C:\Users\27554\Desktop\QQBot && C:\Users\27554\Desktop\SnowLuma\node.exe hermes-worker-v11.mjs"
ping -n 3 127.0.0.1 >nul

echo.
echo ========================================
echo   All systems started!
echo   - SnowLuma: http://localhost:5099
echo   - OneBot HTTP: http://localhost:3000
echo   - OneBot WS: ws://localhost:3001
echo.
echo   To restart: close all windows, re-run
echo   To stop: close this window or Ctrl+C
echo ========================================
echo.
cd /d C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs

pause
