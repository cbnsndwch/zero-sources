import type { MetaDescriptor } from 'react-router';

export interface MetaTagsOptions {
    title: string;
    description: string;
    path?: string;
    ogImage?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    tags?: string[];
}

/**
 * Generate consistent meta tags for SEO, Open Graph, and Twitter Cards
 */
export function createMetaTags(
    options: MetaTagsOptions,
    baseUrl?: string
): MetaDescriptor[] {
    const base = baseUrl || getBaseUrl();
    const {
        title,
        description,
        path = '',
        ogImage,
        type = 'website',
        publishedTime,
        modifiedTime,
        tags = []
    } = options;

    const fullTitle = ['Zero Sources', '@cbnsndwch/zero-sources'].some(
        exception => title.includes(exception)
    )
        ? title
        : `${title} | Zero Sources`;
    const url = `${base}${path}`;
    const imageUrl =
        ogImage ||
        `${base}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&path=${encodeURIComponent(path)}`;

    const meta: MetaDescriptor[] = [
        { title: fullTitle },
        { name: 'description', content: description },

        // Open Graph
        { property: 'og:type', content: type },
        { property: 'og:url', content: url },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: description },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:site_name', content: 'Zero Sources Documentation' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: url },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },

        // Additional metadata
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Zero Sources Team' }
    ];

    // Article-specific meta tags
    if (type === 'article') {
        if (publishedTime) {
            meta.push({
                property: 'article:published_time',
                content: publishedTime
            });
        }
        if (modifiedTime) {
            meta.push({
                property: 'article:modified_time',
                content: modifiedTime
            });
        }
        if (tags.length > 0) {
            tags.forEach(tag => {
                meta.push({ property: 'article:tag', content: tag });
            });
        }
    }

    return meta;
}

/**
 * Get the base URL from environment or fallback
 */
export function getBaseUrl(): string {
    // Use custom domain in production
    if (
        typeof process !== 'undefined' &&
        process.env.NODE_ENV === 'production'
    ) {
        return 'https://zero-sources.cbnsndwch.dev';
    }
    // Fallback for local development
    return 'http://localhost:5173';
}
