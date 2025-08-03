import { Lock } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useGroup from '@/hooks/use-group';
import useUsersByIds from '@/hooks/use-users-by-ids';
import useRoomTitle from '@/hooks/use-room-title';

import { RoomHeader } from './shared/RoomHeader';
import { RoomAbout } from './shared/RoomAbout';
import { PinnedMessages } from './shared/PinnedMessages';
import { MembersList } from './shared/MembersList';
import { RoomActions } from './shared/RoomActions';

interface GroupDetailsProps {
    groupId: string;
}

export function GroupDetails({ groupId }: GroupDetailsProps) {
    const groupResult = useGroup(groupId);
    const group = groupResult[0] as any;

    const title = useRoomTitle(group, 'group');
    const memberIds = group?.memberIds || [];
    const usersMap = useUsersByIds(memberIds);

    const roomMembers = memberIds
        .map((memberId: string) => usersMap.get(memberId))
        .filter(Boolean);

    const description = `Private group for ${title} discussions.`;

    if (!group) {
        return (
            <div className="h-full bg-background border-l border-border flex items-center justify-center">
                <div className="text-muted-foreground">Group not found</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background border-l border-border">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    <RoomHeader title={title} Icon={Lock} />

                    <Separator />

                    <RoomAbout description={description} />

                    <Separator />

                    <PinnedMessages />

                    <Separator />

                    <MembersList members={roomMembers} />

                    <Separator />

                    <RoomActions roomType="group" />
                </div>
            </ScrollArea>
        </div>
    );
}
