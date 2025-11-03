import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

export interface OGImageOptions {
    title: string;
    description?: string;
    path?: string;
}

// Cache the font data to avoid fetching it multiple times
let fontDataCache: ArrayBuffer | null = null;
let faviconDataCache: string | null = null;

async function getFontData(): Promise<ArrayBuffer> {
    if (fontDataCache) {
        return fontDataCache;
    }

    // Load Inter font from Vercel's font CDN
    const data = await fetch(
        'https://og-playground.vercel.app/inter-latin-ext-400-normal.woff',
        {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }
    ).then(async res => {
        if (!res.ok) {
            console.error('Font fetch failed:', res.status, res.statusText);
            throw new Error(`Failed to load font: ${res.status}`);
        }
        return res.arrayBuffer();
    });

    fontDataCache = data;
    return data;
}

async function getFaviconData(): Promise<string> {
    if (faviconDataCache) {
        return faviconDataCache;
    }

    try {
        // Read the favicon file from the public directory
        const fs = await import('fs/promises');
        const path = await import('path');
        const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
        const buffer = await fs.readFile(faviconPath);
        const base64 = buffer.toString('base64');
        faviconDataCache = `data:image/x-icon;base64,${base64}`;
        return faviconDataCache;
    } catch (error) {
        console.error('Error loading favicon:', error);
        // Return empty string if favicon can't be loaded
        return '';
    }
}

/**
 * Generate an OG image as a PNG buffer
 */
export async function generateOGImage(
    options: OGImageOptions
): Promise<Buffer> {
    const { title, description, path } = options;

    const fontData = await getFontData();
    const faviconData = await getFaviconData();

    const svg = await satori(
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                backgroundColor: '#09090b',
                padding: '80px',
                fontFamily: 'Inter'
            }}
        >
            {/* Header with logo/brand */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                {faviconData && (
                    <img
                        src={faviconData}
                        alt="Zero Sources Logo"
                        width={48}
                        height={48}
                        style={{
                            width: '48px',
                            height: '48px'
                        }}
                    />
                )}
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 400,
                        color: '#ffffff',
                        letterSpacing: '-0.02em'
                    }}
                >
                    Zero Sources
                </div>
            </div>

            {/* Main content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    flex: 1,
                    justifyContent: 'center',
                    maxWidth: '1000px'
                }}
            >
                <div
                    style={{
                        fontSize: '72px',
                        fontWeight: 400,
                        color: '#ffffff',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        display: 'flex',
                        flexWrap: 'wrap'
                    }}
                >
                    {title}
                </div>
                {description && (
                    <div
                        style={{
                            fontSize: '32px',
                            color: '#a1a1aa',
                            lineHeight: 1.4,
                            fontWeight: 400
                        }}
                    >
                        {description}
                    </div>
                )}
            </div>

            {/* Footer with path */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                }}
            >
                {path && (
                    <div
                        style={{
                            fontSize: '24px',
                            color: '#71717a',
                            fontFamily: 'monospace'
                        }}
                    >
                        {path}
                    </div>
                )}
                <div
                    style={{
                        fontSize: '24px',
                        color: '#71717a'
                    }}
                >
                    Documentation
                </div>
            </div>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 400,
                    style: 'normal'
                }
            ]
        }
    );

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    return pngData.asPng();
}
