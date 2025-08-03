import type { Query } from '@rocicorp/zero';
import { useQuery, type Schema } from '@rocicorp/zero/react';

import type { IUserMessage } from '@cbnsndwch/zrocket-contracts';

// import {
//     Breadcrumb,
//     BreadcrumbItem,
//     BreadcrumbLink,
//     BreadcrumbList,
//     BreadcrumbPage,
//     BreadcrumbSeparator
// } from '@/components/ui/breadcrumb';

// import RoomTypeIcon from '@/components/icons/room-icon';
import { ChatList } from '@/components/ui/chat/chat-list';
import ChatBottomBar from '@/components/ui/chat/chat-bottom-bar';

import { useZero } from '@/zero/use-zero';

import Skeleton from './skeleton';

const roomTitle = 'Messages Demo';

export default function MessagesDemo() {
    const z = useZero();

    const [messages, result] = useQuery(
        z.query.userMessages
            .limit(20)
            .orderBy('createdAt', 'desc') as unknown as Query<
            Schema,
            'userMessages',
            IUserMessage[]
        >,
        { enabled: !!z }
    );

    if (result.type !== 'complete') {
        return <Skeleton />;
    }

    if (!messages) {
        return <h1>Group not found</h1>;
    } else {
        document.title = `Messages Demo - ZRocket`;
    }

    return (
        <div className="grow flex flex-col justify-start items-stretch fade-in-500">
            {/* <header className="flex h-16 shrink-0 items-center gap-2">
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
                                    {messages?.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header> */}
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
