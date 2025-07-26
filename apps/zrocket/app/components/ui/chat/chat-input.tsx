import * as React from 'react';

// import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

// type ChatInputProps = React.ComponentProps<'textarea'>;

type ChatInputProps = React.ComponentProps<'input'>;

export const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(
    ({ className, ...props }, ref) => (
        // <Textarea
        //     autoComplete="off"
        //     ref={ref}
        //     name="message"
        //     className={cn(
        //         'max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none',
        //         className
        //     )}
        //     {...props}
        // />
        <Input
            ref={ref}
            autoComplete="off"
            name="message"
            className={cn(
                'max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none',
                className
            )}
            {...props}
        />
    )
);
ChatInput.displayName = 'ChatInput';
