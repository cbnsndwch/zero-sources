import { Send, Plus, Smile, Paperclip } from 'lucide-react';
import type { SerializedEditorState } from 'lexical';

import { Button } from '@/components/ui/button';
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
        <div className="p-4 border-t border-border bg-background">
            <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>

                <div className="flex-1 relative">
                    <RichMessageEditor
                        onSendMessage={handleRichSend}
                        placeholder="Type a message..."
                        maxLength={1000}
                    />
                </div>

                {/* Action buttons for attachment and emoji */}
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                    </Button>
                </div>

                <Button size="icon" className="flex-shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
