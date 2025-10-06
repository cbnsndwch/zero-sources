# Zero Get-Queries Configuration Verification Script
# Usage: .\verify-get-queries-config.ps1

Write-Host "🔍 Verifying Zero Get-Queries Configuration..." -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Check 1: Verify .env files exist
Write-Host "📁 Checking .env files..." -ForegroundColor Yellow

$envFiles = @(
    "apps/source-mongodb-server/.env",
    "apps/zrocket/.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  ✅ Found: $envFile" -ForegroundColor Green
    } else {
        $errors += "Missing .env file: $envFile"
        Write-Host "  ❌ Missing: $envFile" -ForegroundColor Red
    }
}

Write-Host ""

# Check 2: Verify ZERO_GET_QUERIES_URL is set
Write-Host "🔗 Checking ZERO_GET_QUERIES_URL configuration..." -ForegroundColor Yellow

$sourceMongoEnv = "apps/source-mongodb-server/.env"
if (Test-Path $sourceMongoEnv) {
    $content = Get-Content $sourceMongoEnv -Raw
    if ($content -match "ZERO_GET_QUERIES_URL\s*=\s*'([^']+)'") {
        $url = $matches[1]
        Write-Host "  ✅ Zero Cache configured: $url" -ForegroundColor Green
        
        # Validate URL format
        if ($url -match "^https?://[^/]+/api/zero/get-queries$") {
            Write-Host "  ✅ URL format is valid" -ForegroundColor Green
        } else {
            $warnings += "URL format may be incorrect: $url"
            Write-Host "  ⚠️  URL format may be incorrect" -ForegroundColor Yellow
        }
    } else {
        $errors += "ZERO_GET_QUERIES_URL not found in $sourceMongoEnv"
        Write-Host "  ❌ ZERO_GET_QUERIES_URL not configured" -ForegroundColor Red
    }
}

Write-Host ""

# Check 3: Verify PORT matches URL
Write-Host "🔌 Checking PORT configuration..." -ForegroundColor Yellow

$zrocketEnv = "apps/zrocket/.env"
if (Test-Path $zrocketEnv) {
    $content = Get-Content $zrocketEnv -Raw
    
    # Extract PORT
    if ($content -match "PORT\s*=\s*(\d+)") {
        $port = $matches[1]
        Write-Host "  ✅ ZRocket PORT: $port" -ForegroundColor Green
        
        # Check if URL matches port
        if ($url -and $url -match ":$port/") {
            Write-Host "  ✅ PORT matches ZERO_GET_QUERIES_URL" -ForegroundColor Green
        } elseif ($url) {
            $warnings += "PORT ($port) may not match ZERO_GET_QUERIES_URL ($url)"
            Write-Host "  ⚠️  PORT may not match URL" -ForegroundColor Yellow
        }
    } else {
        $warnings += "PORT not found in $zrocketEnv"
        Write-Host "  ⚠️  PORT not explicitly configured" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check 4: Test if services are running
Write-Host "🚀 Testing service connectivity..." -ForegroundColor Yellow

# Test Zero Cache
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4848" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ Zero Cache is running (port 4848)" -ForegroundColor Green
} catch {
    $warnings += "Zero Cache not responding on port 4848 (may not be started)"
    Write-Host "  ⚠️  Zero Cache not responding (not started?)" -ForegroundColor Yellow
}

# Test ZRocket API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8011/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  ✅ ZRocket API is running (port 8011)" -ForegroundColor Green
} catch {
    $warnings += "ZRocket API not responding on port 8011 (may not be started)"
    Write-Host "  ⚠️  ZRocket API not responding (not started?)" -ForegroundColor Yellow
}

Write-Host ""

# Check 5: Test get-queries endpoint
Write-Host "🎯 Testing get-queries endpoint..." -ForegroundColor Yellow

try {
    $body = @{
        queries = @()
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest `
        -Uri "http://localhost:8011/api/zero/get-queries" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body `
        -TimeoutSec 2 `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Endpoint is accessible and responding" -ForegroundColor Green
    } else {
        $warnings += "Endpoint returned status code: $($response.StatusCode)"
        Write-Host "  ⚠️  Endpoint returned unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Message -match "404") {
        $errors += "Endpoint not found - handler may not be implemented yet"
        Write-Host "  ❌ Endpoint not found (handler not implemented?)" -ForegroundColor Red
    } else {
        $warnings += "Could not reach endpoint: $($_.Exception.Message)"
        Write-Host "  ⚠️  Could not reach endpoint (service not started?)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ All checks passed! Configuration looks good." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Ensure all services are running" -ForegroundColor White
    Write-Host "  2. Implement the get-queries handler" -ForegroundColor White
    Write-Host "  3. Test with actual queries" -ForegroundColor White
    exit 0
} else {
    if ($errors.Count -gt 0) {
        Write-Host "❌ Errors found:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  • $error" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "📖 See ZERO_GET_QUERIES_SETUP.md for troubleshooting help" -ForegroundColor Cyan
    exit 1
}
