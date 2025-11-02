'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeTab {
    title: string;
    language?: string;
    code: string;
}

interface CodeTabsProps {
    tabs: CodeTab[];
    defaultTab?: number;
    className?: string;
}

/**
 * Code tabs component for displaying multiple code examples
 *
 * @example
 * ```tsx
 * <CodeTabs
 *   tabs={[
 *     { title: 'TypeScript', language: 'typescript', code: '...' },
 *     { title: 'JavaScript', language: 'javascript', code: '...' }
 *   ]}
 * />
 * ```
 */
export function CodeTabs({ tabs, defaultTab = 0, className }: CodeTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className={cn('rounded-lg border overflow-hidden', className)}>
            {/* Tab Headers */}
            <div className="flex border-b bg-muted/50">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={cn(
                            'px-4 py-2 text-sm font-medium transition-colors relative',
                            activeTab === index
                                ? 'text-foreground bg-background'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                        )}
                    >
                        {tab.title}
                        {activeTab === index && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="relative">
                {tabs.map((tab, index) => (
                    <div
                        key={index}
                        className={cn(
                            'transition-all',
                            activeTab === index ? 'block' : 'hidden'
                        )}
                    >
                        <pre className="p-4 overflow-x-auto bg-muted/30">
                            <code
                                className={cn(
                                    'text-sm',
                                    tab.language && `language-${tab.language}`
                                )}
                            >
                                {tab.code}
                            </code>
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
