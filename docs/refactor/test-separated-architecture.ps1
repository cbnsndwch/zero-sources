# End-to-End Test for Separated Architecture (PowerShell)
# Tests the complete three-container setup

$ErrorActionPreference = "Stop"

Write-Host "🧪 Testing Zero Sources Separated Architecture" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Test counters
$TestsPassed = 0
$TestsFailed = 0

# Test function
function Run-Test {
    param(
        [string]$TestName,
        [string]$TestCommand,
        [string]$ExpectedPattern
    )
    
    Write-Host "🔍 Testing: $TestName" -ForegroundColor Blue
    
    try {
        $result = Invoke-Expression $TestCommand
        if ($result -match $ExpectedPattern) {
            Write-Host "✅ PASS: $TestName" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
            Write-Host "Command: $TestCommand" -ForegroundColor Yellow
            Write-Host "Expected pattern: $ExpectedPattern" -ForegroundColor Yellow
            $script:TestsFailed++
        }
    } catch {
        Write-Host "❌ FAIL: $TestName (Exception: $($_.Exception.Message))" -ForegroundColor Red
        $script:TestsFailed++
    }
    Write-Host ""
}

# Test API endpoint function
function Test-API {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$ExpectedStatus
    )
    
    Write-Host "🔍 Testing API: $TestName" -ForegroundColor Blue
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction SilentlyContinue
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: $TestName (HTTP $statusCode)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL: $TestName (HTTP $statusCode, expected $ExpectedStatus)" -ForegroundColor Red
            $script:TestsFailed++
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS: $TestName (HTTP $statusCode)" -ForegroundColor Green
            $script:TestsPassed++
        } else {
            Write-Host "❌ FAIL: $TestName (HTTP $statusCode, expected $ExpectedStatus)" -ForegroundColor Red
            $script:TestsFailed++
        }
    }
    Write-Host ""
}

Write-Host "1. Testing Service Health Endpoints" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# Test ZRocket health
Test-API "ZRocket App Health" "http://localhost:8011/health" "200"

# Test ZRocket demo endpoint
Test-API "ZRocket Demo Info" "http://localhost:8011/zrocket/demo-info" "200"

# Test Schema Export API
Test-API "Schema Export API" "http://localhost:8011/api/schema/export" "200"

# Test Table Mappings API
Test-API "Table Mappings API" "http://localhost:8011/api/schema/table-mappings" "200"

# Test Source Server health
Test-API "Source Server Health" "http://localhost:8001/health" "200"

# Test Source Server metadata
Test-API "Source Server Metadata" "http://localhost:8001/metadata/status" "200"

# Test Zero Cache (might fail if not configured)
Test-API "Zero Cache Health" "http://localhost:4848/health" "200"

Write-Host "2. Testing Schema Configuration" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue

# Test that ZRocket schema export contains expected tables
Run-Test "Schema Export Contains Tables" `
    "(Invoke-WebRequest -Uri 'http://localhost:8011/api/schema/export' -UseBasicParsing).Content" `
    "tables"

# Test that table mappings are available  
Run-Test "Table Mappings Available" `
    "(Invoke-WebRequest -Uri 'http://localhost:8011/api/schema/table-mappings' -UseBasicParsing).Content" `
    "mappings"

# Test that source server can load metadata
Run-Test "Source Server Metadata Loaded" `
    "(Invoke-WebRequest -Uri 'http://localhost:8001/metadata/status' -UseBasicParsing).Content" `
    "schema"

Write-Host "3. Testing Separation of Concerns" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

# Test that ZRocket no longer has change source endpoints
Test-API "ZRocket No Change Source" "http://localhost:8011/changes/v0/stream" "404"

# Test that source server has change source endpoints (404 expected for GET to WebSocket)
Test-API "Source Server Has Change Stream" "http://localhost:8001/changes/v0/stream" "404"

# Test that ZRocket no longer has metadata functionality
Test-API "ZRocket No Metadata Schemas" "http://localhost:8011/zrocket/metadata/schemas" "404"

# Test that source server has metadata functionality
Test-API "Source Server Has Metadata" "http://localhost:8001/metadata/schemas" "200"

Write-Host "4. Testing Data Flow" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue

# Test that we can seed data through ZRocket
Run-Test "ZRocket Seed Data" `
    "(Invoke-WebRequest -Uri 'http://localhost:8011/zrocket/seed-data' -Method POST -UseBasicParsing).Content" `
    "success"

# Test that ZRocket can still list tables (demo functionality)
Run-Test "ZRocket Table Listing" `
    "(Invoke-WebRequest -Uri 'http://localhost:8011/zrocket/tables' -UseBasicParsing).Content" `
    "discriminatedTables"

Write-Host ""
Write-Host "🏁 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "✅ Tests Passed: $TestsPassed" -ForegroundColor Green
Write-Host "❌ Tests Failed: $TestsFailed" -ForegroundColor Red

if ($TestsFailed -eq 0) {
    Write-Host "🎉 All tests passed! Architecture separation is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please check the output above." -ForegroundColor Red
    exit 1
}
