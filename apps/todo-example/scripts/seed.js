#!/usr/bin/env node

/**
 * Simple script to seed the todo database with sample data
 * Usage: node scripts/seed.js
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-example';
const API_BASE = process.env.API_BASE || 'http://localhost:3001';

const sampleTodos = [
    {
        title: 'Set up MongoDB change source',
        description: 'Configure MongoDB change streams for real-time synchronization',
        priority: 'high',
        completed: true
    },
    {
        title: 'Build todo API endpoints',
        description: 'Create REST API for managing todos with full CRUD operations',
        priority: 'high',
        completed: true
    },
    {
        title: 'Test Zero integration',
        description: 'Verify that changes are properly streamed through Zero change source',
        priority: 'medium',
        completed: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    },
    {
        title: 'Write documentation',
        description: 'Create comprehensive documentation with examples',
        priority: 'medium',
        completed: false
    },
    {
        title: 'Add frontend example',
        description: 'Build a simple React frontend that demonstrates Zero client integration',
        priority: 'low',
        completed: false,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
    },
    {
        title: 'Performance optimization',
        description: 'Optimize change stream performance and add indexing',
        priority: 'low',
        completed: false
    }
];

async function seedDatabase() {
    console.log('🌱 Seeding todo database...');
    console.log(`📡 API Base: ${API_BASE}`);
    
    try {
        // Check if server is running
        const healthCheck = await fetch(`${API_BASE}/todos`);
        if (!healthCheck.ok) {
            throw new Error(`Server not responding: ${healthCheck.status}`);
        }
        
        console.log('✅ Server is running');
        
        // Create sample todos
        for (const todo of sampleTodos) {
            try {
                const response = await fetch(`${API_BASE}/todos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(todo)
                });
                
                if (response.ok) {
                    const created = await response.json();
                    console.log(`✅ Created todo: "${created.title}"`);
                } else {
                    const error = await response.text();
                    console.error(`❌ Failed to create todo "${todo.title}":`, error);
                }
            } catch (err) {
                console.error(`❌ Error creating todo "${todo.title}":`, err.message);
            }
        }
        
        console.log('🎉 Database seeding completed!');
        console.log(`📚 View API docs: ${API_BASE}/api`);
        console.log(`🔍 Check todos: ${API_BASE}/todos`);
        
    } catch (err) {
        console.error('❌ Failed to seed database:', err.message);
        console.log('💡 Make sure the server is running: pnpm dev');
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}

export default seedDatabase;
