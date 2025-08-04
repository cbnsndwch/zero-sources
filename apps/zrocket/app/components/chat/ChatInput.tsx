import type { SerializedEditorState } from 'lexical';

import { RichMessageEditor } from '@/components/RichMessageEditor';

interface ChatInputProps {
    roomId: string;
    roomType: 'channel' | 'group' | 'dm';
}

export function ChatInput({
    roomId: _roomId,
    roomType: _roomType
}: ChatInputProps) {
    const handleRichSend = (content: SerializedEditorState) => {
        // Extract text content from the serialized state for logging
        // In real implementation, you'd send the full SerializedEditorState
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

        if (textContent.trim()) {
            // Here we'll integrate with zero to send the rich message
            console.log('Sending rich message:', {
                textContent,
                serializedState: content
            });
        }
    };

    return (
        <div className="px-4 pt-4 pb-1 bg-background">
            <RichMessageEditor
                onSendMessage={handleRichSend}
                placeholder="Type a message..."
                maxLength={1000}
            />
        </div>
    );
}
