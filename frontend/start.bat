@echo off
chcp 65001 >nul
powershell.exe -NoProfile -Command "Set-Location 'Desktop\后台管理系统\frontend'; node -v; npm install; npm run dev"
pause
