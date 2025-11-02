import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { baseOptions } from '@/app/lib/layout.shared';

export function meta() {
    return [
        { title: 'zero-sources Documentation' },
        {
            name: 'description',
            content:
                'Utilities and custom change sources for Rocicorp Zero - MongoDB integration, watermark implementations, and more'
        }
    ];
}

export default function HomePage() {
    return (
        <HomeLayout {...baseOptions()}>
            <main className="container mx-auto px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Hero Section */}
                    <div className="mb-16 max-w-4xl">
                        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                            zero-sources
                        </h1>
                        <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
                            Utilities and custom change sources for Rocicorp
                            Zero
                        </p>
                        <p className="mb-8 text-lg text-muted-foreground">
                            MongoDB integration, watermark implementations, and
                            reusable infrastructure for building real-time
                            applications
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/docs"
                                className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                Get Started
                            </a>
                            <a
                                href="https://github.com/cbnsndwch/zero-sources"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-border bg-background px-6 py-3 font-semibold transition-colors hover:bg-accent"
                            >
                                View on GitHub
                            </a>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid w-full max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">📦</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                MongoDB Change Sources
                            </h3>
                            <p className="text-muted-foreground">
                                Stream MongoDB changes to Zero with support for
                                discriminated unions and custom mappings
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">💾</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Watermark Implementations
                            </h3>
                            <p className="text-muted-foreground">
                                NATS KV and ZQLite watermark storage for
                                reliable change streaming
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">🔄</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Real-time Sync
                            </h3>
                            <p className="text-muted-foreground">
                                WebSocket-based streaming infrastructure for
                                live data synchronization
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">🏗️</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                TypeScript Monorepo
                            </h3>
                            <p className="text-muted-foreground">
                                Well-structured monorepo with Turborepo, pnpm
                                workspaces, and comprehensive tooling
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">🎯</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Production Ready
                            </h3>
                            <p className="text-muted-foreground">
                                Docker deployment, testing infrastructure, and
                                monitoring tools included
                            </p>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-6 text-left">
                            <div className="mb-4 text-3xl">📚</div>
                            <h3 className="mb-2 text-xl font-semibold">
                                Demo Applications
                            </h3>
                            <p className="text-muted-foreground">
                                Full-stack example apps showcasing Zero
                                capabilities and best practices
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </HomeLayout>
    );
}
