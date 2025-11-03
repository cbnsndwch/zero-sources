declare module '*.mdx' {
    import { MDXProps } from 'mdx/types';

    export default function MDXContent(props: MDXProps): JSX.Element;
    export const frontmatter: Record<string, any>;
    export const toc: any[];
}

export declare global {
    type Dict<T = any> = {
        [key: string]: T;
    };
}
