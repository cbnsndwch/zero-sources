import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { Outlet } from 'react-router';

import { WorkspaceSidebar } from './WorkspaceSidebar';
import { SearchHeader } from './SearchHeader';
import { RoomTypeSidebar } from './RoomTypeSidebar';
import { RoomList } from './RoomList';
import { RoomDetails } from './RoomDetails';
import { EmptyChat } from './EmptyChat';

import { SidebarProvider } from '@/components/ui/sidebar';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle
} from '@/components/ui/resizable';

// Room data for navigation - this will be replaced with zero data
const roomsByType = {
    channels: [
        { id: 'general', url: '/c/general' },
        { id: 'announcements', url: '/c/announcements' },
        { id: 'backend', url: '/c/backend' },
        { id: 'design', url: '/c/design' },
        { id: 'development', url: '/c/development' },
        { id: 'frontend', url: '/c/frontend' },
        { id: 'help', url: '/c/help' },
        { id: 'marketing', url: '/c/marketing' },
        { id: 'product', url: '/c/product' },
        { id: 'random', url: '/c/random' },
        { id: 'testing', url: '/c/testing' },
        { id: 'ux-research', url: '/c/ux-research' }
    ],
    groups: [
        { id: 'design-team', url: '/p/design-team' },
        { id: 'leadership', url: '/p/leadership' },
        { id: 'project-alpha', url: '/p/project-alpha' },
        { id: 'frontend-guild', url: '/p/frontend-guild' },
        { id: 'marketing-team', url: '/p/marketing-team' },
        { id: 'backend-squad', url: '/p/backend-squad' },
        { id: 'qa-circle', url: '/p/qa-circle' },
        { id: 'product-planning', url: '/p/product-planning' }
    ],
    dms: [
        { id: 'alice', url: '/d/alice' },
        { id: 'bob', url: '/d/bob' },
        { id: 'carol', url: '/d/carol' },
        { id: 'david', url: '/d/david' },
        { id: 'emily', url: '/d/emily' },
        { id: 'frank', url: '/d/frank' },
        { id: 'grace', url: '/d/grace' },
        { id: 'henry', url: '/d/henry' },
        { id: 'isabella', url: '/d/isabella' },
        { id: 'jack', url: '/d/jack' }
    ]
};

// Helper functions for localStorage
function getLastVisitedRoom(roomType: string): string | null {
    return localStorage.getItem(`lastVisited_${roomType}`);
}

function setLastVisitedRoom(roomType: string, roomId: string) {
    localStorage.setItem(`lastVisited_${roomType}`, roomId);
}

export default function SidebarLayout() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRoomType, setActiveRoomType] = useState('channels');
    const [isManualSelection, setIsManualSelection] = useState(false);
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // Determine current room type from URL - but respect manual selections
    useEffect(() => {
        if (isManualSelection) {
            return;
        }

        const pathParts = location.pathname.split('/');
        if (pathParts[1]) {
            const currentType =
                pathParts[1] === 'c'
                    ? 'channels'
                    : pathParts[1] === 'p'
                      ? 'groups'
                      : pathParts[1] === 'd'
                        ? 'dms'
                        : 'channels';

            if (currentType !== activeRoomType) {
                setActiveRoomType(currentType);
            }

            // Save current room as last visited for this type
            if (pathParts[2]) {
                setLastVisitedRoom(currentType, pathParts[2]);
            }
        }
    }, [location.pathname, activeRoomType, isManualSelection]);

    // Handle room type change with smart navigation
    const handleRoomTypeChange = (newRoomType: string) => {
        if (newRoomType === activeRoomType) return;

        setActiveRoomType(newRoomType);
        setIsManualSelection(true);

        // Get the rooms for this type
        const roomsForType =
            roomsByType[newRoomType as keyof typeof roomsByType];

        // If no rooms exist for this type, navigate to a special empty state route
        if (!roomsForType || roomsForType.length === 0) {
            navigate(`/empty/${newRoomType}`, { replace: true });
            return;
        }

        // Reset manual selection flag since we're navigating to actual rooms
        setIsManualSelection(false);

        // Check if we have a last visited room for this type
        const lastVisited = getLastVisitedRoom(newRoomType);
        let targetRoom = roomsForType[0]; // Default to first room

        // If we have a last visited room, try to find it in the current rooms
        if (lastVisited) {
            const foundRoom = roomsForType.find(
                room => room.id === lastVisited
            );
            if (foundRoom) {
                targetRoom = foundRoom;
            }
        }

        // Navigate to the target room
        navigate(targetRoom.url);
    };

    // Handle initial navigation - if user visits root, go to last visited or first channel
    useEffect(() => {
        if (location.pathname === '/') {
            const lastVisited = getLastVisitedRoom('channels');
            const channelsForType = roomsByType.channels;

            if (lastVisited) {
                const foundRoom = channelsForType.find(
                    room => room.id === lastVisited
                );
                if (foundRoom) {
                    navigate(foundRoom.url, { replace: true });
                    return;
                }
            }

            // Navigate to first channel as fallback
            navigate(channelsForType[0].url, { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <SidebarProvider>
            <div className="h-screen flex w-full bg-muted/30 p-3">
                {/* Left workspace sidebar */}
                <WorkspaceSidebar />

                <div className="flex-1 flex flex-col ml-3 min-h-0">
                    {/* Search header outside main content */}
                    <SearchHeader
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />

                    {/* Main content area with rounded border */}
                    <div className="flex-1 flex bg-background rounded-lg border border-border shadow-sm overflow-hidden mt-3 min-h-0">
                        <div className="flex-1 flex overflow-hidden">
                            {/* Room type sidebar */}
                            <RoomTypeSidebar
                                activeRoomType={activeRoomType}
                                setActiveRoomType={handleRoomTypeChange}
                            />

                            {/* Resizable panels for room list, chat content, and room details */}
                            <ResizablePanelGroup
                                direction="horizontal"
                                className="flex-1"
                            >
                                {/* Room list panel */}
                                <ResizablePanel
                                    defaultSize={20}
                                    minSize={15}
                                    maxSize={35}
                                >
                                    <div className="h-full border-r border-border bg-background overflow-hidden">
                                        <RoomList
                                            roomType={activeRoomType}
                                            searchQuery={searchQuery}
                                        />
                                    </div>
                                </ResizablePanel>

                                <ResizableHandle withHandle />

                                {/* Chat content panel */}
                                <ResizablePanel
                                    defaultSize={isRoomDetailsOpen ? 55 : 80}
                                    minSize={30}
                                >
                                    <main className="h-full overflow-hidden">
                                        {params.chatId ||
                                        params.groupId ||
                                        params.channelId ? (
                                            <div className="h-full">
                                                <Outlet
                                                    context={{
                                                        isRoomDetailsOpen,
                                                        setIsRoomDetailsOpen
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <EmptyChat
                                                roomType={activeRoomType}
                                            />
                                        )}
                                    </main>
                                </ResizablePanel>

                                {isRoomDetailsOpen && (
                                    <>
                                        <ResizableHandle withHandle />

                                        {/* Room details panel */}
                                        <ResizablePanel
                                            defaultSize={25}
                                            minSize={20}
                                            maxSize={40}
                                        >
                                            <RoomDetails />
                                        </ResizablePanel>
                                    </>
                                )}
                            </ResizablePanelGroup>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
