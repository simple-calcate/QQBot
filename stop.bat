@echo off
chcp 65001 >nul
echo Stopping QQ Bot...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq SnowLuma*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Hermes Worker*" >nul 2>&1
echo Done.
timeout /t 2 >nul
