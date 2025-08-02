import { Hash, Lock, User } from "lucide-react";
import { NavLink } from "react-router";

import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data - this will be replaced with zero data
const directMessages = [
  { id: "alice", name: "Alice Johnson", url: "/d/alice", online: true },
  { id: "bob", name: "Bob Smith", url: "/d/bob", online: false },
  { id: "carol", name: "Carol Wilson", url: "/d/carol", online: true },
  { id: "david", name: "David Brown", url: "/d/david", online: true },
  { id: "emily", name: "Emily Davis", url: "/d/emily", online: false },
  { id: "frank", name: "Frank Miller", url: "/d/frank", online: true },
  { id: "grace", name: "Grace Kim", url: "/d/grace", online: false },
  { id: "henry", name: "Henry Lopez", url: "/d/henry", online: true },
  { id: "isabella", name: "Isabella Chen", url: "/d/isabella", online: true },
  { id: "jack", name: "Jack Thompson", url: "/d/jack", online: false },
];

const privateGroups = [
  { id: "design-team", name: "Design Team", url: "/p/design-team", members: 8 },
  { id: "leadership", name: "Leadership", url: "/p/leadership", members: 3 },
  { id: "project-alpha", name: "Project Alpha", url: "/p/project-alpha", members: 5 },
  { id: "frontend-guild", name: "Frontend Guild", url: "/p/frontend-guild", members: 12 },
  { id: "marketing-team", name: "Marketing Team", url: "/p/marketing-team", members: 6 },
  { id: "backend-squad", name: "Backend Squad", url: "/p/backend-squad", members: 9 },
  { id: "qa-circle", name: "QA Circle", url: "/p/qa-circle", members: 4 },
  { id: "product-planning", name: "Product Planning", url: "/p/product-planning", members: 7 },
];

const publicChannels = [
  { id: "announcements", name: "announcements", url: "/c/announcements", members: 156 },
  { id: "backend", name: "backend", url: "/c/backend", members: 43 },
  { id: "design", name: "design", url: "/c/design", members: 78 },
  { id: "development", name: "development", url: "/c/development", members: 67 },
  { id: "frontend", name: "frontend", url: "/c/frontend", members: 89 },
  { id: "general", name: "general", url: "/c/general", members: 142 },
  { id: "help", name: "help", url: "/c/help", members: 54 },
  { id: "marketing", name: "marketing", url: "/c/marketing", members: 32 },
  { id: "product", name: "product", url: "/c/product", members: 45 },
  { id: "random", name: "random", url: "/c/random", members: 98 },
  { id: "testing", name: "testing", url: "/c/testing", members: 29 },
  { id: "ux-research", name: "ux-research", url: "/c/ux-research", members: 18 },
];

interface RoomListProps {
  roomType: string;
  searchQuery: string;
}

type Room = {
  id: string;
  name: string;
  url: string;
  online?: boolean;
  members?: number;
};

function groupByFirstLetter(items: Room[]): Record<string, Room[]> {
  return items.reduce((groups, item) => {
    const firstLetter = item.name.charAt(0).toLowerCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(item);
    return groups;
  }, {} as Record<string, Room[]>);
}

export function RoomList({ roomType, searchQuery }: RoomListProps) {
  const getRoomsForType = (): Room[] => {
    switch (roomType) {
      case "dms":
        return directMessages.filter(dm =>
          dm.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "groups":
        return privateGroups.filter(group =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "channels":
        return publicChannels.filter(channel =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case "threads":
      case "starred":
      case "archived":
        // These room types don't have data yet, return empty array
        return [];
      default:
        return [];
    }
  };

  const getRoomIcon = () => {
    switch (roomType) {
      case "dms":
        return User;
      case "groups":
        return Lock;
      case "channels":
        return Hash;
      default:
        return Hash;
    }
  };

  const rooms = getRoomsForType();
  const groupedRooms = groupByFirstLetter(rooms);
  const sortedGroups = Object.keys(groupedRooms).sort();
  const Icon = getRoomIcon();

  if (rooms.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="mb-2">No {roomType} found</div>
        {searchQuery && (
          <div className="text-sm">Try a different search term</div>
        )}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {sortedGroups.map(letter => (
          <div key={letter} className="mb-4">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {letter}
            </div>
            <div className="space-y-1">
              {groupedRooms[letter].map(room => (
                <NavLink
                  key={room.id}
                  to={room.url}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-muted ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate flex-1">{room.name}</span>
                  {roomType === "dms" && room.online !== undefined && (
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        room.online ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  )}
                  {roomType !== "dms" && room.members && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {room.members}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
