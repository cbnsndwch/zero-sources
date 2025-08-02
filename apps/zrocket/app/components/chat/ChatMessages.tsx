import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatMessagesProps {
  roomId: string;
  roomType: 'channel' | 'group' | 'dm';
}

// Mock messages - this will be replaced with zero data
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    senderId: "alice",
    senderName: "Alice Johnson",
    content: "Hey everyone! How's the project coming along?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isOwn: false,
  },
  {
    id: "2",
    senderId: "bob",
    senderName: "Bob Smith",
    content: "Going well! Just finished the authentication module. The new design looks great!",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isOwn: false,
  },
  {
    id: "3",
    senderId: "you",
    senderName: "You",
    content: "Awesome work Bob! The sidebar navigation is also ready for review.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isOwn: true,
  },
];

export function ChatMessages({ roomId: _roomId, roomType: _roomType }: ChatMessagesProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {mockMessages.map((message, index) => {
          const prevMessage = index > 0 ? mockMessages[index - 1] : null;
          const isGrouped = prevMessage && 
            prevMessage.senderId === message.senderId && 
            (message.timestamp.getTime() - prevMessage.timestamp.getTime()) < 5 * 60 * 1000; // 5 minutes

          return (
            <div key={message.id} className={`flex gap-3 ${isGrouped ? 'mt-1' : 'mt-4'}`}>
              {!isGrouped && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-sm">
                    {message.senderName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              {isGrouped && <div className="w-8 flex-shrink-0" />}
              
              <div className="flex-1 min-w-0">
                {!isGrouped && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={`font-semibold text-sm ${
                      message.isOwn ? 'text-primary' : 'text-foreground'
                    }`}>
                      {message.senderName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`text-sm ${isGrouped ? 'hover:bg-muted/30 -ml-11 pl-11 py-0.5 rounded' : ''}`}>
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
