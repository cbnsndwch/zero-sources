import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import { icons } from 'lucide-react';
import { createMDXSource } from 'fumadocs-mdx';

/**
 * Configure MDX source for documentation content
 */
export const source = createMDXSource({
    // Content directory relative to project root
    contentDir: './content',
    // Base URL for documentation routes
    baseUrl: '/docs'
});

/**
 * Export page tree, getPage, and getPages utilities
 * with icon support for navigation items
 */
export const { getPage, getPages, pageTree } = loader({
    baseUrl: '/docs',
    source,
    icon(icon) {
        // Support Lucide icons in frontmatter
        if (icon && icon in icons) {
            return createElement(icons[icon as keyof typeof icons]);
        }
    }
});
