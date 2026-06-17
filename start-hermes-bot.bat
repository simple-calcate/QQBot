@echo off
chcp 65001
echo ========================================
echo   启动 QQ Bot + Hermes Worker
echo ========================================
echo.

:: 启动 Worker（后台）
echo [1/2] 启动 Hermes Worker...
start "Hermes Worker" cmd /c "cd /d C:\Users\27554\Desktop\QQBot && C:\Users\27554\Desktop\SnowLuma\node.exe hermes-worker-real.mjs"
timeout /t 2 /nobreak >nul

:: 启动 Bridge（前台）
echo [2/2] 启动 QQ Bridge...
echo.
cd /d C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs

pause
