import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
    // homepage
    index('routes/home.tsx'),

    // LLMs candy
    route('llms-full.txt', 'routes/llms-full.ts'),
    route('llms.mdx/*', 'routes/llms-mdx.ts'),

    // docs routes
    route('docs/*', 'docs/page.tsx'),
    route('api/search', 'docs/search.ts')
] satisfies RouteConfig;
