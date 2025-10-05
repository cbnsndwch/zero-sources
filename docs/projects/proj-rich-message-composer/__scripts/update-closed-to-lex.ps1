# Update closed [RMC] issues to [LEX] prefix
Write-Host "Starting update of closed issues to [LEX] prefix..." -ForegroundColor Cyan

# Define the issues to update
$issuesToUpdate = @(
    @{Number=9; OldTitle="[EPIC] Foundation & Core Lexical Integration"; NewTitle="[LEX][E01] Foundation & Core Lexical Integration"},
    @{Number=14; OldTitle="Setup Lexical packages and dependencies"; NewTitle="[LEX][E01_01] Setup Lexical packages and dependencies"},
    @{Number=15; OldTitle="Create basic RichMessageEditor component"; NewTitle="[LEX][E01_02] Create basic RichMessageEditor component"},
    @{Number=16; OldTitle="Implement SerializedEditorState output compliance"; NewTitle="[LEX][E01_03] Implement SerializedEditorState output compliance"},
    @{Number=18; OldTitle="Implement text formatting plugins (bold, italic, underline, strikethrough)"; NewTitle="[LEX][E01_04] Implement text formatting plugins (bold, italic, underline, strikethrough)"},
    @{Number=19; OldTitle="Implement MentionsPlugin with autocomplete functionality"; NewTitle="[LEX][E01_05] Implement MentionsPlugin with autocomplete functionality"},
    @{Number=33; OldTitle="Implement Lexical Rich Text Editor Foundation"; NewTitle="[LEX][E01] Implement Lexical Rich Text Editor Foundation"},
    @{Number=34; OldTitle="Add Text Formatting (Bold, Italic, Underline, Strikethrough)"; NewTitle="[LEX][E02_01] Add Text Formatting (Bold, Italic, Underline, Strikethrough)"},
    @{Number=37; OldTitle="Implement Copy/Paste Support for Rich Text"; NewTitle="[LEX][E02_02] Implement Copy/Paste Support for Rich Text"},
    @{Number=38; OldTitle="Performance Optimization and Cross-Browser Testing"; NewTitle="[LEX][E02_03] Performance Optimization and Cross-Browser Testing"}
)

$updateCount = 0

foreach ($issue in $issuesToUpdate) {
    Write-Host "Updating issue #$($issue.Number)..." -ForegroundColor Yellow
    gh issue edit $issue.Number --title $issue.NewTitle
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Updated #$($issue.Number)" -ForegroundColor Green
        $updateCount++
    } else {
        Write-Host "  ✗ Failed to update #$($issue.Number)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

Write-Host "`n[LEX] prefix update for closed issues complete!" -ForegroundColor Green
Write-Host "Updated $updateCount closed issues" -ForegroundColor Cyan
