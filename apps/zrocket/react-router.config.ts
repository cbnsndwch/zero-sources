import type { Config } from '@react-router/dev/config';

export default {
    ssr: false,
    prerender: false,
    future: {
        unstable_optimizeDeps: true
    }
} satisfies Config;
