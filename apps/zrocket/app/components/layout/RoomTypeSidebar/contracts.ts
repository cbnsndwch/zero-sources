import { RoomType } from '@cbnsndwch/zrocket-contracts';
import { MessageSquare, Hash, Lock } from 'lucide-react';
// import { Star, Archive } from 'lucide-react';

export const roomTypes = [
    // {
    //     id: 'threads' as RoomType,
    //     name: 'Threads',
    //     Icon: MessageSquare
    // },
    {
        id: RoomType.PublicChannel,
        name: 'Public Channels',
        Icon: Hash
    },
    {
        id: RoomType.PrivateGroup,
        name: 'Private Groups',
        Icon: Lock
    },
    {
        id: RoomType.DirectMessages,
        name: 'Direct Messages',
        Icon: MessageSquare
    }
    // {
    //     id: 'starred' as RoomType,
    //     name: 'Starred',
    //     Icon: Star
    // },
    // {
    //     id: 'archived' as RoomType,
    //     name: 'Archive',
    //     Icon: Archive
    // }
] as const;

export type RoomTypeItem = (typeof roomTypes)[number];

export type RoomTypeSidebarProps = {
    activeRoomType: RoomType;
    setActiveRoomType: (type: RoomType) => void;
};
