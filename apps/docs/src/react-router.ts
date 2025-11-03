import path from 'node:path';
import url from 'node:url';

import { static as expressStatic } from 'express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createRequestHandler } from '@react-router/express';

// sensible defaults for most Nest apps
const DEFAULT_NEST_PATHS = ['/api', '/graphql'];

// Fumadocs search endpoint path, to be excluded from NestJS handling
const FUMADOCS_SEARCH_PATH = '/api/search';

// the path to the React Router server build
const BUILD_PATH = url.pathToFileURL(
    path.resolve(process.cwd(), 'build', 'server', 'index.js')
).href;

export async function mountReactRouterHandler(
    nestApp: NestExpressApplication,
    NEST_PATHS = DEFAULT_NEST_PATHS
) {
    const viteDevServer =
        process.env.NODE_ENV === 'production'
            ? undefined
            : await import('vite').then(vite =>
                  vite.createServer({
                      server: { middlewareMode: true }
                  })
              );

    const reactRouterHandler = createRequestHandler({
        build: viteDevServer
            ? () =>
                  viteDevServer.ssrLoadModule(
                      'virtual:react-router/server-build'
                  )
            : await import(BUILD_PATH),
        getLoadContext() {
            return { app: nestApp };
        }
    });

    const expressApp = nestApp.getHttpAdapter().getInstance();

    // handle asset requests
    if (viteDevServer) {
        expressApp.use(viteDevServer.middlewares);
    } else {
        // Vite fingerprints its assets so we can cache forever.
        expressApp.use(
            '/assets',
            expressStatic('build/client/assets', {
                immutable: true,
                maxAge: '1y'
            })
        );
    }

    // Everything else (like favicon.ico) is cached for an hour. You may want
    // to be more aggressive with this caching.
    expressApp.use(expressStatic('build/client', { maxAge: '1h' }));

    // mount the React Router handler on paths NOT handled by Nest
    expressApp.all('/{*splat}', (req, res, next) => {
        if (
            // exception for Fumadocs' search api endpoint
            req.url.startsWith(FUMADOCS_SEARCH_PATH) ||
            !NEST_PATHS.some(path => req.url.startsWith(path))
        ) {
            return reactRouterHandler(req, res, next);
        }

        return next();
    });
}
