// import { remarkAutoTypeTable, createGenerator } from 'fumadocs-typescript';
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

// const generator = createGenerator();

export const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        postprocess: {
            includeProcessedMarkdown: true
        }
    }
});

export default defineConfig({
    // mdxOptions: {
    //     remarkPlugins: [[remarkAutoTypeTable, { generator }]]
    // }
});
