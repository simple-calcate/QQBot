@echo off
chcp 65001 >nul
title QQ Bot + Hermes Agent
echo ========================================
echo   QQ Bot + Hermes Agent
echo ========================================
echo.

echo [0] Cleaning old processes...
taskkill /F /IM node.exe >nul 2>&1
ping -n 3 127.0.0.1 >nul

echo [1/3] Starting SnowLuma...
start "SnowLuma" cmd /c "cd /d C:\Users\27554\Desktop\SnowLuma && node.exe index.mjs"
ping -n 10 127.0.0.1 >nul

echo [2/3] Starting Hermes Worker...
start "Hermes Worker" cmd /c "cd /d C:\Users\27554\Desktop\QQBot && C:\Users\27554\Desktop\SnowLuma\node.exe hermes-worker-v11.mjs"
ping -n 3 127.0.0.1 >nul

echo [3/3] Starting QQ Bridge...
echo.
echo ========================================
echo   System started!
echo   - Private: reply all messages
echo   - Group: reply @messages with history
echo   - Press Ctrl+C to stop
echo ========================================
echo.
cd /d C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs

pause
