/**
 * Cross-browser performance tests for Rich Message Editor
 * Tests performance across Chrome, Firefox, Safari, and Edge
 */

import { test, expect, devices } from '@playwright/test';

// Performance thresholds
const PERFORMANCE_TARGETS = {
    initialization: 100, // ms
    keystroke: 16, // ms
    serialization: 50, // ms
    deserialization: 50, // ms
    undoRedo: 100, // ms
    memoryLimit: 50 * 1024 * 1024, // 50MB
};

// Helper function to measure editor initialization
async function measureInitialization(page: any) {
    const startTime = Date.now();
    
    await page.goto('/rich-editor-demo');
    
    // Wait for editor to be ready
    await page.waitForSelector('[data-testid="message-editor"]', { state: 'visible' });
    await page.waitForFunction(() => {
        const editor = document.querySelector('[data-testid="message-editor"]');
        return editor && editor.getAttribute('contenteditable') === 'true';
    });
    
    return Date.now() - startTime;
}

// Helper function to measure keystroke latency
async function measureKeystrokeLatency(page: any) {
    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    
    const latencies: number[] = [];
    const testText = 'Testing keystroke performance';
    
    for (const char of testText) {
        const startTime = Date.now();
        await editor.type(char, { delay: 0 });
        const latency = Date.now() - startTime;
        latencies.push(latency);
    }
    
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
}

// Helper function to measure serialization time
async function measureSerialization(page: any) {
    const editor = page.locator('[data-testid="message-editor"]');
    await editor.click();
    await editor.type('Test message with **bold** and *italic* formatting');
    
    const startTime = Date.now();
    await editor.press('Enter');
    const endTime = Date.now();
    
    return endTime - startTime;
}

// Helper function to get memory usage (Chrome only)
async function getMemoryUsage(page: any) {
    try {
        const memoryInfo = await page.evaluate(() => {
            return (performance as any).memory?.usedJSHeapSize || 0;
        });
        return memoryInfo;
    } catch {
        return 0; // Not available in all browsers
    }
}

// Desktop browsers
const desktopBrowsers = [
    { name: 'Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Edge', use: { ...devices['Desktop Edge'] } },
];

// Mobile browsers
const mobileBrowsers = [
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'Mobile Firefox', use: { ...devices['Pixel 5'], browserName: 'firefox' } },
];

