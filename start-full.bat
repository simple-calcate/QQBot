@echo off
chcp 65001
title QQ Bot + Hermes Agent
echo ========================================
echo   QQ Bot + Hermes Agent 启动脚本
echo ========================================
echo.

:: 先杀掉所有旧的 node 进程（排除 VSCode 等）
echo [0] 清理旧进程...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: 启动 SnowLuma
echo [1/3] 启动 SnowLuma...
start "SnowLuma" cmd /c "cd /d C:\Users\27554\Desktop\SnowLuma && node.exe index.mjs"
timeout /t 8 /nobreak >nul

:: 启动 Worker（后台）
echo [2/3] 启动 Hermes Worker...
start "Hermes Worker" cmd /c "cd /d C:\Users\27554\Desktop\QQBot && C:\Users\27554\Desktop\SnowLuma\node.exe hermes-worker-v11.mjs"
timeout /t 2 /nobreak >nul

:: 启动 Bridge（前台）
echo [3/3] 启动 QQ Bridge...
echo.
echo ========================================
echo   系统已启动！
echo   - 私聊：所有消息回复
echo   - 群聊：只回复@消息，附带聊天记录
echo   - 按 Ctrl+C 停止
echo ========================================
echo.
cd /d C:\Users\27554\Desktop\QQBot
"C:\Users\27554\Desktop\SnowLuma\node.exe" qq-bridge.mjs

pause
