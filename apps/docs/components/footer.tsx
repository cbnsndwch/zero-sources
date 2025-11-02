import Link from 'fumadocs-core/link';
import { Mail } from 'lucide-react';

import { GitHubIcon } from '@/components/icons/github';

/**
 * Site Footer Component
 *
 * Displays copyright information, useful links, and privacy policy.
 * Used on the home page for consistent branding and legal compliance.
 */
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-background">
            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* About Section */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">
                            Zero Sources
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Utilities and custom change sources for Rocicorp
                            Zero - MongoDB support, NestJS integration, and
                            more.
                        </p>
                    </div>

                    {/* Documentation Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">
                            Documentation
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/docs"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Getting Started
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/packages"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Packages
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/guides"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Guides
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/api"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    API Reference
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">
                            Resources
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="https://github.com/cbnsndwch/zero-sources"
                                    external
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    GitHub Repository
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/cbnsndwch/zero-sources/issues"
                                    external
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Report Issues
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/docs/contributing"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Contributing
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://zero.rocicorp.dev"
                                    external
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Rocicorp Zero
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/docs/privacy"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Privacy & Analytics
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/cbnsndwch/zero-sources/blob/main/LICENSE.md"
                                    external
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    MIT License
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/cbnsndwch/zero-sources/blob/main/ACKNOWLEDGMENTS.md"
                                    external
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Acknowledgments
                                </Link>
                            </li>
                        </ul>

                        {/* Social Links */}
                        <div className="mt-6 flex gap-4">
                            <Link
                                href="https://github.com/cbnsndwch/zero-sources"
                                external
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="GitHub"
                            >
                                <GitHubIcon className="h-5 w-5" />
                            </Link>
                            <Link
                                href="mailto:oss@cbnsndwch.io"
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Email"
                            >
                                <Mail className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t border-border pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
                        <p>
                            © {currentYear}{' '}
                            <Link
                                href="https://cbnsndwch.io"
                                external
                                className="hover:text-foreground"
                            >
                                cbnsndwch LLC
                            </Link>
                            . All rights reserved.
                        </p>
                        <p>
                            Built with{' '}
                            <Link
                                href="https://fumadocs.vercel.app"
                                external
                                className="hover:text-foreground"
                            >
                                Fumadocs
                            </Link>{' '}
                            and{' '}
                            <Link
                                href="https://reactrouter.com"
                                external
                                className="hover:text-foreground"
                            >
                                React Router
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
