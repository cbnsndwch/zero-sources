import { User } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useChat from '@/hooks/use-chat';
import useRoomTitle from '@/hooks/use-room-title';

import { RoomHeader } from './shared/RoomHeader';
import { RoomAbout } from './shared/RoomAbout';
import { PinnedMessages } from './shared/PinnedMessages';
import { RoomActions } from './shared/RoomActions';

interface ChatDetailsProps {
    chatId: string;
}

export function ChatDetails({ chatId }: ChatDetailsProps) {
    const chatResult = useChat(chatId);
    const chat = chatResult[0] as any;

    const title = useRoomTitle(chat, 'dm');
    const description = `Direct messages with ${title}.`;

    if (!chat) {
        return (
            <div className="h-full bg-background border-l border-border flex items-center justify-center">
                <div className="text-muted-foreground">Chat not found</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background border-l border-border">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    <RoomHeader title={title} Icon={User} />

                    <Separator />

                    <RoomAbout description={description} />

                    <Separator />

                    <PinnedMessages />

                    <Separator />

                    <RoomActions roomType="dm" />
                </div>
            </ScrollArea>
        </div>
    );
}
