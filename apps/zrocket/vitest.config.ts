import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        globals: true,
        exclude: ['**/*.spec.ts', 'node_modules/**', 'dist/**']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './app')
        }
    }
});
