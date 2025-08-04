# Status Monitoring Tools

Interval-based monitoring tools for tracking Rich Text Features development progress using actual system clock time.

## Overview

These tools help you monitor GitHub repository status at regular intervals, specifically designed for tracking the parallel development work on Rich Text Features (Issue #10).

## Available Solutions

### 1. PowerShell Monitor (Recommended for Windows)

**File**: `status-monitor.ps1`

Simple, reliable PowerShell script that uses GitHub CLI to check status.

```powershell
# Single check
.\tools\status-monitor.ps1

# Continuous monitoring every 5 minutes
.\tools\start-monitor.ps1 -Minutes 5

# Quick start (every 10 minutes)
.\tools\start-monitor.ps1
```

**Features:**
- ✅ No external dependencies (uses GitHub CLI)
- ✅ Real system clock intervals
- ✅ Detailed logging to file
- ✅ Alerts for ready PRs
- ✅ JSON output for integration

### 2. Node.js Monitor (Cross-platform)

**File**: `status-monitor.js`

Pure Node.js solution with no external NPM dependencies.

```bash
# Single check
node tools/status-monitor.js --once

# Monitor every 5 minutes
node tools/status-monitor.js --interval 5

# Custom repository
node tools/status-monitor.js --owner myorg --repo myrepo
```

**Features:**
- ✅ Cross-platform (Windows, macOS, Linux)
- ✅ No external dependencies
- ✅ Built-in CLI argument parsing
- ✅ System clock-based intervals
- ✅ Comprehensive logging

### 3. MCP Server (Advanced - Future)

**File**: `status-monitor.mcp.ts`

Model Context Protocol server for VS Code integration (requires setup).

## Quick Start

### Option 1: PowerShell (Windows - Recommended)

```powershell
# Check if GitHub CLI is installed
gh --version

# If not installed:
winget install GitHub.cli

# Authenticate with GitHub
gh auth login

# Start monitoring every 5 minutes
.\tools\start-monitor.ps1 -Minutes 5
```

### Option 2: Node.js (Any Platform)

```bash
# Navigate to tools directory
cd tools

# Single status check
node status-monitor.js --once

# Start continuous monitoring (10 minutes)
node status-monitor.js --interval 10
```

## What It Monitors

### Rich Text Features (Issue #10)

The monitor tracks:
- **Issue #10 state** (open/closed)
- **Active PRs** related to Rich Text Features (#33-#38)
- **Draft vs Ready status** of PRs
- **Copilot assignments** and progress

### Current Tracking (as of this session)

Based on our analysis, it monitors:
- **Issue #33**: Lexical Foundation & Editor Setup
- **Issue #34**: Text Formatting (Bold, Italic, etc.)
- **Issue #35**: AutoLink Plugin Integration
- **Issue #36**: List Plugin Integration  
- **Issue #37**: Advanced Copy/Paste Support
- **Issue #38**: Performance & Memory Optimization

### Alert Conditions

The monitor will alert when:
- ✅ PRs change from Draft to Ready for Review
- ✅ New PRs are created for Rich Text Features
- ❌ Issues or PRs are closed
- ⚠️ Copilot assignments change

## Output Examples

### Console Output
```
[2025-01-03 10:30:00] [INFO] Checking Rich Text Features status...
[2025-01-03 10:30:02] [INFO] Issue #10 (open) | PRs: 4 total (2 draft, 2 ready)
[2025-01-03 10:30:02] [INFO]   PR #39: Lexical Foundation & Editor Setup [READY] by github-copilot[bot]
[2025-01-03 10:30:02] [INFO]   PR #40: Advanced Copy/Paste Support [DRAFT] by github-copilot[bot]
[2025-01-03 10:30:02] [ALERT] 🔔 ALERT: 2 PR(s) ready for review!
[2025-01-03 10:30:02] [ALERT]    Ready: PR #39 - Lexical Foundation & Editor Setup
```

### JSON Output (`last-status.json`)
```json
{
  "timestamp": "2025-01-03T10:30:00.000Z",
  "issue10State": "open",
  "activeRichTextPRs": [
    {
      "number": 39,
      "title": "Lexical Foundation & Editor Setup",
      "author": "github-copilot[bot]",
      "isDraft": false,
      "createdAt": "2025-01-03T09:15:00Z"
    }
  ],
  "summary": "Issue #10 (open) | PRs: 4 total (2 draft, 2 ready)"
}
```

## Configuration

### Environment Variables (Node.js)
```bash
export GITHUB_OWNER=cbnsndwch
export GITHUB_REPO=zero-sources
export MONITOR_INTERVAL=300  # 5 minutes
```

### PowerShell Parameters
```powershell
# Custom parameters
.\tools\status-monitor.ps1 -Owner "myorg" -Repo "myrepo" -IntervalSeconds 600
```

## Integration Ideas

### VS Code Tasks
Add to `.vscode/tasks.json`:
```json
{
  "label": "Start Status Monitor",
  "type": "shell",
  "command": "node",
  "args": ["tools/status-monitor.js", "--interval", "10"],
  "group": "build",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "panel": "new"
  },
  "isBackground": true
}
```

### GitHub Actions (Future)
Could be integrated into CI/CD for automated status reporting.

### Webhook Integration (Future)
Could be enhanced to receive GitHub webhooks for real-time updates.

## Troubleshooting

### GitHub CLI Issues
```bash
# Check authentication
gh auth status

# Re-authenticate
gh auth login

# Test access
gh repo view cbnsndwch/zero-sources
```

### Permission Issues
```bash
# Check repository access
gh api repos/cbnsndwch/zero-sources

# Check rate limits
gh api rate_limit
```

### Node.js Issues
```bash
# Check Node.js version
node --version  # Should be >= 14.0.0

# Check if script is executable
ls -la tools/status-monitor.js
```

## License

Based on Simple-Timer-MCP-Server (Apache 2.0 License)
- Original: https://github.com/tonyOgbonna/Simple-Timer-MCP-Server
- Modifications: Enhanced for GitHub project management and Rich Text Features monitoring

## Contributing

Feel free to enhance these monitoring tools:
1. Add Slack/Discord notifications
2. Create web dashboard
3. Integrate with project management tools
4. Add more sophisticated alerting logic
