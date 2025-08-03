import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Spacer({ className, ...props }: ComponentProps<'div'>) {
    return <div {...props} className={cn('flex-1', className)} />;
}
