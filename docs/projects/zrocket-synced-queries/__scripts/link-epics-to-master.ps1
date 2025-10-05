# Script to update epic issues to reference the master project issue
# Adds a link back to the master issue in each epic

param(
    [string]$Owner = "cbnsndwch",
    [string]$Repo = "zero-sources",
    [int]$MasterIssue = 95
)

$ErrorActionPreference = "Stop"

# Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Link Epics to Master Issue" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Epic issues to update
$epics = @(
    @{ Number = 61; Title = "[E01] Infrastructure Setup" },
    @{ Number = 62; Title = "[E02] Query Definitions" },
    @{ Number = 63; Title = "[E03] Permission Enforcement" },
    @{ Number = 64; Title = "[E04] Testing & QA" },
    @{ Number = 65; Title = "[E05] Deployment" }
)

$successCount = 0

foreach ($epic in $epics) {
    $issueNumber = $epic.Number
    $issueTitle = $epic.Title
    
    Write-Host "Updating #$issueNumber $issueTitle..." -ForegroundColor Yellow
    
    $commentBody = @"
📋 **Part of Master Project**: #$MasterIssue

This epic is one of 5 major components of the ZRocket Synced Queries implementation. See the master issue for full project overview, goals, and timeline.
"@
    
    try {
        $result = gh issue comment $issueNumber --repo "$Owner/$Repo" --body $commentBody 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Added reference to master issue" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ Failed: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 300
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Epics updated: $successCount / $($epics.Count)" -ForegroundColor $(if ($successCount -eq $epics.Count) { "Green" } else { "Yellow" })
Write-Host "`nMaster Issue: https://github.com/$Owner/$Repo/issues/$MasterIssue" -ForegroundColor Green
