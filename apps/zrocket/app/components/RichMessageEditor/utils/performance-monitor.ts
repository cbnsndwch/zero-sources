/**
 * Performance monitoring utilities for Rich Message Editor
 * Tracks initialization time, keystroke latency, memory usage, and other metrics
 */

export interface EditorPerformanceMetrics {
    initializationTime: number;
    keyStrokeLatency: number[];
    memoryUsage: number;
    serializationTime: number;
    deserializationTime: number;
    undoRedoTime: number;
    renderTime: number;
    bundleLoadTime: number;
}

export interface PerformanceEntry {
    timestamp: number;
    metric: keyof EditorPerformanceMetrics;
    value: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
    private metrics: EditorPerformanceMetrics = {
        initializationTime: 0,
        keyStrokeLatency: [],
        memoryUsage: 0,
        serializationTime: 0,
        deserializationTime: 0,
        undoRedoTime: 0,
        renderTime: 0,
        bundleLoadTime: 0
    };

    private entries: PerformanceEntry[] = [];
    private keystrokeBuffer: number[] = [];
    private maxKeystrokeBuffer = 100; // Keep last 100 keystrokes for average calculation

    /**
     * Mark the start of a performance measurement
     */
    markStart(name: string): void {
        performance.mark(`${name}-start`);
    }

    /**
     * Mark the end of a performance measurement and calculate duration
     */
    markEnd(name: string): number {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);

        const measure = performance.getEntriesByName(name, 'measure')[0];
        const duration = measure?.duration || 0;

        // Clean up performance entries
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
        performance.clearMeasures(name);

