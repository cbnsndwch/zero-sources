import { RoomType } from '@cbnsndwch/zrocket-contracts';

import type { Route } from './+types/index';

import Skeleton from './skeleton';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import useGroup from '@/hooks/use-group';
import useRoomMessages from '@/hooks/use-room-messages';

import RoomTypeIcon from '@/components/icons/room-icon';
import { ChatList } from '@/components/ui/chat/chat-list';
import ChatBottomBar from '@/components/ui/chat/chat-bottom-bar';
import useRoomTitle from '@/hooks/use-room-title';

export default function Group({ params }: Route.ComponentProps) {
    const { groupId } = params;

    const [room, roomResult] = useGroup(groupId);
    const messages = useRoomMessages(room);
    const roomTitle = useRoomTitle(room);

    if (roomResult.type !== 'complete') {
        return <Skeleton />;
    }

    if (!room) {
        return <h1>Group not found</h1>;
    } else {
        document.title = `${room.name} - ZRocket`;
    }

    return (
        <div className="relative flex-1 flex flex-col justify-start items-stretch fade-in-500">
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
                                        t={RoomType.PrivateGroup}
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
                <ChatList
                    messages={messages}
                    selectedUser={{ name: roomTitle }}
                    sendMessage={() => {}}
                />

                <ChatBottomBar />
            </div>
        </div>
    );
}
