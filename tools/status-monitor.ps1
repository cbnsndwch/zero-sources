# GitHub Status Monitor
# Interval-based monitoring script for Rich Text Features development

param(
    [int]$IntervalSeconds = 300,  # 5 minutes default
    [string]$Owner = "cbnsndwch",
    [string]$Repo = "zero-sources",
    [switch]$Continuous = $false
)

function Write-StatusLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    Add-Content -Path "status-monitor.log" -Value $logMessage
}

function Get-RichTextFeaturesStatus {
    param([string]$Owner, [string]$Repo)
    
    try {
        Write-StatusLog "Checking Rich Text Features status..."
        
        # Check active PRs for Rich Text Features
        $prs = gh pr list --repo "$Owner/$Repo" --state open --json number,title,author,createdAt,isDraft | ConvertFrom-Json
        $richTextPRs = $prs | Where-Object { $_.title -match "Rich Text|#3[3-8]" }
        
        # Check issue #10 status
        $issue10 = gh issue view 10 --repo "$Owner/$Repo" --json state,title,assignees,labels | ConvertFrom-Json
        
        $status = @{
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Issue10State = $issue10.state
            ActiveRichTextPRs = @()
            Summary = ""
        }
        
        foreach ($pr in $richTextPRs) {
            $prDetail = @{
                Number = $pr.number
                Title = $pr.title
                Author = $pr.author.login
                IsDraft = $pr.isDraft
                CreatedAt = $pr.createdAt
            }
            $status.ActiveRichTextPRs += $prDetail
        }
        
        # Generate summary
        $prCount = $status.ActiveRichTextPRs.Count
        $draftCount = ($status.ActiveRichTextPRs | Where-Object { $_.IsDraft }).Count
        $readyCount = $prCount - $draftCount
        
        $status.Summary = "Issue #10 ($($issue10.state)) | PRs: $prCount total ($draftCount draft, $readyCount ready)"
        
        Write-StatusLog $status.Summary
        
        if ($prCount -gt 0) {
            foreach ($pr in $status.ActiveRichTextPRs) {
                $draftStatus = if ($pr.IsDraft) { "[DRAFT]" } else { "[READY]" }
                Write-StatusLog "  PR #$($pr.Number): $($pr.Title) $draftStatus by $($pr.Author)"
            }
        }
        
        return $status
        
    } catch {
        Write-StatusLog "Error checking status: $_" "ERROR"
        return $null
    }
}

function Start-ContinuousMonitoring {
    param([int]$IntervalSeconds, [string]$Owner, [string]$Repo)
    
    Write-StatusLog "Starting continuous monitoring (interval: ${IntervalSeconds}s)"
    Write-StatusLog "Monitoring: $Owner/$Repo"
    Write-StatusLog "Press Ctrl+C to stop"
    
    $iteration = 0
    
    while ($true) {
        $iteration++
        Write-StatusLog "=== Monitoring Check #$iteration ===" "INFO"
        
        $status = Get-RichTextFeaturesStatus -Owner $Owner -Repo $Repo
        
        if ($status) {
            # Check for notable changes (you could enhance this logic)
            $readyPRs = $status.ActiveRichTextPRs | Where-Object { -not $_.IsDraft }
            
            if ($readyPRs.Count -gt 0) {
                Write-StatusLog "🔔 ALERT: $($readyPRs.Count) PR(s) ready for review!" "ALERT"
                foreach ($pr in $readyPRs) {
                    Write-StatusLog "   Ready: PR #$($pr.Number) - $($pr.Title)" "ALERT"
                }
            }
        }
        
        Write-StatusLog "Next check in ${IntervalSeconds} seconds..."
        Write-Host ""
        
        Start-Sleep -Seconds $IntervalSeconds
    }
}

# Main execution
Write-StatusLog "GitHub Status Monitor Starting" "INFO"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-StatusLog "GitHub CLI (gh) not found. Please install: winget install GitHub.cli" "ERROR"
    exit 1
}

if ($Continuous) {
    Start-ContinuousMonitoring -IntervalSeconds $IntervalSeconds -Owner $Owner -Repo $Repo
} else {
    Write-StatusLog "Single status check mode"
    $status = Get-RichTextFeaturesStatus -Owner $Owner -Repo $Repo
    
    if ($status) {
        Write-StatusLog "Status check completed successfully"
        
        # Save status to JSON for other tools to consume
        $status | ConvertTo-Json -Depth 3 | Out-File -FilePath "last-status.json" -Encoding UTF8
        Write-StatusLog "Status saved to last-status.json"
    } else {
        Write-StatusLog "Status check failed" "ERROR"
        exit 1
    }
}
