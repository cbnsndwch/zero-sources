import { useCallback, useMemo, useState } from 'react';
import type { SerializedEditorState } from 'lexical';
import { toast } from 'sonner';

import { RoomType } from '@cbnsndwch/zrocket-contracts';

import { RichMessageEditor } from '@/components/RichMessageEditor';
import { useLogin } from '@/auth/use-login';
import { sendMessage } from '@/zero/api-client';
import useChannel from '@/hooks/use-channel';
import useGroup from '@/hooks/use-group';
import useChat from '@/hooks/use-chat';

interface ChatInputProps {
    roomId: string;
    roomType: RoomType;
}

export function ChatInput({ roomId, roomType }: ChatInputProps) {
    const { loginState } = useLogin();
    const [isSending, setIsSending] = useState(false);

    const room = useRoomData(roomId, roomType);

    const handleRichSend = useCallback(
        async (content: SerializedEditorState) => {
            console.log('[ChatInput] handleRichSend called with:', content);
            console.log('[ChatInput] loginState:', loginState);
            console.log('[ChatInput] roomId:', roomId);

            // Extract text content from the serialized state
            let textContent = '';
            if (content.root && content.root.children) {
                content.root.children.forEach((child: any) => {
                    if (child.children) {
                        child.children.forEach((textNode: any) => {
                            if (textNode.text) {
                                textContent += textNode.text;
                            }
                        });
                    }
                });
            }

            console.log('[ChatInput] Extracted text:', textContent);

            if (!textContent.trim()) {
                console.warn('[ChatInput] Empty message, skipping send');
                return;
            }

            if (!loginState) {
                console.error(
                    '[ChatInput] Cannot send message: User not logged in'
                );
                console.error('[ChatInput] loginState is:', loginState);
                toast.error('You must be logged in to send messages');
                return;
            }

            // Check if user is a member of this room (client-side validation)
            if (!room) {
                console.error('[ChatInput] Room not found:', roomId);
                toast.error('Room not found');
                return;
            }

            // Check if room has memberIds property (type guard)
            if (!('memberIds' in room) || !Array.isArray(room.memberIds)) {
                console.error('[ChatInput] Room does not have memberIds');
                toast.error('Invalid room data');
                return;
            }

            if (!room.memberIds.includes(loginState.decoded.sub)) {
                console.error('[ChatInput] User is not a member of this room');
                toast.error('You must be a room member to send messages');
                return;
            }

            try {
                setIsSending(true);
                console.log('[ChatInput] Sending message via REST API...');

                // Send message using REST API instead of Zero custom mutator
                // MongoDB CDC will pick up the change and Zero will update queries automatically
                await sendMessage({
                    roomId,
                    content: textContent.trim(),
                    userId: loginState.decoded.sub,
                    username: loginState.decoded.name
                });

                console.log('[ChatInput] Message sent successfully');
            } catch (error) {
                console.error('[ChatInput] Failed to send message:', error);

                // Show error toast to user
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : 'Failed to send message. Please try again.';
                toast.error(errorMessage);
            } finally {
                setIsSending(false);
            }
        },
        [room, roomId, loginState]
    );

    return (
        <div className="px-4 pt-4 pb-1 bg-background">
            <RichMessageEditor
                onSendMessage={handleRichSend}
                placeholder="Type a message..."
                maxLength={1000}
                disabled={isSending}
            />
        </div>
    );
}

function useRoomData(roomId: string, roomType: RoomType) {
    // Fetch room data based on room type using hooks
    const channelResult = useChannel(
        roomType === RoomType.PublicChannel ? roomId : undefined
    );
    const groupResult = useGroup(
        roomType === RoomType.PrivateGroup ? roomId : undefined
    );
    const chatResult = useChat(
        roomType === RoomType.DirectMessages ? roomId : undefined
    );

    // Get the appropriate room data (first result from the array)
    const room = useMemo(
        () =>
            roomType === RoomType.PublicChannel
                ? channelResult[0]
                : roomType === RoomType.PrivateGroup
                  ? groupResult[0]
                  : chatResult[0],
        [channelResult, chatResult, groupResult, roomType]
    );

    return room;
}
