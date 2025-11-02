import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

export interface OGImageOptions {
    title: string;
    description?: string;
    path?: string;
}

/**
 * Generate an OG image as a PNG buffer
 */
export async function generateOGImage(
    options: OGImageOptions
): Promise<Buffer> {
    const { title, description, path } = options;

    // Load Inter font
    const fontData = await fetch(
        'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff'
    ).then(res => res.arrayBuffer());

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
                <div
                    style={{
                        fontSize: '32px',
                        fontWeight: 700,
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
                        fontWeight: 800,
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
                },
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 700,
                    style: 'normal'
                },
                {
                    name: 'Inter',
                    data: fontData,
                    weight: 800,
                    style: 'normal'
                }
            ]
        }
    );

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    return pngData.asPng();
}
