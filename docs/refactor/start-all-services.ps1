# Zero Sources Architecture Startup Script (PowerShell)
# Demonstrates the proper startup sequence for the three-container architecture

param(
    [switch]$SkipBuild,
    [string]$LogLevel = "info"
)

Write-Host "🚀 Starting Zero Sources Architecture" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Function to wait for service to be ready
function Wait-ForService {
    param(
        [string]$Url,
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )

    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Blue
    
    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        }
        catch {
            # Service not ready yet
        }
        
        Write-Host "   Attempt $attempt/$MaxAttempts - $ServiceName not ready yet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start within timeout" -ForegroundColor Red
    return $false
}

# Step 1: Check MongoDB
Write-Host "1. Checking MongoDB connection..." -ForegroundColor Blue
# In local development, MongoDB should already be running

# Step 2: Start ZRocket Application (needs to be first for schema export)
Write-Host "2. Starting ZRocket Application Server..." -ForegroundColor Blue

Push-Location "apps\zrocket"
if (-not $SkipBuild) {
    Write-Host "   Building ZRocket..." -ForegroundColor Yellow
    npm run build | Out-Null
}

$zrocketJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}
Pop-Location

# Wait for ZRocket to be ready
if (-not (Wait-ForService -Url "http://localhost:8011/health" -ServiceName "ZRocket Application")) {
    Write-Host "Failed to start ZRocket. Exiting..." -ForegroundColor Red
    exit 1
}

# Verify schema export is working
Write-Host "🔍 Testing schema export endpoints..." -ForegroundColor Blue
try {
    $schemaResponse = Invoke-WebRequest -Uri "http://localhost:8011/api/schema/export" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Schema export endpoint is working" -ForegroundColor Green
}
catch {
    Write-Host "❌ Schema export endpoint failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Export schema files for source server
Write-Host "3. Exporting schema for source server..." -ForegroundColor Blue
Push-Location "apps\zrocket"
npm run export-schema:source-server
Pop-Location

# Step 4: Start Zero Change Source Server
Write-Host "4. Starting Zero Change Source Server..." -ForegroundColor Blue

Push-Location "apps\source-mongodb-server"
if (-not $SkipBuild) {
    Write-Host "   Building Source Server..." -ForegroundColor Yellow
    npm run build | Out-Null
}

$sourceJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm start 
}
Pop-Location

# Wait for Change Source to be ready
if (-not (Wait-ForService -Url "http://localhost:8001/health" -ServiceName "Zero Change Source")) {
    Write-Host "Failed to start Zero Change Source. Exiting..." -ForegroundColor Red
    exit 1
}

# Step 5: Start Zero Cache Server
Write-Host "5. Starting Zero Cache Server..." -ForegroundColor Blue

Push-Location "apps\zrocket"
$cacheJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    npm run dev:zero 
}
Pop-Location

# Wait for Zero Cache to be ready
if (-not (Wait-ForService -Url "http://localhost:4848/health" -ServiceName "Zero Cache")) {
    Write-Host "Failed to start Zero Cache. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 All services are running!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "🔗 Service URLs:" -ForegroundColor Blue
Write-Host "   ZRocket App:        http://localhost:8011"
Write-Host "   ZRocket API Docs:   http://localhost:8011/api-docs"
Write-Host "   Zero Change Source: http://localhost:8001"
Write-Host "   Zero Cache:         http://localhost:4848"
Write-Host ""
Write-Host "📊 Schema Endpoints:" -ForegroundColor Blue
Write-Host "   Schema Export:      http://localhost:8011/api/schema/export"
Write-Host "   Table Mappings:     http://localhost:8011/api/schema/table-mappings"
Write-Host "   Source Metadata:    http://localhost:8001/metadata/status"
Write-Host ""
Write-Host "💡 To stop all services, close this window or press Ctrl+C" -ForegroundColor Yellow

# Keep script running and monitor jobs
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if any jobs have failed
        $failedJobs = Get-Job | Where-Object { $_.State -eq "Failed" }
        if ($failedJobs) {
            Write-Host "❌ One or more services have failed!" -ForegroundColor Red
            Get-Job | Receive-Job
            break
        }
    }
}
finally {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
}
