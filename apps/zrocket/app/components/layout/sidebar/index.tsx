import type { CSSProperties } from 'react';
import {
    HashIcon,
    MessageSquareLockIcon,
    MessageSquareIcon
} from 'lucide-react';
import { useQuery } from '@rocicorp/zero/react';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { sidebarData } from './data';

import { NavGroup } from './nav-group';
import { NavUser } from './nav-user';
import CreateRoomButton from './create-room-button';

import { useZero } from '@/zero/use-zero';
import { SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

export function AppSidebar() {
    const z = useZero();

    const [chats] = useQuery(z.query.chats.orderBy('lastMessageAt', 'desc'));
    const [groups] = useQuery(z.query.groups.orderBy('lastMessageAt', 'desc'));
    const [channels] = useQuery(z.query.channels);

    return (
        <div
            id="app-sidebar"
            className="shrink w-3xs min-w-3xs bg-red-200"
            style={
                {
                    '--sidebar-width': '16rem',
                    '--sidebar-width-icon': '3rem'
                } as CSSProperties
            }
        >
            <SidebarContent className="gap-0">
                <NavGroup
                    title="Public"
                    actions={[
                        <CreateRoomButton
                            key="create"
                            type={RoomType.PublicChannel}
                            title="Create Public Channel"
                        />
                    ]}
                    items={channels.map(room => ({
                        title: room.name ?? `Channel ${room._id}`,
                        url: `/c/${room._id}`,
                        icon: HashIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                <NavGroup
                    title="Private"
                    actions={[
                        <CreateRoomButton
                            key="create"
                            type={RoomType.PrivateGroup}
                            title="Create Private Group"
                        />
                    ]}
                    items={groups.map(room => ({
                        title: room.name ?? `Group ${room._id}`,
                        url: `/p/${room._id}`,
                        icon: MessageSquareLockIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                <NavGroup
                    title="DMs"
                    actions={[
                        <CreateRoomButton
                            key="create"
                            type={RoomType.DirectMessages}
                            title="Create DMs Room"
                        />
                    ]}
                    items={chats.map(room => ({
                        title: room.usernames?.join(', ') ?? `DM ${room._id}`,
                        url: `/d/${room._id}`,
                        icon: MessageSquareIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                {/* <NavGroup
                    title="All (DEBUG)"
                    items={allRooms.map(room => ({
                        title:
                            room.name ??
                            room.usernames?.join(', ') ??
                            `DM ${room._id}`,
                        url: `/r/${room._id}`,
                        icon: () => <RoomTypeIcon t={room.t} />
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                /> */}

                {/* {sidebarData.navGroups.map(props => (
                    <NavGroup key={props.title} {...props} />
                ))} */}
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={sidebarData.user} />
            </SidebarFooter>
        </div>
    );
}
