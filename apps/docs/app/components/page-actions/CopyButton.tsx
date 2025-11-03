'use client';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

const cache = new Map<string, string>();

type CopyButtonProps = {
    /**
     * A URL to fetch the raw Markdown/MDX content of page
     */
    markdownUrl: string;
};

export default function CopyButton({ markdownUrl }: CopyButtonProps) {
    const [isLoading, setLoading] = useState(false);

    const [checked, onClick] = useCopyButton(async () => {
        const cached = cache.get(markdownUrl);
        if (cached) return navigator.clipboard.writeText(cached);

        setLoading(true);

        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/plain': fetch(markdownUrl).then(async res => {
                        const content = await res.text();
                        cache.set(markdownUrl, content);

                        return content;
                    })
                })
            ]);
        } finally {
            setLoading(false);
        }
    });

    return (
        <Button
            disabled={isLoading}
            size="sm"
            variant="secondary"
            className="text-sm gap-2 cursor-pointer [&_svg]:size-3.5 [&_svg]:text-fd-muted-foreground"
            onClick={onClick}
        >
            {checked ? <Check /> : <Copy />}
            Copy as Markdown
        </Button>
    );
}
