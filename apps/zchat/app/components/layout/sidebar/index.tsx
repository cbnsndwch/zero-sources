import type { CSSProperties } from 'react';
import {
    BugIcon,
    HashIcon,
    MessageSquareDashedIcon,
    MessageSquareIcon,
    PlusIcon
} from 'lucide-react';
import { useQuery } from '@rocicorp/zero/react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarMenuAction } from '@/components/ui/sidebar';
import { useZero } from '@/zero/use-zero';

import { NavGroup } from './nav-group';
import { NavUser } from './nav-user';
import { sidebarData } from './data';
import { Button } from '@/components/ui/button';
import CreateRoomButton from './create-room-button';

export function AppSidebar() {
    const z = useZero();

    const [dmRooms] = useQuery(z.query.rooms.where('t', '=', 'd').orderBy('lastMessageAt', 'desc'));
    const [privateGroups] = useQuery(
        z.query.rooms.where('t', '=', 'p').orderBy('lastMessageAt', 'desc')
    );
    const [publicChannels] = useQuery(
        z.query.rooms.where('t', '=', 'c').orderBy('lastMessageAt', 'desc')
    );

    const [allRooms] = useQuery(z.query.rooms.orderBy('lastMessageAt', 'desc'));

    return (
        <Sidebar
            variant="sidebar"
            collapsible="none"
            style={
                {
                    '--sidebar-width': '16rem',
                    '--sidebar-width-icon': '3rem'
                } as CSSProperties
            }
        >
            <SidebarContent className="gap-0">
                <NavGroup
                    title="DMs"
                    actions={[<CreateRoomButton key="create" type="d" title="Create DMs Room" />]}
                    items={dmRooms.map(room => ({
                        title: room.name ?? room.usernames?.join(', ') ?? `DM ${room._id}`,
                        url: `/r/${room._id}`,
                        icon: MessageSquareIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                <NavGroup
                    title="Private"
                    items={privateGroups.map(room => ({
                        title: room.name ?? room.usernames?.join(', ') ?? `DM ${room._id}`,
                        url: `/r/${room._id}`,
                        icon: HashIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                <NavGroup
                    title="Public"
                    items={publicChannels.map(room => ({
                        title: room.name ?? room.usernames?.join(', ') ?? `DM ${room._id}`,
                        url: `/r/${room._id}`,
                        icon: MessageSquareDashedIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                <NavGroup
                    title="All (DEBUG)"
                    items={allRooms.map(room => ({
                        title: room.name ?? room.usernames?.join(', ') ?? `DM ${room._id}`,
                        url: `/r/${room._id}`,
                        icon: BugIcon
                        // badge: room.unreadCount,
                        // badgeColor: 'bg-red-500'
                    }))}
                />

                {/* {sidebarData.navGroups.map(props => (
                    <NavGroup key={props.title} {...props} />
                ))} */}
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={sidebarData.user} />
            </SidebarFooter>
        </Sidebar>
    );
}
