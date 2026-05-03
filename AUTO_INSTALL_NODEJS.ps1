# FoodBridge - Automatic Node.js Download and Install Helper
# This script downloads Node.js and helps with installation

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  FoodBridge - Node.js Auto-Installer" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is already installed
Write-Host "Checking if Node.js is already installed..." -ForegroundColor Yellow
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is already installed: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
}

if ($nodeInstalled) {
    Write-Host ""
    Write-Host "Node.js is ready! Next steps:" -ForegroundColor Green
    Write-Host "1. Run: SETUP_FOODBRIDGE.bat" -ForegroundColor Cyan
    Write-Host "2. Run: START_FOODBRIDGE.bat" -ForegroundColor Cyan
    Write-Host ""
    pause
    exit
}

# Create downloads folder
Write-Host ""
Write-Host "Creating downloads folder..." -ForegroundColor Yellow
if (!(Test-Path "downloads")) {
    New-Item -ItemType Directory -Path "downloads" | Out-Null
}

# Download Node.js
$nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
$installerPath = "downloads\node-v20.11.0-x64.msi"

Write-Host ""
Write-Host "Downloading Node.js v20.11.0..." -ForegroundColor Yellow
Write-Host "This may take a few minutes (file size: ~30MB)" -ForegroundColor Gray
Write-Host ""

try {
    # Download with progress
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $nodeUrl -OutFile $installerPath
    $ProgressPreference = 'Continue'
    
    Write-Host "✅ Download complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  Node.js Installer Ready!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installer saved to: $installerPath" -ForegroundColor Cyan
    Write-Host ""
    
    # Ask to run installer
    Write-Host "Would you like to run the installer now? (Y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host ""
        Write-Host "Opening Node.js installer..." -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT INSTRUCTIONS:" -ForegroundColor Yellow
        Write-Host "1. Click 'Next' on welcome screen" -ForegroundColor White
        Write-Host "2. Accept license agreement" -ForegroundColor White
        Write-Host "3. Keep default installation path" -ForegroundColor White
        Write-Host "4. Keep all features selected" -ForegroundColor White
        Write-Host "5. Click 'Install'" -ForegroundColor White
        Write-Host "6. Wait for installation (~3 minutes)" -ForegroundColor White
        Write-Host "7. Click 'Finish'" -ForegroundColor White
        Write-Host ""
        Write-Host "After installation:" -ForegroundColor Yellow
        Write-Host "1. Close ALL terminal windows" -ForegroundColor White
        Write-Host "2. Open a NEW terminal" -ForegroundColor White
        Write-Host "3. Run: SETUP_FOODBRIDGE.bat" -ForegroundColor Cyan
        Write-Host ""
        
        Start-Sleep -Seconds 3
        Start-Process $installerPath -Wait
        
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "  Installation Complete!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Close this window" -ForegroundColor White
        Write-Host "2. Close ALL other terminal windows" -ForegroundColor White
        Write-Host "3. Open a NEW terminal" -ForegroundColor White
        Write-Host "4. Run: SETUP_FOODBRIDGE.bat" -ForegroundColor Cyan
        Write-Host ""
        
    } else {
        Write-Host ""
        Write-Host "Installer is ready in the downloads folder." -ForegroundColor Green
        Write-Host "Double-click it when you're ready to install!" -ForegroundColor Green
        Write-Host ""
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Download failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download manually from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening Node.js website..." -ForegroundColor Yellow
    Start-Process "https://nodejs.org/"
}

Write-Host ""
pause
