import { Users, Settings, Bell, Star, Archive, Pin, Hash, Lock, User } from "lucide-react";
import { useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock data for room members
const mockMembers = [
  { id: "1", name: "Alice Johnson", status: "online", avatar: "AJ" },
  { id: "2", name: "Bob Smith", status: "away", avatar: "BS" },
  { id: "3", name: "Carol Wilson", status: "online", avatar: "CW" },
  { id: "4", name: "David Brown", status: "offline", avatar: "DB" },
  { id: "5", name: "Emily Davis", status: "online", avatar: "ED" },
  { id: "6", name: "Frank Miller", status: "away", avatar: "FM" },
  { id: "7", name: "Grace Kim", status: "online", avatar: "GK" },
  { id: "8", name: "Henry Lopez", status: "offline", avatar: "HL" },
];

export function RoomDetails() {
  const params = useParams();
  const roomId = params.chatId || params.groupId || params.channelId;
  const roomType = params.chatId ? 'dm' : params.groupId ? 'group' : 'channel';

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
    if (!roomId) return "No room selected";
    return roomId.charAt(0).toUpperCase() + roomId.slice(1);
  };

  const Icon = getRoomIcon();

  return (
    <div className="h-full bg-background border-l border-border">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Room Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">{getRoomTitle()}</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-1" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-1" />
                Star
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>

          <Separator />

          {/* Room Description */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">About</h3>
            <p className="text-sm text-muted-foreground">
              {roomType === 'channel' && `Welcome to #${roomId}! This is where the team collaborates.`}
              {roomType === 'group' && `Private group for ${getRoomTitle()} discussions.`}
              {roomType === 'dm' && `Direct messages with ${getRoomTitle()}.`}
            </p>
          </div>

          <Separator />

          {/* Pinned Messages */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned Messages
            </h3>
            <div className="text-sm text-muted-foreground">
              No pinned messages
            </div>
          </div>

          {roomType !== 'dm' && (
            <>
              <Separator />

              {/* Members */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members ({mockMembers.length})
                </h3>
                
                <div className="space-y-2">
                  {mockMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                            member.status === 'online' 
                              ? 'bg-green-500' 
                              : member.status === 'away' 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Archive className="h-4 w-4 mr-2" />
              Archive {roomType}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
