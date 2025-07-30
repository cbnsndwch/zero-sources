import { AnimatePresence, motion } from 'framer-motion';
import { Forward, Heart, MoreVerticalIcon } from 'lucide-react';

import type { IUserMessage } from '@cbnsndwch/zrocket-contracts';

import { ChatMessageList } from './chat-message-list';
import {
    ChatBubble,
    ChatBubbleAction,
    ChatBubbleActionWrapper,
    ChatBubbleAvatar,
    ChatBubbleMessage,
    ChatBubbleTimestamp
} from './chat-bubble';

interface ChatListProps {
    messages: IUserMessage[];
    // selectedUser: UserData;
    // sendMessage: (newMessage: Message) => void;
    selectedUser: any;
    sendMessage: (newMessage: any) => void;
}

// const getMessageVariant = (messageName: string, selectedUserName: string) =>
//     messageName !== selectedUserName ? 'sent' : 'received';

export function ChatList({
    messages
    // selectedUser
    // sendMessage,
}: ChatListProps) {
    const actionIcons = [
        { icon: MoreVerticalIcon, type: 'More' },
        { icon: Forward, type: 'Like' },
        { icon: Heart, type: 'Share' }
    ];

    return (
        <div className="w-full overflow-y-hidden h-full flex flex-col">
            <ChatMessageList>
                <AnimatePresence>
                    {messages.map((message, index) => {
                        const variant = 'sent';
                        // const variant = getMessageVariant(
                        //     message.name,
                        //     selectedUser.name
                        // );
                        return (
                            <motion.div
                                key={index}
                                layout
                                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                                transition={{
                                    opacity: { duration: 0.1 },
                                    layout: {
                                        type: 'spring',
                                        bounce: 0.3,
                                        duration: index * 0.05 + 0.2
                                    }
                                }}
                                style={{ originX: 0.5, originY: 0.5 }}
                                className="flex flex-col gap-2 p-4"
                            >
                                <ChatBubble variant={variant}>
                                    <ChatBubbleAvatar
                                        src={(message as any).avatar || '#'}
                                    />
                                    <ChatBubbleMessage
                                    // isLoading={message.isLoading}
                                    >
                                        {JSON.stringify(message)}

                                        {message.updatedAt ? (
                                            <ChatBubbleTimestamp
                                                timestamp={String(
                                                    message.updatedAt
                                                )}
                                            />
                                        ) : null}
                                    </ChatBubbleMessage>
                                    <ChatBubbleActionWrapper>
                                        {actionIcons.map(
                                            ({ icon: Icon, type }) => (
                                                <ChatBubbleAction
                                                    className="size-7"
                                                    key={type}
                                                    icon={
                                                        <Icon className="size-4" />
                                                    }
                                                    onClick={() =>
                                                        console.log(
                                                            `Action ${type} clicked for message ${index}`
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </ChatBubbleActionWrapper>
                                </ChatBubble>

                                {/* {message.type === 'text' ? (
                                    <ChatBubble variant={variant}>
                                        <ChatBubbleAvatar
                                            src={(message as any).avatar || '#'}
                                        />
                                        <ChatBubbleMessage
                                        // isLoading={message.isLoading}
                                        >
                                            {JSON.stringify(message)}

                                            {message.ts && (
                                                <ChatBubbleTimestamp
                                                    timestamp={message.ts}
                                                />
                                            )}
                                        </ChatBubbleMessage>
                                        <ChatBubbleActionWrapper>
                                            {actionIcons.map(
                                                ({ icon: Icon, type }) => (
                                                    <ChatBubbleAction
                                                        className="size-7"
                                                        key={type}
                                                        icon={
                                                            <Icon className="size-4" />
                                                        }
                                                        onClick={() =>
                                                            console.log(
                                                                `Action ${type} clicked for message ${index}`
                                                            )
                                                        }
                                                    />
                                                )
                                            )}
                                        </ChatBubbleActionWrapper>
                                    </ChatBubble>
                                ) : (
                                    <ChatBubble variant={variant}>
                                        <ChatBubbleAvatar
                                            src={(message as any).avatar || '#'}
                                        />
                                        <ChatBubbleMessage
                                        // isLoading={message.isLoading}
                                        >
                                            {JSON.stringify(message)}
                                            {message.ts && (
                                                <ChatBubbleTimestamp
                                                    timestamp={message.ts}
                                                />
                                            )}
                                        </ChatBubbleMessage>
                                        <ChatBubbleActionWrapper>
                                            {actionIcons.map(
                                                ({ icon: Icon, type }) => (
                                                    <ChatBubbleAction
                                                        className="size-7"
                                                        key={type}
                                                        icon={
                                                            <Icon className="size-4" />
                                                        }
                                                        onClick={() =>
                                                            console.log(
                                                                `Action ${type} clicked for message ${index}`
                                                            )
                                                        }
                                                    />
                                                )
                                            )}
                                        </ChatBubbleActionWrapper>
                                    </ChatBubble>
                                )} */}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </ChatMessageList>
        </div>
    );
}
