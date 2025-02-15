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

export type CreateRoomButtonProps = {
    type: RoomType;
    title: string;
};

export default function CreateRoomButton({ type, title }: CreateRoomButtonProps) {
    const zero = useZero();

    // TODO: review custom mutators docs
    const onAccept = useCallback(() => {
        const rooms = zero.mutate.rooms as any;

        rooms.create({
            t: type,
            name: 'New Room'
        });
    }, [zero]);

    return (
        <>
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Give your room a name"
                                    className="col-span-3"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={onAccept}>Create</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Tooltip>
        </>
    );
}
