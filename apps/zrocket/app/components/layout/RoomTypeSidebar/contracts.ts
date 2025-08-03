import { MessageSquare, Hash, Lock } from 'lucide-react';
// import { Star, Archive } from 'lucide-react';

import type { RoomType } from '@/utils/room-preferences';

export const roomTypes = [
    // {
    //     id: 'threads' as RoomType,
    //     name: 'Threads',
    //     Icon: MessageSquare
    // },
    {
        id: 'dms' as RoomType,
        name: 'DMs',
        Icon: MessageSquare
    },
    {
        id: 'channels' as RoomType,
        name: 'Channels',
        Icon: Hash
    },
    {
        id: 'groups' as RoomType,
        name: 'Private Groups',
        Icon: Lock
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
