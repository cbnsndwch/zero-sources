import { source } from '@/app/lib/source';

const baseUrl = 'https://zero-sources.cbnsndwch.dev';

export async function loader() {
    const pages = source.getPages();
    const currentDate = new Date().toISOString();

    const staticUrls = [
        createUrlEntry(baseUrl, currentDate, 'weekly', '1.0'),
        createUrlEntry(`${baseUrl}/docs`, currentDate, 'weekly', '0.9')
    ];

    const pageUrls = pages.map(page =>
        createUrlEntry(`${baseUrl}${page.url}`, currentDate, 'weekly', '0.8')
    );

    const allUrls = [...staticUrls, ...pageUrls];
    const sitemap = generateSitemap(allUrls);

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
    });
}

function createUrlEntry(
    location: string,
    lastModification: string,
    changeFrequency: string,
    priority: string
): string {
    return [
        `  <url>`,
        `    <loc>${location}</loc>`,
        `    <lastmod>${lastModification}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        `  </url>`
    ].join('\n');
}

function generateSitemap(urls: string[]): string {
    const urlLines = urls.join('\n');

    return [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        urlLines,
        `</urlset>`
    ].join('\n');
}
