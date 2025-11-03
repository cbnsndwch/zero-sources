import Link from 'fumadocs-core/link';
import type { ComponentType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Cards(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={cn('grid grid-cols-2 gap-3 @container', props.className)}
        >
            {props.children}
        </div>
    );
}

export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
    icon?: ReactNode | ComponentType;
    title: ReactNode;
    description?: ReactNode;

    href?: string;
    external?: boolean;
};

export function Card({ icon: Icon, title, description, ...props }: CardProps) {
    const LinkComponent = props.href ? Link : 'div';

    return (
        <LinkComponent
            {...props}
            data-card
            className={cn(
                'block rounded-xl border bg-fd-card p-4 text-fd-card-foreground transition-colors @max-lg:col-span-full',
                props.href && 'hover:bg-fd-accent/80',
                props.className
            )}
        >
            <h3 className="not-prose mb-1 text-sm font-medium flex justify-start items-center gap-2">
                {Icon ? (
                    <div className="not-prose w-fit shadow-md rounded-lg border bg-fd-muted p-1.5 text-fd-muted-foreground [&_svg]:size-4">
                        {typeof Icon === 'function' ? <Icon /> : Icon}
                    </div>
                ) : null}
                {title}
            </h3>
            {description ? (
                <p className="my-0! text-sm text-fd-muted-foreground">
                    {description}
                </p>
            ) : null}
            <div className="text-sm text-fd-muted-foreground prose-no-margin empty:hidden">
                {props.children}
            </div>
        </LinkComponent>
    );
}
