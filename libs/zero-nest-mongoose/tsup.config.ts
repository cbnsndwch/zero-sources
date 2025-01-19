import { defineConfig } from 'tsup';

export default defineConfig({
    bundle: true,
    clean: true,
    cjsInterop: true,
    dts: true,
    sourcemap: true,
    noExternal: [/@rocicorp\/.+/],
    platform: 'node',
    outDir: 'dist',
    format: ['cjs'],
    entry: ['src/index.mts']
});
