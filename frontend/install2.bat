@echo off
chcp 65001 >nul
pushd "%USERPROFILE%\Desktop\后台管理系统\frontend"
echo Current directory: %CD%
node -v
npm install
popd
pause
