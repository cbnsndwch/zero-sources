#!/usr/bin/env node

/**
 * Simple Interval Status Checker
 * No external dependencies - pure Node.js solution
 * Monitors GitHub status using system clock time intervals
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class StatusMonitor {
    constructor(options = {}) {
        this.owner = options.owner || 'cbnsndwch';
        this.repo = options.repo || 'zero-sources';
        this.intervalMs = options.intervalMs || 300000; // 5 minutes default
        this.logFile = options.logFile || 'status-monitor.log';
        this.running = false;
        this.intervalId = null;
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Command failed: ${error.message}`));
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }

    async checkGitHubCLI() {
        try {
            await this.execCommand('gh --version');
            return true;
        } catch (error) {
            this.log('GitHub CLI not found. Please install: winget install GitHub.cli', 'ERROR');
            return false;
        }
    }

    async getRichTextFeaturesStatus() {
        try {
            this.log('Checking Rich Text Features status...');

            // Get open PRs
            const prsCommand = `gh pr list --repo ${this.owner}/${this.repo} --state open --json number,title,author,createdAt,isDraft`;
            const prsOutput = await this.execCommand(prsCommand);
            const prs = JSON.parse(prsOutput || '[]');
            
            // Filter for Rich Text Features PRs
            const richTextPRs = prs.filter(pr => 
                pr.title.match(/Rich Text|#3[3-8]/) || 
                pr.title.match(/Lexical|Text Formatting|Copy.*Paste|Performance/i)
            );

            // Get Issue #10 status
            const issueCommand = `gh issue view 10 --repo ${this.owner}/${this.repo} --json state,title,assignees,labels`;
            const issueOutput = await this.execCommand(issueCommand);
            const issue10 = JSON.parse(issueOutput);

            const status = {
                timestamp: new Date().toISOString(),
                issue10State: issue10.state,
                activeRichTextPRs: richTextPRs.map(pr => ({
                    number: pr.number,
                    title: pr.title,
                    author: pr.author.login,
                    isDraft: pr.isDraft,
                    createdAt: pr.createdAt
                })),
                summary: ''
            };

            // Generate summary
            const prCount = status.activeRichTextPRs.length;
            const draftCount = status.activeRichTextPRs.filter(pr => pr.isDraft).length;
            const readyCount = prCount - draftCount;

            status.summary = `Issue #10 (${issue10.state}) | PRs: ${prCount} total (${draftCount} draft, ${readyCount} ready)`;

            this.log(status.summary);

            if (prCount > 0) {
                status.activeRichTextPRs.forEach(pr => {
                    const draftStatus = pr.isDraft ? '[DRAFT]' : '[READY]';
                    this.log(`  PR #${pr.number}: ${pr.title} ${draftStatus} by ${pr.author}`);
                });
            }

            // Check for ready PRs (alert condition)
            const readyPRs = status.activeRichTextPRs.filter(pr => !pr.isDraft);
            if (readyPRs.length > 0) {
                this.log(`🔔 ALERT: ${readyPRs.length} PR(s) ready for review!`, 'ALERT');
                readyPRs.forEach(pr => {
                    this.log(`   Ready: PR #${pr.number} - ${pr.title}`, 'ALERT');
                });
            }

            // Save status to JSON
            const statusFile = 'last-status.json';
            fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
            this.log(`Status saved to ${statusFile}`);

            return status;

        } catch (error) {
            this.log(`Error checking status: ${error.message}`, 'ERROR');
            return null;
        }
    }

    async checkOnce() {
        this.log('Starting single status check...');
        
        if (!(await this.checkGitHubCLI())) {
            return false;
        }

        const status = await this.getRichTextFeaturesStatus();
        
        if (status) {
            this.log('Status check completed successfully');
            return true;
        } else {
            this.log('Status check failed', 'ERROR');
            return false;
        }
    }

    start() {
        if (this.running) {
            this.log('Monitor is already running', 'WARN');
            return;
        }

        this.log(`Starting continuous monitoring (interval: ${Math.round(this.intervalMs/1000)}s)`);
        this.log(`Monitoring: ${this.owner}/${this.repo}`);
        this.log('Press Ctrl+C to stop');

        this.running = true;
        let iteration = 0;

        const checkStatus = async () => {
            if (!this.running) return;

            iteration++;
            this.log(`=== Monitoring Check #${iteration} ===`);

            await this.getRichTextFeaturesStatus();

            this.log(`Next check in ${Math.round(this.intervalMs/1000)} seconds...`);
            console.log(''); // Empty line for readability
        };

        // Initial check
        this.checkGitHubCLI().then(hasGH => {
            if (hasGH) {
                checkStatus();
                this.intervalId = setInterval(checkStatus, this.intervalMs);
            } else {
                this.stop();
            }
        });

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            this.log('Received SIGINT, stopping monitor...');
            this.stop();
        });
    }

    stop() {
        if (!this.running) return;

        this.running = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.log('Monitor stopped');
        process.exit(0);
    }
}

// CLI Interface
function printUsage() {
    console.log(`
Usage: node status-monitor.js [options]

Options:
    --once              Run single check only (default: continuous)
    --interval <mins>   Check interval in minutes (default: 5)
    --owner <owner>     GitHub repository owner (default: cbnsndwch)
    --repo <repo>       GitHub repository name (default: zero-sources)
    --log <file>        Log file path (default: status-monitor.log)
    --help              Show this help

Examples:
    node status-monitor.js --once                    # Single check
    node status-monitor.js --interval 10             # Check every 10 minutes
    node status-monitor.js --owner myorg --repo myapp # Different repository
`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};
let mode = 'continuous';

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
        case '--help':
            printUsage();
            process.exit(0);
            break;
        case '--once':
            mode = 'once';
            break;
        case '--interval':
            const minutes = parseInt(args[++i]);
            if (isNaN(minutes) || minutes < 1) {
                console.error('Error: Interval must be a positive number');
                process.exit(1);
            }
            options.intervalMs = minutes * 60 * 1000;
            break;
        case '--owner':
            options.owner = args[++i];
            break;
        case '--repo':
            options.repo = args[++i];
            break;
        case '--log':
            options.logFile = args[++i];
            break;
        default:
            console.error(`Unknown option: ${arg}`);
            printUsage();
            process.exit(1);
    }
}

// Main execution
async function main() {
    console.log('🚀 GitHub Status Monitor Starting');
    
    const monitor = new StatusMonitor(options);
    
    if (mode === 'once') {
        const success = await monitor.checkOnce();
        process.exit(success ? 0 : 1);
    } else {
        monitor.start();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = StatusMonitor;
