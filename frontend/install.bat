@echo off
cd /d C:\Users\崔志强\Desktop\后台管理系统\frontend
node -v > node_version.txt
npm install > npm_install.txt 2>&1
echo Done >> npm_install.txt
