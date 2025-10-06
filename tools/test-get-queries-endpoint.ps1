# Test Get-Queries Endpoint
# Usage: .\test-get-queries-endpoint.ps1

param(
    [string]$Url = "http://localhost:8011/api/zero/get-queries",
    [string]$Token = ""
)

Write-Host "🧪 Testing Zero Get-Queries Endpoint" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Target URL: $Url" -ForegroundColor White
Write-Host ""

# Test 1: Empty query (no auth)
Write-Host "Test 1: Empty query without authentication" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

$body1 = @{
    queries = @()
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-WebRequest `
        -Uri $Url `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body1 `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    Write-Host $response1.Content -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response: $errorBody" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ""

# Test 2: With authentication (if token provided)
if ($Token) {
    Write-Host "Test 2: Query with authentication" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    
    $body2 = @{
        queries = @(
            @{
                name = "publicChannels"
                args = @()
            }
        )
    } | ConvertTo-Json -Depth 10
    
    try {
        $response2 = Invoke-WebRequest `
            -Uri $Url `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $Token"
            } `
            -Body $body2 `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        Write-Host "✅ Status: $($response2.StatusCode)" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor White
        
        # Pretty print JSON
        $jsonResponse = $response2.Content | ConvertFrom-Json
        Write-Host ($jsonResponse | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error response: $errorBody" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host ""
} else {
    Write-Host "ℹ️  Skipping authenticated tests (no token provided)" -ForegroundColor Cyan
    Write-Host "   Use: .\test-get-queries-endpoint.ps1 -Token 'your-jwt-token'" -ForegroundColor Gray
    Write-Host ""
    Write-Host ""
}

# Test 3: Invalid request
Write-Host "Test 3: Invalid request (missing queries field)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

$body3 = @{
    invalid = "data"
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest `
        -Uri $Url `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $body3 `
        -TimeoutSec 5 `
        -ErrorAction Stop
    
    Write-Host "⚠️  Status: $($response3.StatusCode) (expected 400)" -ForegroundColor Yellow
    Write-Host "Response:" -ForegroundColor White
    Write-Host $response3.Content -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ Correctly rejected with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response: $errorBody" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host ""

# Test 4: Performance test
Write-Host "Test 4: Performance test (5 requests)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor Gray

$times = @()
for ($i = 1; $i -le 5; $i++) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-WebRequest `
            -Uri $Url `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $body1 `
            -TimeoutSec 5 `
            -ErrorAction Stop
        
        $stopwatch.Stop()
        $times += $stopwatch.ElapsedMilliseconds
        Write-Host "  Request $i: $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor White
    } catch {
        $stopwatch.Stop()
        Write-Host "  Request $i: Failed" -ForegroundColor Red
    }
}

if ($times.Count -gt 0) {
    $avg = ($times | Measure-Object -Average).Average
    $min = ($times | Measure-Object -Minimum).Minimum
    $max = ($times | Measure-Object -Maximum).Maximum
    
    Write-Host ""
    Write-Host "Statistics:" -ForegroundColor White
    Write-Host "  Average: $([math]::Round($avg, 2))ms" -ForegroundColor White
    Write-Host "  Min: $($min)ms" -ForegroundColor White
    Write-Host "  Max: $($max)ms" -ForegroundColor White
    
    if ($avg -lt 100) {
        Write-Host "  ✅ Performance is excellent (< 100ms)" -ForegroundColor Green
    } elseif ($avg -lt 500) {
        Write-Host "  ⚠️  Performance is acceptable (< 500ms)" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ Performance may need optimization (> 500ms)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Testing complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check zero-cache logs for forwarding" -ForegroundColor White
Write-Host "  2. Verify queries are being processed" -ForegroundColor White
Write-Host "  3. Test with real client queries" -ForegroundColor White
Write-Host ""
