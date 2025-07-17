import { useQuery } from '@rocicorp/zero/react';

import type { Route } from '+routes/room/+types';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import { useZero } from '@/zero/use-zero';

import Skeleton from './skeleton';
import RoomTypeIcon from '@/components/icons/room-icon';

export default function ({ params }: Route.ComponentProps) {
    const { roomId } = params;

    const zero = useZero();
    const [room, roomResult] = useQuery(
        zero.query.rooms
            .where('_id', '=', roomId)
            .orderBy('lastMessageAt', 'desc')
            .one()
    );

    if (roomResult.type !== 'complete') {
        return <Skeleton />;
    }

    if (!room) {
        return <h1>Room not found</h1>;
    } else {
        document.title = `${room.name} - ZChat`;
    }

    return (
        <div className="grow flex flex-col justify-start items-stretch fade-in-500">
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Rooms</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex justify-start items-center gap-1">
                                    <RoomTypeIcon
                                        t={room.t}
                                        className="w-4 h-4"
                                    />
                                    {room?.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Skeleton />
            </div>
        </div>
    );
}
