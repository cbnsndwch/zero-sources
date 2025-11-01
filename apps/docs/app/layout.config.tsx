import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configuration for all documentation pages
 */
export const baseOptions: BaseLayoutProps = {
    nav: {
        title: (
            <div className="flex items-center gap-2">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-brand-primary"
                >
                    <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="rgb(var(--brand-primary) / 0.2)"
                    />
                    <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="font-bold">zero-sources</span>
            </div>
        ),
        transparentMode: 'top'
    },
    links: [
        {
            text: 'Documentation',
            url: '/docs',
            active: 'nested-url'
        },
        {
            text: 'GitHub',
            url: 'https://github.com/cbnsndwch/zero-sources',
            external: true
        }
    ],
    githubUrl: 'https://github.com/cbnsndwch/zero-sources'
};
