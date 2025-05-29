import { defineConfig } from 'vitest/config.js';

export default defineConfig({
    test: {
        api: {
            port: 5174
        },
        globals: true,
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html']
        }
    }
});
