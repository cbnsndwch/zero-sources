import { Hash } from 'lucide-react';

import type { IHasShortId } from '@cbnsndwch/zrocket-contracts';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useChannel from '@/hooks/use-channel';
import useUsersByIds from '@/hooks/use-users-by-ids';
import useRoomTitle from '@/hooks/use-room-title';

import { RoomHeader } from './shared/RoomHeader';
import { RoomAbout } from './shared/RoomAbout';
import { PinnedMessages } from './shared/PinnedMessages';
import { MembersList } from './shared/MembersList';
import { RoomActions } from './shared/RoomActions';

export default function ChannelDetails({ id }: IHasShortId) {
    const channelResult = useChannel(id);
    const channel = channelResult[0] as any;

    const title = useRoomTitle(channel, 'channel');
    const memberIds = channel?.memberIds || [];
    const usersMap = useUsersByIds(memberIds);

    const roomMembers = memberIds
        .map((memberId: string) => usersMap.get(memberId))
        .filter(Boolean);

    const description =
        channel?.description ||
        `Welcome to #${title}! This is where the team collaborates.`;

    if (!channel) {
        return (
            <div className="h-full bg-background border-l border-border flex items-center justify-center">
                <div className="text-muted-foreground">Channel not found</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background border-l border-border">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    <RoomHeader title={title} Icon={Hash} />

                    <Separator />

                    <RoomAbout description={description} />

                    <Separator />

                    <PinnedMessages />

                    <Separator />

                    <MembersList members={roomMembers} />

                    <Separator />

                    <RoomActions roomType="channel" />
                </div>
            </ScrollArea>
        </div>
    );
}