        return duration;
    }

    /**
     * Record editor initialization time
     */
    recordInitialization(startTime: number): void {
        const duration = performance.now() - startTime;
        this.metrics.initializationTime = duration;
        this.addEntry('initializationTime', duration);

        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 Editor initialization: ${duration.toFixed(2)}ms`);

            if (duration > 100) {
                console.warn(
                    `⚠️ Editor initialization exceeded 100ms target (${duration.toFixed(2)}ms)`
                );
            }
        }
    }

    /**
     * Record keystroke latency
     */
    recordKeystroke(startTime: number): void {
        const latency = performance.now() - startTime;

        // Add to buffer and maintain size limit
        this.keystrokeBuffer.push(latency);
        if (this.keystrokeBuffer.length > this.maxKeystrokeBuffer) {
            this.keystrokeBuffer.shift();
        }

        // Update metrics with latest values
        this.metrics.keyStrokeLatency = [...this.keystrokeBuffer];
        this.addEntry('keyStrokeLatency', latency);

        if (process.env.NODE_ENV === 'development' && latency > 16) {
            console.warn(
                `⚠️ Keystroke latency exceeded 16ms target (${latency.toFixed(2)}ms)`
            );
        }
    }

    /**
     * Record serialization performance
     */
    recordSerialization(startTime: number, contentLength?: number): void {
        const duration = performance.now() - startTime;
        this.metrics.serializationTime = duration;
        this.addEntry('serializationTime', duration, { contentLength });

        if (process.env.NODE_ENV === 'development') {
            if (duration > 50) {
                console.warn(
                    `⚠️ Serialization exceeded 50ms target (${duration.toFixed(2)}ms)`
                );
            }
        }
    }

    /**
     * Record deserialization performance
     */
    recordDeserialization(startTime: number, contentLength?: number): void {
        const duration = performance.now() - startTime;
        this.metrics.deserializationTime = duration;
        this.addEntry('deserializationTime', duration, { contentLength });

        if (process.env.NODE_ENV === 'development') {
            if (duration > 50) {
                console.warn(
                    `⚠️ Deserialization exceeded 50ms target (${duration.toFixed(2)}ms)`
                );
            }
        }
    }

    /**
     * Record undo/redo operation time
     */
    recordUndoRedo(startTime: number, operation: 'undo' | 'redo'): void {
        const duration = performance.now() - startTime;
        this.metrics.undoRedoTime = duration;
        this.addEntry('undoRedoTime', duration, { operation });

        if (process.env.NODE_ENV === 'development') {
            if (duration > 100) {
                console.warn(
                    `⚠️ ${operation} operation exceeded 100ms target (${duration.toFixed(2)}ms)`
                );
            }
        }
    }

    /**
     * Record memory usage
     */
    recordMemoryUsage(): void {
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            const usedJSHeapSize = memory.usedJSHeapSize;
            this.metrics.memoryUsage = usedJSHeapSize;
            this.addEntry('memoryUsage', usedJSHeapSize);
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics(): EditorPerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Get average keystroke latency
     */
    getAverageKeystrokeLatency(): number {
        if (this.keystrokeBuffer.length === 0) return 0;
        return (
            this.keystrokeBuffer.reduce((a, b) => a + b, 0) /
            this.keystrokeBuffer.length
        );
    }

    /**
     * Get performance summary for reporting
     */
    getPerformanceSummary(): {
        initializationTime: number;
        averageKeystrokeLatency: number;
        memoryUsageMB: number;
        serializationTime: number;
        deserializationTime: number;
        undoRedoTime: number;
        meetsTargets: {
            initialization: boolean;
            keystroke: boolean;
            serialization: boolean;
            deserialization: boolean;
            undoRedo: boolean;
        };
    } {
        const avgKeystroke = this.getAverageKeystrokeLatency();
        const memoryMB = this.metrics.memoryUsage / (1024 * 1024);

        return {
            initializationTime: this.metrics.initializationTime,
            averageKeystrokeLatency: avgKeystroke,
            memoryUsageMB: memoryMB,
            serializationTime: this.metrics.serializationTime,
            deserializationTime: this.metrics.deserializationTime,
            undoRedoTime: this.metrics.undoRedoTime,
            meetsTargets: {
                initialization: this.metrics.initializationTime <= 100,
                keystroke: avgKeystroke <= 16,
                serialization: this.metrics.serializationTime <= 50,
                deserialization: this.metrics.deserializationTime <= 50,
                undoRedo: this.metrics.undoRedoTime <= 100
            }
        };
    }

    /**
     * Clear all recorded metrics
     */
    clear(): void {
        this.metrics = {
            initializationTime: 0,
            keyStrokeLatency: [],
            memoryUsage: 0,
            serializationTime: 0,
            deserializationTime: 0,
            undoRedoTime: 0,
            renderTime: 0,
            bundleLoadTime: 0
        };
        this.entries = [];
        this.keystrokeBuffer = [];
    }

    /**
     * Export metrics data for analysis
     */
    exportData(): {
        metrics: EditorPerformanceMetrics;
        entries: PerformanceEntry[];
        summary: ReturnType<typeof this.getPerformanceSummary>;
    } {
        return {
            metrics: this.getMetrics(),
            entries: [...this.entries],
            summary: this.getPerformanceSummary()
        };
    }

    private addEntry(
        metric: keyof EditorPerformanceMetrics,
        value: number,
        metadata?: Record<string, any>
    ): void {
        this.entries.push({
            timestamp: Date.now(),
            metric,
            value,
            metadata
        });

        // Keep only last 1000 entries to prevent memory leaks
        if (this.entries.length > 1000) {
            this.entries.splice(0, this.entries.length - 1000);
        }
    }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();

export { performanceMonitor };

/**
 * React hook for accessing performance monitoring
 */
export function usePerformanceMonitor() {
    return {
        monitor: performanceMonitor,
        recordInitialization:
            performanceMonitor.recordInitialization.bind(performanceMonitor),
        recordKeystroke:
            performanceMonitor.recordKeystroke.bind(performanceMonitor),
        recordSerialization:
            performanceMonitor.recordSerialization.bind(performanceMonitor),
        recordDeserialization:
            performanceMonitor.recordDeserialization.bind(performanceMonitor),
        recordUndoRedo:
            performanceMonitor.recordUndoRedo.bind(performanceMonitor),
        recordMemoryUsage:
            performanceMonitor.recordMemoryUsage.bind(performanceMonitor),
        getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
        getSummary:
            performanceMonitor.getPerformanceSummary.bind(performanceMonitor),
        markStart: performanceMonitor.markStart.bind(performanceMonitor),
        markEnd: performanceMonitor.markEnd.bind(performanceMonitor)
    };
}

/**
 * Performance monitoring decorator for methods
 */
export function measurePerformance(metricName: string) {
    return function (
        target: any,
        propertyName: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const startTime = performance.now();
            const result = method.apply(this, args);

            if (result instanceof Promise) {
                return result.finally(() => {
                    const duration = performance.now() - startTime;
                    performanceMonitor.addEntry(metricName as any, duration);
                });
            } else {
                const duration = performance.now() - startTime;
                performanceMonitor.addEntry(metricName as any, duration);
                return result;
            }
        };

        return descriptor;
    };
}

/**
 * Memory leak detection utilities
 */
export class MemoryLeakDetector {
    private baseline: number = 0;
    private checkInterval: NodeJS.Timeout | null = null;
    private warningThreshold = 50 * 1024 * 1024; // 50MB
    private criticalThreshold = 100 * 1024 * 1024; // 100MB

    startMonitoring(intervalMs: number = 30000): void {
        if (typeof window === 'undefined' || !('memory' in performance)) {
            return; // Only available in Chrome
        }

        this.baseline = (performance as any).memory.usedJSHeapSize;

        this.checkInterval = setInterval(() => {
            const currentMemory = (performance as any).memory.usedJSHeapSize;
            const increase = currentMemory - this.baseline;

            if (increase > this.criticalThreshold) {
                console.error(
                    `🚨 Critical memory leak detected: ${(increase / 1024 / 1024).toFixed(2)}MB increase`
                );
            } else if (increase > this.warningThreshold) {
                console.warn(
                    `⚠️ Potential memory leak: ${(increase / 1024 / 1024).toFixed(2)}MB increase`
                );
            }

            performanceMonitor.recordMemoryUsage();
        }, intervalMs);
    }

    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

export const memoryLeakDetector = new MemoryLeakDetector();
