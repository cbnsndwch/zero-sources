import { useCallback } from 'react';
import { PlusIcon } from 'lucide-react';

import type { RoomType } from '@cbnsndwch/zchat-contracts';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { useZero } from '@/zero/use-zero';
import { Form, useForm } from 'react-hook-form';
import { createRoomInputSchema, type CreateRoomInput } from '@/zero/mutators';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';

export type CreateRoomButtonProps = {
    type: RoomType;
    title: string;
};

export default function CreateRoomButton({ type, title }: CreateRoomButtonProps) {
    const zero = useZero();

    const form = useForm<CreateRoomInput>({
        resolver: zodResolver(createRoomInputSchema),
        defaultValues: {
            t: type,
            name: ''
        }
    });

    // TODO: review custom mutators docs
    const onSubmit = useCallback((data: CreateRoomInput) => zero.mutate.dm.create(data), [zero]);

    return (
        <Form {...form}>
            <Tooltip>
                <Dialog>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="cursor-pointer h-3 w-3 p-1"
                            >
                                <PlusIcon className="h-2 w-2" />
                            </Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent side="right">{title}</TooltipContent>
                    <DialogContent asChild>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col space-y-4 justify-start items-center gap-4"
                        >
                            <DialogHeader>
                                <DialogTitle>{title}</DialogTitle>
                            </DialogHeader>

                            <FormField
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Give your room a name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The display name for the room. This can be changed
                                            later.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="submit">Create</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Tooltip>
        </Form>
    );
}
