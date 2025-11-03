'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveDemoProps {
    title?: string;
    description?: string;
    code: string;
    initialOutput?: string;
    execute?: (code: string) => Promise<string> | string;
    className?: string;
}

/**
 * Interactive code demo component that allows users to run and modify code examples
 *
 * @example
 * ```tsx
 * <InteractiveDemo
 *   title="Query Messages"
 *   code={`const messages = await zero.query.message
 *   .where('roomId', roomId)
 *   .orderBy('createdAt', 'desc')
 *   .limit(10)
 *   .run();`}
 *   execute={async (code) => {
 *     // Simulate execution
 *     return JSON.stringify([{ id: '1', content: 'Hello!' }], null, 2);
 *   }}
 * />
 * ```
 */
export function InteractiveDemo({
    title,
    description,
    code: initialCode,
    initialOutput = '',
    execute,
    className
}: InteractiveDemoProps) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState(initialOutput);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        if (!execute) return;

        setIsRunning(true);
        setError(null);

        try {
            const result = await execute(code);
            setOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Execution error');
        } finally {
            setIsRunning(false);
        }
    };

    const handleReset = () => {
        setCode(initialCode);
        setOutput(initialOutput);
        setError(null);
    };

    return (
        <div
            className={cn(
                'rounded-lg border bg-card overflow-hidden',
                className
            )}
        >
            {(title || description) && (
                <div className="border-b bg-muted/50 px-4 py-3">
                    {title && (
                        <h3 className="text-sm font-semibold">{title}</h3>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
            )}

            <div className="grid md:grid-cols-2 divide-x">
                {/* Code Editor */}
                <div className="relative">
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <button
                            onClick={handleReset}
                            className="p-1.5 rounded-md bg-background/80 hover:bg-background border text-xs flex items-center gap-1"
                            title="Reset to original"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                        {execute && (
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-xs flex items-center gap-1"
                                title="Run code"
                            >
                                <Play className="w-3 h-3" />
                                <span className="hidden sm:inline">
                                    {isRunning ? 'Running...' : 'Run'}
                                </span>
                            </button>
                        )}
                    </div>

                    <textarea
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="w-full h-64 p-4 pt-12 font-mono text-sm bg-muted/30 resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="relative bg-background">
                    <div className="px-4 py-2 border-b bg-muted/30 text-xs font-semibold text-muted-foreground">
                        Output
                    </div>
                    <div className="p-4 h-64 overflow-auto">
                        {error ? (
                            <div className="text-destructive font-mono text-sm">
                                Error: {error}
                            </div>
                        ) : output ? (
                            <pre className="font-mono text-sm">{output}</pre>
                        ) : (
                            <div className="text-muted-foreground text-sm italic">
                                {execute
                                    ? 'Click "Run" to see output'
                                    : 'No output'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
