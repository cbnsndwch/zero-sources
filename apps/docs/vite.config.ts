import path from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

import { reactRouter } from '@react-router/dev/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import fumadocsMdx from 'fumadocs-mdx/vite';
import * as mdxConfig from './app/source/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fumadocs dependencies that need special handling in Vite
const FumadocsDeps = ['fumadocs-core', 'fumadocs-ui', 'fumadocs-mdx'];

export default defineConfig(({ mode, command }) => {
    const isTest =
        (command === 'serve' && process.env.NODE_ENV === 'test') ||
        process.env.VITEST;

    return {
        plugins: [
            fumadocsMdx(mdxConfig, {
                configPath: resolve(__dirname, './app/source/config.ts'),
                outDir: resolve(__dirname, './app/source'),
                generateIndexFile: false
            }),
            tailwindcss(),
            // Use React Router plugin for build/dev, regular React plugin for tests
            isTest ? react() : reactRouter(),
            tsconfigPaths()
            // add more plugins here if needed
        ],
        define: {
            'process.env.NODE_ENV': JSON.stringify(
                mode === 'development' ? 'development' : 'production'
            )
        },
        build: {
            rollupOptions: {
                external: [],
                output: {
                    manualChunks: undefined
                }
            }
        },
        test: {
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.ts'],
            globals: true
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './app')
            },
            noExternal: FumadocsDeps
        },
        optimizeDeps: {
            exclude: FumadocsDeps
        }
    };
});
