@echo off
chcp 65001
echo ========================================
echo   SnowLuma <-> Hermes Agent 桥接机器人
echo ========================================
echo.
echo 请确保:
echo 1. SnowLuma 已启动 (端口 5099)
echo 2. QQ 已绑定到 SnowLuma
echo.
echo 按 Ctrl+C 停止机器人
echo ========================================
echo.
"C:\Users\27554\Desktop\SnowLuma\node.exe" bridge.mjs
pause
