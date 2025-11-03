import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import mdx from 'fumadocs-mdx/vite';
import * as MdxConfig from './source.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fumadocs dependencies that need special handling in Vite
const FumadocsDeps = ['fumadocs-core', 'fumadocs-ui', 'fumadocs-mdx'];

export default defineConfig({
    plugins: [
        mdx(MdxConfig),
        reactRouter(),
        tailwindcss(),
        tsconfigPaths()
        //
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, '.')
        },
        noExternal: FumadocsDeps
    },
    optimizeDeps: {
        exclude: FumadocsDeps
    }
});
