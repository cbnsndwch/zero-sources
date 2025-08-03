import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useChannel from '@/hooks/use-channel';
import useGroup from '@/hooks/use-group';
import useChat from '@/hooks/use-chat';
import useRoomMessages from '@/hooks/use-room-messages';

interface ChatMessagesProps {
    roomId: string;
    roomType: 'channel' | 'group' | 'dm';
}

export function ChatMessages({ roomId, roomType }: ChatMessagesProps) {
    // Fetch room data based on room type
    const channelQueryResult = useChannel(roomType === 'channel' ? roomId : '');
    const groupQueryResult = useGroup(roomType === 'group' ? roomId : '');
    const chatQueryResult = useChat(roomType === 'dm' ? roomId : '');

    // Get the appropriate room data from query results
    const room =
        roomType === 'channel'
            ? Array.isArray(channelQueryResult[0])
                ? channelQueryResult[0][0]
                : channelQueryResult[0]
            : roomType === 'group'
              ? Array.isArray(groupQueryResult[0])
                  ? groupQueryResult[0][0]
                  : groupQueryResult[0]
              : roomType === 'dm'
                ? Array.isArray(chatQueryResult[0])
                    ? chatQueryResult[0][0]
                    : chatQueryResult[0]
                : undefined;

    // Get messages for the room
    const messages = useRoomMessages(room);

    const formatTime = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper function to extract text content from Lexical SerializedEditorState
    const getMessageText = (contents: any): string => {
        if (!contents || !contents.root) return '';

        const extractText = (node: any): string => {
            if (node.type === 'text') {
                return node.text || '';
            }
            if (node.children) {
                return node.children.map(extractText).join('');
            }
            return '';
        };

        return contents.root.children?.map(extractText).join('\n') || '';
    };

    if (!room) {
        return (
            <ScrollArea className="h-full">
                <div className="p-4 text-center text-muted-foreground">
                    Loading messages...
                </div>
            </ScrollArea>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                    const prevMessage = index > 0 ? messages[index - 1] : null;
                    const isGrouped =
                        prevMessage &&
                        prevMessage.sender?._id === message.sender?._id &&
                        new Date(message.createdAt).getTime() -
                            new Date(prevMessage.createdAt).getTime() <
                            5 * 60 * 1000; // 5 minutes

                    const senderName =
                        message.sender?.name ||
                        message.sender?.username ||
                        'Unknown User';
                    const messageText = getMessageText(message.contents);

                    return (
                        <div
                            key={message._id}
                            className={`flex gap-3 ${isGrouped ? 'mt-1' : 'mt-4'}`}
                        >
                            {!isGrouped && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarFallback className="text-sm">
                                        {senderName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            {isGrouped && <div className="w-8 flex-shrink-0" />}

                            <div className="flex-1 min-w-0">
                                {!isGrouped && (
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-semibold text-sm text-foreground">
                                            {senderName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(message.createdAt)}
                                        </span>
                                    </div>
                                )}

                                <div
                                    className={`text-sm ${isGrouped ? 'hover:bg-muted/30 -ml-11 pl-11 py-0.5 rounded' : ''}`}
                                >
                                    {messageText}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}
