import { defineConfig } from 'vite';

import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => ({
    plugins: [
        tailwindcss(),
        reactRouter(),
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
    }
}));
