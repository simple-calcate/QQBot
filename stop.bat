@echo off
chcp 65001
echo 正在停止所有 QQ Bot 进程...
taskkill /F /IM node.exe >nul 2>&1
echo 已停止。
timeout /t 2 /nobreak >nul
