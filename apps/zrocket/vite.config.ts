import path from 'node:path';

import { defineConfig } from 'vite';

import { reactRouter } from '@react-router/dev/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode, command }) => {
    const isTest = command === 'serve' && process.env.NODE_ENV === 'test' || process.env.VITEST;
    
    return {
        plugins: [
            tailwindcss(),
            // Use React Router plugin for build/dev, regular React plugin for tests
            isTest ? react() : reactRouter(),
            tsconfigPaths()
            // add more plugins here if needed
        ],
        ssr: {
            noExternal: ['lexical', '@lexical/*']
        },
        optimizeDeps: {
            include: [
                'lexical'
                // '@lexical/rich-text',
                // '@lexical/history',
                // '@lexical/link',
                // '@lexical/list',
                // '@lexical/utils'
            ],
            exclude: [],
            force: true
        },
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
            }
        }
    };
});
