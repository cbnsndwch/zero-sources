# Script to link existing ZSQ issues to GitHub Project #4
# All issues have already been created, we just need to add them to the project

param(
    [string]$Owner = "cbnsndwch",
    [string]$Repo = "zero-sources",
    [string]$ProjectNumber = "4"
)

$ErrorActionPreference = "Stop"

# Check if GitHub CLI is installed
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/"
    exit 1
}

# Check if authenticated
try {
    $null = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
} catch {
    Write-Error "Not authenticated with GitHub CLI. Please run 'gh auth login'"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Link ZSQ Issues to GitHub Project" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get all ZSQ issues
Write-Host "Fetching all [ZSQ] issues..." -ForegroundColor Yellow
$issuesJson = gh issue list --repo "$Owner/$Repo" --search "[ZSQ]" --limit 100 --json number,title,state --state all
$issues = $issuesJson | ConvertFrom-Json

Write-Host "Found $($issues.Count) issues with [ZSQ] tag`n" -ForegroundColor Green

# Sort issues by number for cleaner output
$issues = $issues | Sort-Object -Property number

$successCount = 0
$failCount = 0
$alreadyInProject = 0

foreach ($issue in $issues) {
    $issueNumber = $issue.number
    $issueTitle = $issue.title
    $issueUrl = "https://github.com/$Owner/$Repo/issues/$issueNumber"
    
    Write-Host "Processing #$issueNumber : $issueTitle" -ForegroundColor Yellow
    
    try {
        # Try to add the issue to the project
        $result = gh project item-add $ProjectNumber --owner $Owner --url $issueUrl 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Added to project" -ForegroundColor Green
            $successCount++
        } else {
            # Check if it's already in the project
            if ($result -match "already exists" -or $result -match "already in") {
                Write-Host "  ℹ Already in project" -ForegroundColor Cyan
                $alreadyInProject++
            } else {
                Write-Host "  ✗ Failed: $result" -ForegroundColor Red
                $failCount++
            }
        }
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
        $failCount++
    }
    
    # Small delay to avoid rate limiting
    Start-Sleep -Milliseconds 300
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Total issues processed: $($issues.Count)" -ForegroundColor White
Write-Host "Successfully added: $successCount" -ForegroundColor Green
Write-Host "Already in project: $alreadyInProject" -ForegroundColor Cyan
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "White" })

Write-Host "`nProject URL: https://github.com/users/$Owner/projects/$ProjectNumber" -ForegroundColor Green

if ($successCount -gt 0 -or $alreadyInProject -gt 0) {
    Write-Host "`n✓ All ZSQ issues are now in the project!" -ForegroundColor Green
}
