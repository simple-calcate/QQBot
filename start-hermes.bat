@echo off
chcp 65001
echo ========================================
echo   🤖 Hermes Agent - QQ 机器人
echo ========================================
echo.
echo 启动中...
echo.

echo [1/3] 启动 SnowLuma...
start "SnowLuma" cmd /c "C:\Users\27554\Desktop\SnowLuma\launcher.bat"
timeout /t 5 >nul

echo [2/3] 启动 Hermes Worker...
start "Hermes" cmd /c "C:\Users\27554\Desktop\SnowLuma\node.exe" hermes-worker.mjs
timeout /t 2 >nul

echo [3/3] 启动桥接...
start "Bridge" cmd /c "C:\Users\27554\Desktop\SnowLuma\node.exe" bridge.mjs

echo.
echo ========================================
echo   ✅ 所有服务已启动！
echo ========================================
echo.
echo 使用方法:
echo   1. 在 QQ 中发送"帮助"查看功能
echo   2. 发送"执行 dir"执行命令
echo   3. 发送"系统信息"查看系统状态
echo.
echo 按任意键关闭此窗口
echo ========================================
pause >nul
