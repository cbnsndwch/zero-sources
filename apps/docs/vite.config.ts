import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

// Fumadocs dependencies that need special handling in Vite
const FumadocsDeps = ['fumadocs-core', 'fumadocs-ui', 'fumadocs-mdx'];

export default defineConfig({
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
        noExternal: FumadocsDeps
    },
    optimizeDeps: {
        exclude: FumadocsDeps
    }
});
