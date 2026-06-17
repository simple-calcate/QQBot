@echo off
chcp 65001
echo ========================================
echo   SnowLuma <-> Hermes Agent 完整系统
echo ========================================
echo.
echo 启动中...
echo.

echo [1/2] 启动 Hermes Agent API Server...
start "Hermes API" cmd /c "C:\Users\27554\Desktop\SnowLuma\node.exe" api-server.mjs
timeout /t 2 >nul

echo [2/2] 启动桥接机器人...
start "QQ Bridge" cmd /c "C:\Users\27554\Desktop\SnowLuma\node.exe" bridge.mjs

echo.
echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo 服务列表:
echo   • Hermes API: http://127.0.0.1:5001
echo   • SnowLuma WS: ws://127.0.0.1:3001
echo.
echo 使用方法:
echo   1. 在 QQ 中给机器人发送消息
echo   2. 或在群里 @机器人
echo.
echo 按任意键关闭此窗口（服务继续运行）
echo ========================================
pause >nul
