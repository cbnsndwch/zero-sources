import type { Route } from './+types/llms-mdx';

import { source } from '@/lib/source';
import { getLLMText } from '@/lib/get-llm-text';

export async function loader({ params }: Route.LoaderArgs) {
    const slugs = (params as any)['*']
        .split('/')
        .filter((v: string) => v.length > 0);

    const page = source.getPage(slugs);
    if (!page) {
        return new Response('not found', { status: 404 });
    }

    return new Response(await getLLMText(page), {
        headers: {
            'Content-Type': 'text/markdown'
        }
    });
}
