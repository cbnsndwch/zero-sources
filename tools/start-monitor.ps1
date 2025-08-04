# Quick Start Monitor for Rich Text Features
# Usage examples:
#   .\start-monitor.ps1                    # Check every 10 minutes
#   .\start-monitor.ps1 -Minutes 5         # Check every 5 minutes  
#   .\start-monitor.ps1 -Once              # Single check only

param(
    [int]$Minutes = 10,
    [switch]$Once = $false,
    [string]$LogFile = "rich-text-monitor.log"
)

$IntervalSeconds = $Minutes * 60

Write-Host "🚀 Rich Text Features Status Monitor" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

if ($Once) {
    Write-Host "📊 Running single status check..."
    & "$PSScriptRoot\status-monitor.ps1" -Owner "cbnsndwch" -Repo "zero-sources"
} else {
    Write-Host "⏰ Starting continuous monitoring (every $Minutes minutes)" -ForegroundColor Yellow
    Write-Host "📁 Logs: $LogFile" -ForegroundColor Cyan
    Write-Host "🛑 Press Ctrl+C to stop" -ForegroundColor Red
    Write-Host ""
    
    try {
        & "$PSScriptRoot\status-monitor.ps1" -IntervalSeconds $IntervalSeconds -Owner "cbnsndwch" -Repo "zero-sources" -Continuous
    } catch {
        Write-Host "❌ Monitor stopped: $_" -ForegroundColor Red
    }
}

Write-Host "✅ Monitor session ended." -ForegroundColor Green
