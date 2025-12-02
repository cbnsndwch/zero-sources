import type { Route } from './+types/og';

import { generateOGImage } from '@/app/lib/og-image';

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const title = url.searchParams.get('title') || 'Zero Sources';
    const description = url.searchParams.get('description') || undefined;
    const path = url.searchParams.get('path') || undefined;

    try {
        const png = await generateOGImage({
            title,
            description,
            path
        });

        return new Response(new Uint8Array(png), {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        console.error('Error generating OG image:', error);
        return new Response('Error generating image', { status: 500 });
    }
}
