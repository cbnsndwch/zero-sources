/**
 * Lazy loading utilities for Lexical plugins and components
 * Reduces initial bundle size and improves loading performance
 */

import { lazy, ComponentType, Suspense } from 'react';

import { performanceMonitor } from './performance-monitor';

/**
 * Lazy load a Lexical plugin with performance tracking
 */
export function lazyLoadPlugin<T = any>(
    importFn: () => Promise<{ default: ComponentType<T> }>,
    fallback?: ComponentType<T>
): ComponentType<T> {
    const LazyComponent = lazy(() => {
        const startTime = performance.now();

        return importFn().then(module => {
            const loadTime = performance.now() - startTime;
            performanceMonitor.addEntry('bundleLoadTime' as any, loadTime);

            if (process.env.NODE_ENV === 'development') {
                console.log(`📦 Plugin loaded in ${loadTime.toFixed(2)}ms`);
            }

            return module;
        });
    });

    return (props: T) => (
        <Suspense
            fallback={
                fallback ? (
                    <FallbackComponent component={fallback} props={props} />
                ) : null
            }
        >
            <LazyComponent {...props} />
        </Suspense>
    );
}

/**
 * Preload a plugin in the background
 */
export function preloadPlugin(importFn: () => Promise<any>): void {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(callback, { timeout: 1000 });
        } else {
            setTimeout(callback, 100);
        }
    };

    schedulePreload(() => {
        const startTime = performance.now();

        importFn()
            .then(() => {
                const loadTime = performance.now() - startTime;

                if (process.env.NODE_ENV === 'development') {
                    console.log(
                        `🔄 Plugin preloaded in ${loadTime.toFixed(2)}ms`
                    );
                }
            })
            .catch(error => {
                console.warn('Failed to preload plugin:', error);
            });
    });
}

/**
 * Bundle analyzer for tracking loaded chunks
 */
export class BundleAnalyzer {
    private loadedChunks = new Set<string>();
    private chunkSizes = new Map<string, number>();
    private totalSize = 0;

    trackChunk(name: string, size?: number): void {
        this.loadedChunks.add(name);

        if (size) {
            this.chunkSizes.set(name, size);
            this.totalSize += size;
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(
                `📊 Chunk loaded: ${name}${size ? ` (${(size / 1024).toFixed(1)}KB)` : ''}`
            );
            console.log(
                `📦 Total bundle size: ${(this.totalSize / 1024).toFixed(1)}KB`
            );
        }
    }

    getLoadedChunks(): string[] {
        return Array.from(this.loadedChunks);
    }

    getTotalSize(): number {
        return this.totalSize;
    }

    getChunkSizes(): Record<string, number> {
        return Object.fromEntries(this.chunkSizes);
    }
}

export const bundleAnalyzer = new BundleAnalyzer();

/**
 * Wrapper component for fallbacks
 */
function FallbackComponent<T>({
    component: Component,
    props
}: {
    component: ComponentType<T>;
    props: T;
}) {
    return <Component {...props} />;
}

/**
 * Optimized plugin loading with priority levels
 */
export enum PluginPriority {
    CRITICAL = 'critical', // Load immediately (core editor functions)
    HIGH = 'high', // Load after critical (formatting, basic features)
    MEDIUM = 'medium', // Load on user interaction (mentions, toolbar)
    LOW = 'low' // Load on demand (advanced features)
}

class PluginLoader {
    private loadQueue = new Map<PluginPriority, Array<() => Promise<any>>>();
    private loaded = new Set<string>();
    private loading = new Set<string>();

    constructor() {
        // Initialize queues
        Object.values(PluginPriority).forEach(priority => {
            this.loadQueue.set(priority, []);
        });
    }

    /**
     * Register a plugin for lazy loading
     */
    register(
        name: string,
        importFn: () => Promise<any>,
        priority: PluginPriority = PluginPriority.MEDIUM
    ): void {
        if (this.loaded.has(name) || this.loading.has(name)) {
            return;
        }

        const queue = this.loadQueue.get(priority);
        if (!queue) return;

        queue.push(async () => {
            this.loading.add(name);
            const startTime = performance.now();

            try {
                const module = await importFn();
                const loadTime = performance.now() - startTime;

                this.loaded.add(name);
                bundleAnalyzer.trackChunk(name);
                performanceMonitor.addEntry('bundleLoadTime' as any, loadTime);

                if (process.env.NODE_ENV === 'development') {
                    console.log(
                        `✅ Plugin ${name} loaded (${priority}) in ${loadTime.toFixed(2)}ms`
                    );
                }

                return module;
            } catch (error) {
                console.error(`❌ Failed to load plugin ${name}:`, error);
                throw error;
            } finally {
                this.loading.delete(name);
            }
        });
    }

    /**
     * Load plugins by priority level
     */
    async loadByPriority(priority: PluginPriority): Promise<void> {
        const queue = this.loadQueue.get(priority);
        if (!queue || queue.length === 0) return;

        const promises = queue.splice(0, queue.length).map(loadFn => loadFn());
        await Promise.all(promises);
    }

    /**
     * Load all critical plugins immediately
     */
    async loadCritical(): Promise<void> {
        await this.loadByPriority(PluginPriority.CRITICAL);
    }

    /**
     * Load high priority plugins
     */
    async loadHigh(): Promise<void> {
        await this.loadByPriority(PluginPriority.HIGH);
    }

    /**
     * Load medium priority plugins (typically on user interaction)
     */
    async loadMedium(): Promise<void> {
        await this.loadByPriority(PluginPriority.MEDIUM);
    }

    /**
     * Load low priority plugins (on demand)
     */
    async loadLow(): Promise<void> {
        await this.loadByPriority(PluginPriority.LOW);
    }

    /**
     * Check if a plugin is loaded
     */
    isLoaded(name: string): boolean {
        return this.loaded.has(name);
    }

    /**
     * Check if a plugin is currently loading
     */
    isLoading(name: string): boolean {
        return this.loading.has(name);
    }

    /**
     * Get loading statistics
     */
    getStats(): {
        loaded: string[];
        loading: string[];
        pending: Record<PluginPriority, number>;
    } {
        const pending: Record<PluginPriority, number> = {} as any;

        Object.values(PluginPriority).forEach(priority => {
            pending[priority] = this.loadQueue.get(priority)?.length || 0;
        });

        return {
            loaded: Array.from(this.loaded),
            loading: Array.from(this.loading),
            pending
        };
    }
}

export const pluginLoader = new PluginLoader();

/**
 * Hook for progressive plugin loading
 */
export function useProgressiveLoading() {
    return {
        loadCritical: pluginLoader.loadCritical.bind(pluginLoader),
        loadHigh: pluginLoader.loadHigh.bind(pluginLoader),
        loadMedium: pluginLoader.loadMedium.bind(pluginLoader),
        loadLow: pluginLoader.loadLow.bind(pluginLoader),
        isLoaded: pluginLoader.isLoaded.bind(pluginLoader),
        isLoading: pluginLoader.isLoading.bind(pluginLoader),
        getStats: pluginLoader.getStats.bind(pluginLoader)
    };
}

/**
 * Intersection Observer for loading plugins when needed
 */
export function createIntersectionLoader(
    callback: () => void,
    options: IntersectionObserverInit = {}
): (element: Element | null) => void {
    let observer: IntersectionObserver | null = null;

    return (element: Element | null) => {
        if (observer) {
            observer.disconnect();
        }

        if (!element) return;

        observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        callback();
                        observer?.disconnect();
                    }
                });
            },
            {
                threshold: 0.1,
                ...options
            }
        );

        observer.observe(element);
    };
}
