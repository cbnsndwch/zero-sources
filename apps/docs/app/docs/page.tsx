import { toClientRenderer } from 'fumadocs-mdx/runtime/vite';
// import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
// import {
//     DocsBody,
//     DocsDescription,
//     DocsPage,
//     DocsTitle
// } from 'fumadocs-ui/page';

import type { Route } from './+types/page';
import { docs } from '@/.source';
import { source } from '@/app/lib/source';
import { baseOptions } from '@/app/lib/layout.shared';

import ViewOptions from '@/components/page-actions/ViewOptions';
import CopyButton from '@/components/page-actions/CopyButton';
import Separator from '@/components/ui/separator';
import Feedback from '@/components/feedback';
import {
    DocsBody,
    DocsDescription,
    DocsPage,
    DocsTitle
} from '@/components/layout/page';
import { DocsLayout } from '@/components/layout/docs';

export async function loader({ params }: Route.LoaderArgs) {
    const slugs = params['*'].split('/').filter(v => v.length > 0);
    const page = source.getPage(slugs);
    if (!page) {
        throw new Response('Not found', { status: 404 });
    }

    return {
        tree: source.getPageTree(),
        path: page.path,
        url: page.url
    };
}

const GITHUB_DOCS_BASE =
    'https://github.com/cbnsndwch/zero-sources/blob/main/apps/docs/content/docs';

type ContentProps = {
    path: string;
    url: string;
};

const renderer = toClientRenderer(docs.doc, (loaded, props: ContentProps) => {
    const { default: Mdx, toc, frontmatter: pageData } = loaded;
    const githubUrl = `${GITHUB_DOCS_BASE}/${props.path}`;

    return (
        <DocsPage toc={toc} full={pageData.full}>
            <title>{pageData.title}</title>
            <meta name="description" content={pageData.description} />
            <DocsTitle className="flex justify-between items-center gap-4">
                {pageData.title}

                <div className="flex flex-row gap-2 items-center">
                    <CopyButton markdownUrl={`${props.url}.mdx`} />
                    <ViewOptions
                        markdownUrl={`${props.url}.mdx`}
                        githubUrl={githubUrl}
                    />
                </div>
            </DocsTitle>
            <DocsDescription className="mb-2">
                {pageData.description}
            </DocsDescription>

            <Separator className="my-2" />

            <DocsBody>
                <Mdx components={{ ...defaultMdxComponents }} />
            </DocsBody>

            <Feedback
                onRateAction={async (url, feedback) => {
                    console.log(
                        `feedback for ${url}:`,
                        JSON.stringify(feedback)
                    );

                    return {
                        githubUrl: ''
                    };
                }}
            />
        </DocsPage>
    );
});

export default function DocsIndexPage({ loaderData }: Route.ComponentProps) {
    const { tree, path, url } = loaderData;
    const Content = renderer[path];

    if (!Content) {
        return <div>Content not found</div>;
    }

    return (
        <DocsLayout tree={tree as any} {...baseOptions()}>
            <Content path={path} url={url} />
        </DocsLayout>
    );
}
