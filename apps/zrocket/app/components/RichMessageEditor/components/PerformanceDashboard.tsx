/**
 * Performance Dashboard Component
 * Displays real-time performance metrics for the Rich Message Editor
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { usePerformanceMonitor } from '../utils/performance-monitor';

interface PerformanceDashboardProps {
    className?: string;
    showDetailedMetrics?: boolean;
}

export function PerformanceDashboard({ 
    className = '',
    showDetailedMetrics = false 
}: PerformanceDashboardProps) {
    const performanceMonitor = usePerformanceMonitor();
    const [summary, setSummary] = useState(performanceMonitor.getSummary());
    const [isVisible, setIsVisible] = useState(false);

    // Update metrics periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setSummary(performanceMonitor.getSummary());
        }, 1000);

        return () => clearInterval(interval);
    }, [performanceMonitor]);

    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const getStatusColor = (isGood: boolean) => isGood ? 'bg-green-500' : 'bg-red-500';
    const getStatusBadge = (isGood: boolean) => isGood ? 'success' : 'destructive';

    return (
        <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
            {!isVisible ? (
                <Button
                    onClick={() => setIsVisible(true)}
                    variant="outline"
                    size="sm"
                    className="bg-background/80 backdrop-blur-sm"
                >
                    📊 Performance
                </Button>
            ) : (
                <Card className="w-80 bg-background/95 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Editor Performance
                            </CardTitle>
                            <Button
                                onClick={() => setIsVisible(false)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                            >
                                ✕
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {/* Performance Summary */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Initialization</span>
                                    <Badge variant={getStatusBadge(summary.meetsTargets.initialization)}>
                                        {summary.initializationTime.toFixed(1)}ms
                                    </Badge>
                                </div>
                                <Progress 
                                    value={Math.min(100, (summary.initializationTime / 100) * 100)} 
                                    className="h-1 mt-1"
                                />
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Avg Keystroke</span>
                                    <Badge variant={getStatusBadge(summary.meetsTargets.keystroke)}>
                                        {summary.averageKeystrokeLatency.toFixed(1)}ms
                                    </Badge>
                                </div>
                                <Progress 
                                    value={Math.min(100, (summary.averageKeystrokeLatency / 16) * 100)} 
                                    className="h-1 mt-1"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Serialization Performance */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Serialization</span>
                                    <Badge variant={getStatusBadge(summary.meetsTargets.serialization)}>
                                        {summary.serializationTime.toFixed(1)}ms
                                    </Badge>
                                </div>
                                <Progress 
                                    value={Math.min(100, (summary.serializationTime / 50) * 100)} 
                                    className="h-1 mt-1"
                                />
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between">
                                    <span>Undo/Redo</span>
                                    <Badge variant={getStatusBadge(summary.meetsTargets.undoRedo)}>
                                        {summary.undoRedoTime.toFixed(1)}ms
                                    </Badge>
                                </div>
                                <Progress 
                                    value={Math.min(100, (summary.undoRedoTime / 100) * 100)} 
                                    className="h-1 mt-1"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Memory Usage */}
                        <div>
                            <div className="flex items-center justify-between text-xs">
                                <span>Memory Usage</span>
                                <Badge variant="outline">
                                    {summary.memoryUsageMB.toFixed(1)}MB
                                </Badge>
                            </div>
                            <Progress 
                                value={Math.min(100, (summary.memoryUsageMB / 100) * 100)} 
                                className="h-1 mt-1"
                            />
                        </div>

                        {showDetailedMetrics && (
                            <>
                                <Separator />
                                
                                {/* Detailed Metrics */}
                                <div className="space-y-2 text-xs">
                                    <div className="font-medium">Detailed Metrics</div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Target: &lt;100ms init</div>
                                        <div className={summary.meetsTargets.initialization ? 'text-green-600' : 'text-red-600'}>
                                            {summary.meetsTargets.initialization ? '✓ Pass' : '✗ Fail'}
                                        </div>
                                        
                                        <div>Target: &lt;16ms keystroke</div>
                                        <div className={summary.meetsTargets.keystroke ? 'text-green-600' : 'text-red-600'}>
                                            {summary.meetsTargets.keystroke ? '✓ Pass' : '✗ Fail'}
                                        </div>
                                        
                                        <div>Target: &lt;50ms serialize</div>
                                        <div className={summary.meetsTargets.serialization ? 'text-green-600' : 'text-red-600'}>
                                            {summary.meetsTargets.serialization ? '✓ Pass' : '✗ Fail'}
                                        </div>
                                        
                                        <div>Target: &lt;100ms undo</div>
                                        <div className={summary.meetsTargets.undoRedo ? 'text-green-600' : 'text-red-600'}>
                                            {summary.meetsTargets.undoRedo ? '✓ Pass' : '✗ Fail'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            const data = performanceMonitor.monitor.exportData();
                                            console.log('Performance Data:', data);
                                            
                                            // Download as JSON
                                            const blob = new Blob([JSON.stringify(data, null, 2)], {
                                                type: 'application/json'
                                            });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `editor-performance-${Date.now()}.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        Export Data
                                    </Button>
                                    
                                    <Button
                                        onClick={() => performanceMonitor.monitor.clear()}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Quick Actions */}
                        <div className="flex justify-between items-center pt-2">
                            <Button
                                onClick={() => setIsVisible(false)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                Hide
                            </Button>
                            
                            <div className="flex gap-1">
                                {Object.values(summary.meetsTargets).every(Boolean) ? (
                                    <div className="flex items-center text-xs text-green-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                        All targets met
                                    </div>
                                ) : (
                                    <div className="flex items-center text-xs text-red-600">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                        Performance issues
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Simple performance indicator for production use
 */
export function PerformanceIndicator() {
    const performanceMonitor = usePerformanceMonitor();
    const [allTargetsMet, setAllTargetsMet] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            const summary = performanceMonitor.getSummary();
            const targetsMet = Object.values(summary.meetsTargets).every(Boolean);
            setAllTargetsMet(targetsMet);
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [performanceMonitor]);

    // Show warning indicator if performance targets are not met
    if (allTargetsMet) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Badge variant="destructive" className="animate-pulse">
                ⚠️ Performance
            </Badge>
        </div>
    );
}