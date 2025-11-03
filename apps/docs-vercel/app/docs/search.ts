import { createFromSource } from 'fumadocs-core/search/server';

import type { Route } from './+types/search';

import { source } from '@/app/lib/source';

const server = createFromSource(source, {
    // https://docs.orama.com/docs/orama-js/supported-languages
    language: 'english'
});

export async function loader({ request }: Route.LoaderArgs) {
    return server.GET(request);
}
