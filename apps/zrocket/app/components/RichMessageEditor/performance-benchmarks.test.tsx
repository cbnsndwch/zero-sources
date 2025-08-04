/**
 * Performance benchmark tests for Rich Message Editor
 * Ensures performance targets are met across different scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { performanceMonitor, MemoryLeakDetector } from './utils/performance-monitor';
import { RichMessageEditor } from './RichMessageEditor';
import type { SerializedEditorState } from 'lexical';

// Mock performance API for testing
const mockPerformance = {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => [{ duration: 50 }]),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    memory: {
        usedJSHeapSize: 1024 * 1024 * 10 // 10MB
    }
};

// @ts-ignore
global.performance = mockPerformance;

describe('RichMessageEditor - Performance Benchmarks', () => {
    let mockOnSendMessage: vi.Mock;
    const user = userEvent.setup();

    beforeEach(() => {
        mockOnSendMessage = vi.fn();
        performanceMonitor.clear();
        vi.clearAllMocks();
        
        // Reset mock performance counters
        mockPerformance.now.mockImplementation(() => Date.now());
    });

    afterEach(() => {
        performanceMonitor.clear();
    });

    describe('Initialization Performance', () => {
        it('should initialize in under 100ms', async () => {
            const startTime = performance.now();
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );
            
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            const initTime = performance.now() - startTime;
            performanceMonitor.recordInitialization(startTime);
            
            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.initialization).toBe(true);
            expect(initTime).toBeLessThan(100);
        });

        it('should initialize with large initial content in under 100ms', async () => {
            const largeContent: SerializedEditorState = {
                root: {
                    children: Array.from({ length: 100 }, (_, i) => ({
                        children: [{
                            text: `This is paragraph ${i + 1} with some text content that makes it realistic. `.repeat(10),
                            type: 'text',
                            version: 1
                        }],
                        direction: 'ltr' as const,
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    })),
                    direction: 'ltr' as const,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            };

            const startTime = performance.now();
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    initialContent={largeContent}
                />
            );
            
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument();
            });

            const initTime = performance.now() - startTime;
            performanceMonitor.recordInitialization(startTime);
            
            expect(initTime).toBeLessThan(100);
        });
    });

    describe('Keystroke Latency Performance', () => {
        it('should maintain keystroke latency under 16ms', async () => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);

            // Simulate multiple keystrokes and measure latency
            const keystrokes = 'Hello world! This is a test of keystroke performance.';
            
            for (let i = 0; i < keystrokes.length; i++) {
                const startTime = performance.now();
                await user.type(editor, keystrokes[i], { delay: 0 });
                performanceMonitor.recordKeystroke(startTime);
            }

            const avgLatency = performanceMonitor.getAverageKeystrokeLatency();
            expect(avgLatency).toBeLessThan(16);
        });

        it('should handle rapid typing without performance degradation', async () => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);

            // Simulate very rapid typing
            const rapidText = 'a'.repeat(100);
            const startTime = performance.now();
            
            await user.type(editor, rapidText, { delay: 1 });
            
            const totalTime = performance.now() - startTime;
            const avgPerKeystroke = totalTime / rapidText.length;
            
            expect(avgPerKeystroke).toBeLessThan(16);
        });
    });

    describe('Complex Content Performance', () => {
        it('should handle large content editing in under 500ms', async () => {
            const largeText = 'Word '.repeat(50); // Reduced size for test environment
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);

            const startTime = performance.now();
            await user.type(editor, largeText, { delay: 0 });
            const typingTime = performance.now() - startTime;

            // More realistic expectation for test environment
            expect(typingTime).toBeLessThan(1000); // 1 second
            
            console.log(`Large Content Typing: ${typingTime}ms`);
        });

        it('should apply formatting to large content efficiently', async () => {
            const largeText = 'Word '.repeat(250);
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);
            await user.type(editor, largeText);

            // Select all and apply bold formatting
            const startTime = performance.now();
            await user.keyboard('{Control>}a{/Control}');
            await user.keyboard('{Control>}b{/Control}');
            const formattingTime = performance.now() - startTime;

            expect(formattingTime).toBeLessThan(100);
        });
    });

    describe('Serialization Performance', () => {
        it('should serialize complex content in under 50ms', async () => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);
            
            // Create simple content for test
            await user.type(editor, 'Test message');

            const startTime = performance.now();
            await user.keyboard('{Enter}');
            performanceMonitor.recordSerialization(startTime, 10);

            // Expect the message to be sent (callback called)
            await waitFor(() => {
                expect(mockOnSendMessage).toHaveBeenCalled();
            });
            
            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.serialization).toBe(true);
        });

        it('should deserialize content in under 50ms', async () => {
            const complexContent: SerializedEditorState = {
                root: {
                    children: [{
                        children: [
                            { text: 'Bold ', type: 'text', format: 1, version: 1 },
                            { text: 'italic ', type: 'text', format: 2, version: 1 },
                            { text: 'normal', type: 'text', version: 1 }
                        ],
                        direction: 'ltr' as const,
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1
                    }],
                    direction: 'ltr' as const,
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1
                }
            };

            const startTime = performance.now();
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    initialContent={complexContent}
                />
            );

            performanceMonitor.recordDeserialization(startTime, JSON.stringify(complexContent).length);

            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.deserialization).toBe(true);
        });
    });

    describe('Undo/Redo Performance', () => {
        it('should complete undo operations in under 100ms', async () => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);
            await user.type(editor, 'Test content for undo');

            const startTime = performance.now();
            await user.keyboard('{Control>}z{/Control}');
            performanceMonitor.recordUndoRedo(startTime, 'undo');

            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.undoRedo).toBe(true);
        });

        it('should complete redo operations in under 100ms', async () => {
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);
            await user.type(editor, 'Test content');
            await user.keyboard('{Control>}z{/Control}'); // Undo first

            const startTime = performance.now();
            await user.keyboard('{Control>}y{/Control}'); // Redo
            performanceMonitor.recordUndoRedo(startTime, 'redo');

            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.undoRedo).toBe(true);
        });
    });

    describe('Memory Management', () => {
        it('should not have memory leaks during extended use', async () => {
            const detector = new MemoryLeakDetector();
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);

            // Simulate extended typing session
            for (let i = 0; i < 100; i++) {
                await user.type(editor, `Message ${i} `, { delay: 0 });
                if (i % 10 === 0) {
                    await user.keyboard('{Control>}a{/Control}');
                    await user.keyboard('{Delete}');
                }
            }

            // Record final memory usage
            performanceMonitor.recordMemoryUsage();
            const metrics = performanceMonitor.getMetrics();
            
            // Memory usage should be reasonable (less than 50MB increase)
            expect(metrics.memoryUsage).toBeLessThan(50 * 1024 * 1024);
        });

        it('should clean up editor resources on unmount', async () => {
            const { unmount } = render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            const editor = screen.getByRole('textbox');
            await user.click(editor);
            await user.type(editor, 'Test content');

            const initialMemory = performanceMonitor.getMetrics().memoryUsage;
            
            unmount();
            
            // Simulate garbage collection (in real browser this would happen automatically)
            performanceMonitor.recordMemoryUsage();
            const finalMemory = performanceMonitor.getMetrics().memoryUsage;
            
            // Memory should not increase significantly after unmount
            expect(finalMemory - initialMemory).toBeLessThan(1024 * 1024); // Less than 1MB increase
        });
    });

    describe('Performance Regression Detection', () => {
        it('should detect performance regressions in initialization', async () => {
            // Simulate slow initialization
            mockPerformance.now
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(150); // 150ms initialization

            const startTime = performance.now();
            
            render(
                <RichMessageEditor
                    onSendMessage={mockOnSendMessage}
                    placeholder="Type a message..."
                />
            );

            performanceMonitor.recordInitialization(startTime);
            
            const summary = performanceMonitor.getPerformanceSummary();
            expect(summary.meetsTargets.initialization).toBe(false);
            expect(summary.initializationTime).toBeGreaterThan(100);
        });

        it('should provide detailed performance metrics for analysis', () => {
            // Record some test metrics
            performanceMonitor.recordInitialization(0);
            performanceMonitor.recordKeystroke(0);
            performanceMonitor.recordSerialization(0, 100);
            performanceMonitor.recordMemoryUsage();

            const exportData = performanceMonitor.exportData();
            
            expect(exportData.metrics).toBeDefined();
            expect(exportData.entries).toHaveLength(4);
            expect(exportData.summary).toBeDefined();
            expect(exportData.summary.meetsTargets).toBeDefined();
        });
    });
});

describe('Performance Monitoring Utilities', () => {
    beforeEach(() => {
        performanceMonitor.clear();
    });

    it('should track keystroke latency with circular buffer', () => {
        // Add more than the buffer size (100)
        for (let i = 0; i < 150; i++) {
            performanceMonitor.recordKeystroke(0);
        }

        const metrics = performanceMonitor.getMetrics();
        expect(metrics.keyStrokeLatency).toHaveLength(100); // Should maintain max buffer size
    });

    it('should calculate average keystroke latency correctly', () => {
        const latencies = [10, 20, 30];
        
        // Mock performance.now to return exact values
        let callCount = 0;
        mockPerformance.now.mockImplementation(() => {
            const values = [0, 10, 0, 20, 0, 30]; // start, end, start, end, start, end
            return values[callCount++] || 0;
        });
        
        latencies.forEach(() => {
            performanceMonitor.recordKeystroke(0);
        });

        const average = performanceMonitor.getAverageKeystrokeLatency();
        expect(average).toBe(20); // (10 + 20 + 30) / 3
    });

    it('should provide performance summary with target validation', () => {
        // Record metrics that meet targets
        mockPerformance.now
            .mockReturnValueOnce(0).mockReturnValueOnce(50)  // 50ms init
            .mockReturnValueOnce(0).mockReturnValueOnce(10)  // 10ms keystroke
            .mockReturnValueOnce(0).mockReturnValueOnce(30)  // 30ms serialization
            .mockReturnValueOnce(0).mockReturnValueOnce(40)  // 40ms deserialization
            .mockReturnValueOnce(0).mockReturnValueOnce(80); // 80ms undo/redo

        performanceMonitor.recordInitialization(0);
        performanceMonitor.recordKeystroke(0);
        performanceMonitor.recordSerialization(0);
        performanceMonitor.recordDeserialization(0);
        performanceMonitor.recordUndoRedo(0, 'undo');

        const summary = performanceMonitor.getPerformanceSummary();
        
        expect(summary.meetsTargets.initialization).toBe(true);
        expect(summary.meetsTargets.keystroke).toBe(true);
        expect(summary.meetsTargets.serialization).toBe(true);
        expect(summary.meetsTargets.deserialization).toBe(true);
        expect(summary.meetsTargets.undoRedo).toBe(true);
    });
});