// Test suite for each browser
for (const browser of [...desktopBrowsers, ...mobileBrowsers]) {
    test.describe(`${browser.name} Performance Tests`, () => {
        test.use(browser.use);

        test('should meet initialization performance target', async ({ page }) => {
            const initTime = await measureInitialization(page);
            
            expect(initTime).toBeLessThan(PERFORMANCE_TARGETS.initialization);
            
            // Log performance data
            console.log(`${browser.name} - Initialization: ${initTime}ms`);
        });

        test('should maintain keystroke latency under 16ms', async ({ page }) => {
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const avgLatency = await measureKeystrokeLatency(page);
            
            expect(avgLatency).toBeLessThan(PERFORMANCE_TARGETS.keystroke);
            
            console.log(`${browser.name} - Avg Keystroke Latency: ${avgLatency.toFixed(2)}ms`);
        });

        test('should serialize messages efficiently', async ({ page }) => {
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const serializationTime = await measureSerialization(page);
            
            expect(serializationTime).toBeLessThan(PERFORMANCE_TARGETS.serialization);
            
            console.log(`${browser.name} - Serialization: ${serializationTime}ms`);
        });

        test('should handle large content efficiently', async ({ page }) => {
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const editor = page.locator('[data-testid="message-editor"]');
            await editor.click();
            
            // Type large content
            const largeText = 'Word '.repeat(250); // ~1250 characters
            
            const startTime = Date.now();
            await editor.type(largeText, { delay: 0 });
            const typingTime = Date.now() - startTime;
            
            expect(typingTime).toBeLessThan(500); // Should complete in under 500ms
            
            console.log(`${browser.name} - Large Content Typing: ${typingTime}ms`);
        });

        test('should support undo/redo operations efficiently', async ({ page }) => {
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const editor = page.locator('[data-testid="message-editor"]');
            await editor.click();
            await editor.type('Test content for undo/redo');
            
            // Test undo
            const undoStart = Date.now();
            await page.keyboard.press('Control+z');
            const undoTime = Date.now() - undoStart;
            
            // Test redo
            const redoStart = Date.now();
            await page.keyboard.press('Control+y');
            const redoTime = Date.now() - redoStart;
            
            expect(undoTime).toBeLessThan(PERFORMANCE_TARGETS.undoRedo);
            expect(redoTime).toBeLessThan(PERFORMANCE_TARGETS.undoRedo);
            
            console.log(`${browser.name} - Undo: ${undoTime}ms, Redo: ${redoTime}ms`);
        });

        test('should maintain stable memory usage', async ({ page }) => {
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const editor = page.locator('[data-testid="message-editor"]');
            await editor.click();
            
            const initialMemory = await getMemoryUsage(page);
            
            // Simulate extended typing session
            for (let i = 0; i < 50; i++) {
                await editor.type(`Message ${i} with some content `, { delay: 0 });
                if (i % 10 === 0) {
                    await page.keyboard.press('Control+a');
                    await page.keyboard.press('Delete');
                }
            }
            
            const finalMemory = await getMemoryUsage(page);
            const memoryIncrease = finalMemory - initialMemory;
            
            if (initialMemory > 0) { // Only check if memory API is available
                expect(memoryIncrease).toBeLessThan(PERFORMANCE_TARGETS.memoryLimit);
                console.log(`${browser.name} - Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            } else {
                console.log(`${browser.name} - Memory API not available`);
            }
        });
    });
}

// Accessibility tests across browsers
test.describe('Cross-Browser Accessibility', () => {
    for (const browser of desktopBrowsers) {
        test(`${browser.name} - should be keyboard navigable`, async ({ page }) => {
            test.use(browser.use);
            
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            // Navigate using keyboard
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab'); // Should focus editor
            
            // Check focus is on editor
            const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(['DIV', 'TEXTAREA', 'INPUT']).toContain(focusedElement);
            
            // Test keyboard shortcuts
            await page.keyboard.type('Bold text');
            await page.keyboard.press('Control+a');
            await page.keyboard.press('Control+b');
            
            // Verify formatting was applied
            const hasFormatting = await page.evaluate(() => {
                const editor = document.querySelector('[contenteditable]');
                return editor?.innerHTML.includes('bold') || editor?.innerHTML.includes('font-weight');
            });
            
            expect(hasFormatting).toBeTruthy();
        });

        test(`${browser.name} - should have proper ARIA attributes`, async ({ page }) => {
            test.use(browser.use);
            
            await page.goto('/rich-editor-demo');
            
            // Switch to rich editor mode
            await page.locator('#rich-editor-mode').check();
            
            const editor = page.locator('[data-testid="message-editor"]');
            
            // Check ARIA attributes
            await expect(editor).toHaveAttribute('role', 'textbox');
            await expect(editor).toHaveAttribute('aria-label');
            await expect(editor).toHaveAttribute('contenteditable', 'true');
        });
    }
});

// Performance regression detection
test.describe('Performance Regression Detection', () => {
    test('should detect initialization performance regression', async ({ page }) => {
        const samples: number[] = [];
        
        // Take multiple samples
        for (let i = 0; i < 5; i++) {
            const initTime = await measureInitialization(page);
            samples.push(initTime);
        }
        
        const average = samples.reduce((a, b) => a + b, 0) / samples.length;
        const variance = samples.reduce((a, b) => a + Math.pow(b - average, 2), 0) / samples.length;
        const stdDev = Math.sqrt(variance);
        
        expect(average).toBeLessThan(PERFORMANCE_TARGETS.initialization);
        expect(stdDev).toBeLessThan(20); // Consistent performance (low variance)
        
        console.log(`Performance Stats - Avg: ${average.toFixed(2)}ms, StdDev: ${stdDev.toFixed(2)}ms`);
    });
});

// Bundle size analysis
test.describe('Bundle Size Analysis', () => {
    test('should not exceed bundle size targets', async ({ page }) => {
        await page.goto('/rich-editor-demo');
        
        // Analyze network requests for JS bundles
        const responses = await page.evaluate(() => {
            return performance.getEntriesByType('resource')
                .filter((entry: any) => entry.name.includes('.js'))
                .map((entry: any) => ({
                    name: entry.name,
                    size: entry.transferSize || 0
                }));
        });
        
        const totalBundleSize = responses.reduce((total, response) => total + response.size, 0);
        const totalBundleSizeMB = totalBundleSize / (1024 * 1024);
        
        console.log(`Total JS Bundle Size: ${totalBundleSizeMB.toFixed(2)}MB`);
        
        // Should not exceed reasonable limits
        expect(totalBundleSizeMB).toBeLessThan(5); // 5MB total limit
        
        // Log individual bundle sizes
        responses.forEach(response => {
            const sizeMB = response.size / (1024 * 1024);
            if (sizeMB > 0.5) { // Log bundles > 500KB
                console.log(`Large bundle: ${response.name} - ${sizeMB.toFixed(2)}MB`);
            }
        });
    });
});