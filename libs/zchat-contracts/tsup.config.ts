import { defineConfig } from 'tsup';

export default defineConfig({
    bundle: true,
    clean: true,
    cjsInterop: true,
    dts: true,
    sourcemap: true,
    platform: 'node',
    outDir: 'dist',
    format: ['esm', 'cjs'],
    entry: ['src/index.ts']
});
