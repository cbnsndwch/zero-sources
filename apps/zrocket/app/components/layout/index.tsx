import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';

import { RoomType, isRoomType } from '@cbnsndwch/zrocket-contracts';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from '@/components/ui/resizable';
import { SidebarProvider } from '@/components/ui/sidebar';

import { zeroRef } from '@/zero/setup';

import useChannels from '@/hooks/use-channels';
import useGroups from '@/hooks/use-groups';
import useChats from '@/hooks/use-chats';

import SplashScreen from '../splash';

import EmptyChat from './EmptyChat';
import RoomDetails from './RoomDetails';
import RoomList from './RoomList';
import RoomTypeSidebar from './RoomTypeSidebar';
import SearchHeader from './SearchHeader';
import WorkspaceSidebar from './WorkspaceSidebar';

// Helper functions for localStorage
function getLastVisitedRoom(roomType: RoomType): string | null {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem(`lastVisited_${roomType}`);
}

function setLastVisitedRoom(roomType: RoomType, roomId: string) {
    if (typeof localStorage === 'undefined') {
        return;
    }

    localStorage.setItem(`lastVisited_${roomType}`, roomId);
}

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    // Use Zero queries to get room data
    const [channels] = useChannels();
    const [groups] = useGroups();
    const [chats] = useChats();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeRoomType, setActiveRoomType] = useState<RoomType>(
        RoomType.PublicChannel
    );

    const [isManualSelection, setIsManualSelection] = useState(false);
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(true);

    // Add keyboard shortcut for room details toggle
    useEffect(() => {
        const handleKeydown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + Shift + I to toggle room details
            if (
                (event.ctrlKey || event.metaKey) &&
                event.shiftKey &&
                event.key === 'I'
            ) {
                event.preventDefault();
                setIsRoomDetailsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    }, []);

    // Determine current room type from URL - but respect manual selections
    useEffect(() => {
        if (isManualSelection) {
            return;
        }

        const [typeSegment, roomId] = location.pathname.split('/') || [];
        if (typeSegment) {
            const currentType = isRoomType(typeSegment)
                ? typeSegment
                : RoomType.PublicChannel;

            if (currentType !== activeRoomType) {
                setActiveRoomType(currentType);
            }

            // Save current room as last visited for this type if applicable
            if (roomId) {
                setLastVisitedRoom(currentType, roomId);
            }
        }
    }, [location.pathname, activeRoomType, isManualSelection]);

    // Handle room type change with smart navigation
    const handleRoomTypeChange = (newRoomType: RoomType) => {
        if (newRoomType === activeRoomType) return;

        setActiveRoomType(newRoomType);
        setIsManualSelection(true);

        // Get rooms for the selected type
        let roomsForType: any[] = [];
        switch (newRoomType) {
            case RoomType.PublicChannel:
                roomsForType = channels || [];
                break;
            case RoomType.PrivateGroup:
                roomsForType = groups || [];
                break;
            case RoomType.DirectMessages:
                roomsForType = chats || [];
                break;
            default:
                roomsForType = [];
                break;
        }

        // If no rooms exist for this type, navigate to a special empty state route
        if (!roomsForType?.length) {
            navigate(`/${newRoomType}`, { replace: true });
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
                (room: any) => room._id === lastVisited
            );
            if (foundRoom) {
                targetRoom = foundRoom;
            }
        }

        // Navigate to the target room based on room type and ID
        navigate(`/${newRoomType}/${targetRoom._id}`);
    };

    const zero = useSyncExternalStore(
        zeroRef.onChange,
        useCallback(() => {
            // // for demo purposes, always return null
            // return null;

            return zeroRef.current;
        }, []),
        () => null // getServerSnapshot: return null during SSR
    );

    if (!zero) {
        return <SplashScreen shouldShow={true} />;
    }

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

                                <ResizableHandle
                                    className="bg-transparent"
                                    withHandle
                                />

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

                                {isRoomDetailsOpen ? (
                                    <>
                                        <ResizableHandle
                                            className="transition-opacity duration-300 bg-transparent"
                                            withHandle
                                        />

                                        {/* Room details panel */}
                                        <ResizablePanel
                                            defaultSize={25}
                                            minSize={20}
                                            maxSize={40}
                                            className="animate-in slide-in-from-right duration-300"
                                        >
                                            <RoomDetails />
                                        </ResizablePanel>
                                    </>
                                ) : null}
                            </ResizablePanelGroup>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}
