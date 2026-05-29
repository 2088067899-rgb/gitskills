$ErrorActionPreference = "Continue"
Set-Location "C:\Users\崔志强\Desktop\后台管理系统\frontend"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Node version:"
node -v
Write-Host "Installing dependencies..."
npm install
Write-Host "Starting dev server..."
npm run dev
