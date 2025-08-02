import { Hash, Lock, User, Settings, Info, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatHeaderProps {
  roomId: string;
  roomType: 'channel' | 'group' | 'dm';
  isRoomDetailsOpen: boolean;
  setIsRoomDetailsOpen: (open: boolean) => void;
}

export function ChatHeader({ roomId, roomType, isRoomDetailsOpen, setIsRoomDetailsOpen }: ChatHeaderProps) {
  const getRoomIcon = () => {
    switch (roomType) {
      case "dm":
        return User;
      case "group":
        return Lock;
      case "channel":
        return Hash;
      default:
        return Hash;
    }
  };

  const getRoomTitle = () => {
    if (roomType === 'channel') {
      return `# ${roomId}`;
    }
    if (roomType === 'group') {
      return roomId.charAt(0).toUpperCase() + roomId.slice(1).replace('-', ' ');
    }
    return roomId.charAt(0).toUpperCase() + roomId.slice(1);
  };

  const Icon = getRoomIcon();

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      <div className="flex items-center gap-3">
        {roomType === 'dm' ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm">
              {roomId.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <h1 className="font-semibold text-lg">{getRoomTitle()}</h1>
          {roomType === 'channel' && (
            <p className="text-sm text-muted-foreground">
              Welcome to #{roomId}! This is where the team collaborates.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {roomType !== 'dm' && (
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">12</span>
          </Button>
        )}
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsRoomDetailsOpen(!isRoomDetailsOpen)}
          className={isRoomDetailsOpen ? "bg-muted" : ""}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
