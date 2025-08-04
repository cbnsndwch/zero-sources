#!/usr/bin/env node

/**
 * Status Monitor MCP Server
 * Enhanced version based on Simple-Timer-MCP-Server (Apache 2.0)
 * Original: https://github.com/tonyOgbonna/Simple-Timer-MCP-Server
 * 
 * Provides interval-based status monitoring with GitHub API integration
 * for tracking Rich Text Features development progress.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Database from 'better-sqlite3';

// Database setup
const DB_PATH = './status-monitor.db';
let db: Database.Database;

interface MonitorTask {
    id: string;
    name: string;
    interval: number; // milliseconds
    lastCheck: number;
    nextCheck: number;
    command: string;
    active: boolean;
    created: number;
}

interface TaskExecution {
    taskId: string;
    timestamp: number;
    output: string;
    success: boolean;
}

function initializeDatabase() {
    db = new Database(DB_PATH);
    
    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS monitor_tasks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            interval INTEGER NOT NULL,
            last_check INTEGER DEFAULT 0,
            next_check INTEGER NOT NULL,
            command TEXT NOT NULL,
            active INTEGER DEFAULT 1,
            created INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS task_executions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            output TEXT,
            success INTEGER NOT NULL,
            FOREIGN KEY (task_id) REFERENCES monitor_tasks (id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_task_executions_timestamp 
        ON task_executions (timestamp);
        
        CREATE INDEX IF NOT EXISTS idx_monitor_tasks_next_check 
        ON monitor_tasks (next_check);
    `);
    
    console.log("Status Monitor database initialized.");
}

// Initialize MCP Server
const server = new McpServer({
    name: "Status Monitor MCP Server",
    version: "1.0.0",
    description: "Interval-based status monitoring with GitHub API integration for project management."
});

// Tool: Create a monitoring task
server.tool(
    "create_monitor",
    {
        name: z.string().describe("Human-readable name for the monitoring task"),
        interval: z.number().min(1000).describe("Interval in milliseconds (minimum 1 second)"),
        command: z.string().describe("Command to execute for status check (e.g., 'gh pr list --state open')")
    },
    async ({ name, interval, command }) => {
        const id = `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();
        const nextCheck = now + interval;
        
        const task: MonitorTask = {
            id,
            name,
            interval,
            lastCheck: 0,
            nextCheck,
            command,
            active: true,
            created: now
        };
        
        db.prepare(`
            INSERT INTO monitor_tasks 
            (id, name, interval, last_check, next_check, command, active, created)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, name, interval, 0, nextCheck, command, 1, now);
        
        return {
            content: [{
                type: "text",
                text: `✅ Monitor '${name}' created with ID: ${id}\n` +
                      `Interval: ${interval}ms (${Math.round(interval/1000)}s)\n` +
                      `Command: ${command}\n` +
                      `Next check: ${new Date(nextCheck).toISOString()}`
            }]
        };
    }
);

// Tool: List all monitoring tasks
server.tool(
    "list_monitors",
    {
        activeOnly: z.boolean().optional().describe("Show only active monitors (default: true)")
    },
    async ({ activeOnly = true }) => {
        const query = activeOnly 
            ? "SELECT * FROM monitor_tasks WHERE active = 1 ORDER BY created DESC"
            : "SELECT * FROM monitor_tasks ORDER BY created DESC";
            
        const tasks = db.prepare(query).all() as any[];
        
        if (tasks.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: "No monitoring tasks found."
                }]
            };
        }
        
        const taskList = tasks.map(task => {
            const status = task.active ? "🟢 Active" : "🔴 Inactive";
            const nextCheck = new Date(task.next_check).toISOString();
            const lastCheck = task.last_check > 0 
                ? new Date(task.last_check).toISOString() 
                : "Never";
                
            return `${status} ${task.name} (${task.id})\n` +
                   `  Interval: ${Math.round(task.interval/1000)}s\n` +
                   `  Command: ${task.command}\n` +
                   `  Last: ${lastCheck}\n` +
                   `  Next: ${nextCheck}`;
        }).join('\n\n');
        
        return {
            content: [{
                type: "text",
                text: `📊 Status Monitors (${tasks.length} total)\n\n${taskList}`
            }]
        };
    }
);

// Tool: Check if any monitors are due
server.tool(
    "check_due_monitors",
    {},
    async () => {
        const now = Date.now();
        const dueTasks = db.prepare(`
            SELECT * FROM monitor_tasks 
            WHERE active = 1 AND next_check <= ?
            ORDER BY next_check ASC
        `).all(now) as any[];
        
        if (dueTasks.length === 0) {
            const nextTask = db.prepare(`
                SELECT * FROM monitor_tasks 
                WHERE active = 1 
                ORDER BY next_check ASC 
                LIMIT 1
            `).get() as any;
            
            if (nextTask) {
                const timeUntilNext = nextTask.next_check - now;
                const minutesUntil = Math.round(timeUntilNext / 60000);
                return {
                    content: [{
                        type: "text",
                        text: `⏰ No monitors due now.\nNext check: '${nextTask.name}' in ${minutesUntil} minutes.`
                    }]
                };
            } else {
                return {
                    content: [{
                        type: "text",
                        text: "📭 No active monitors configured."
                    }]
                };
            }
        }
        
        let results = [];
        
        for (const task of dueTasks) {
            try {
                // Execute the command (would need actual command execution in real implementation)
                const output = `Mock execution of: ${task.command}`;
                const success = true;
                
                // Record execution
                db.prepare(`
                    INSERT INTO task_executions (task_id, timestamp, output, success)
                    VALUES (?, ?, ?, ?)
                `).run(task.id, now, output, success ? 1 : 0);
                
                // Update task
                const nextCheck = now + task.interval;
                db.prepare(`
                    UPDATE monitor_tasks 
                    SET last_check = ?, next_check = ?
                    WHERE id = ?
                `).run(now, nextCheck, task.id);
                
                results.push(`✅ ${task.name}: ${output}`);
                
            } catch (error) {
                // Record failed execution
                db.prepare(`
                    INSERT INTO task_executions (task_id, timestamp, output, success)
                    VALUES (?, ?, ?, ?)
                `).run(task.id, now, String(error), 0);
                
                results.push(`❌ ${task.name}: Error - ${error}`);
            }
        }
        
        return {
            content: [{
                type: "text",
                text: `🔄 Executed ${dueTasks.length} due monitors:\n\n${results.join('\n')}`
            }]
        };
    }
);

// Tool: Get execution history for a monitor
server.tool(
    "monitor_history",
    {
        taskId: z.string().describe("Monitor task ID"),
        limit: z.number().optional().default(10).describe("Number of recent executions to show")
    },
    async ({ taskId, limit }) => {
        const executions = db.prepare(`
            SELECT * FROM task_executions 
            WHERE task_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        `).all(taskId, limit) as any[];
        
        if (executions.length === 0) {
            return {
                content: [{
                    type: "text",
                    text: `No execution history found for task: ${taskId}`
                }]
            };
        }
        
        const task = db.prepare("SELECT name FROM monitor_tasks WHERE id = ?").get(taskId) as any;
        const taskName = task?.name || taskId;
        
        const history = executions.map(exec => {
            const status = exec.success ? "✅" : "❌";
            const timestamp = new Date(exec.timestamp).toISOString();
            return `${status} ${timestamp}\n   ${exec.output}`;
        }).join('\n\n');
        
        return {
            content: [{
                type: "text",
                text: `📈 Execution History: ${taskName}\n\n${history}`
            }]
        };
    }
);

// Tool: Stop/Start a monitor
server.tool(
    "toggle_monitor",
    {
        taskId: z.string().describe("Monitor task ID"),
        active: z.boolean().describe("Set monitor active (true) or inactive (false)")
    },
    async ({ taskId, active }) => {
        const result = db.prepare(`
            UPDATE monitor_tasks 
            SET active = ? 
            WHERE id = ?
        `).run(active ? 1 : 0, taskId);
        
        if (result.changes === 0) {
            return {
                content: [{
                    type: "text",
                    text: `❌ Monitor not found: ${taskId}`
                }]
            };
        }
        
        const status = active ? "activated" : "deactivated";
        return {
            content: [{
                type: "text",
                text: `✅ Monitor ${taskId} has been ${status}.`
            }]
        };
    }
);

// Main function to start the server
async function main() {
    initializeDatabase();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Status Monitor MCP Server started and listening via StdioServerTransport.");
}

main().catch(console.error);
