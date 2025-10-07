import type { CSSProperties } from 'react';
import {
    HashIcon,
    MessageSquareLockIcon,
    MessageSquareIcon
} from 'lucide-react';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import useChats from '@/hooks/use-chats';
import useGroups from '@/hooks/use-groups';
import useChannels from '@/hooks/use-channels';
import { SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

import { sidebarData } from './data';
import { NavGroup } from './nav-group';
import { NavUser } from './nav-user';
import CreateRoomButton from './create-room-button';

export function AppSidebar() {
    const [chats] = useChats();
    const [groups] = useGroups();
    const [channels] = useChannels();

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
