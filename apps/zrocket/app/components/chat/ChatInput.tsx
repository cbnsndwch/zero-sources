import { useState } from 'react';
import { Send, Plus, Smile, Paperclip } from 'lucide-react';
import type { SerializedEditorState } from 'lexical';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RichMessageEditor } from '@/components/RichMessageEditor';

interface ChatInputProps {
    roomId: string;
    roomType: 'channel' | 'group' | 'dm';
    /** Whether to use the rich text editor instead of basic textarea */
    useRichEditor?: boolean;
}

export function ChatInput({
    roomId: _roomId,
    roomType: _roomType,
    useRichEditor = false
}: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            // Here we'll integrate with zero to send the message
            console.log('Sending message:', message);
            setMessage('');
        }
    };

    const handleRichSend = (content: SerializedEditorState) => {
        // Extract text content from the serialized state for logging
        // In real implementation, you'd send the full SerializedEditorState
        let textContent = '';
        if (content.root && content.root.children) {
            content.root.children.forEach(child => {
                if (child.children) {
                    child.children.forEach(textNode => {
                        if (textNode.text) {
                            textContent += textNode.text;
                        }
                    });
                }
            });
        }
        
        if (textContent.trim()) {
            // Here we'll integrate with zero to send the rich message
            console.log('Sending rich message:', { textContent, serializedState: content });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 border-t border-border bg-background">
            <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>

                <div className="flex-1 relative">
                    {useRichEditor ? (
                        <div className="relative">
                            <RichMessageEditor
                                onSendMessage={handleRichSend}
                                placeholder="Type a message..."
                                maxLength={1000}
                            />
                            <div className="absolute right-2 bottom-2 flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                >
                                    <Paperclip className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                >
                                    <Smile className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                className="min-h-[40px] max-h-32 resize-none pr-20"
                                rows={1}
                            />

                            <div className="absolute right-2 bottom-2 flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                >
                                    <Paperclip className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                >
                                    <Smile className="h-3 w-3" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                <Button
                    onClick={handleSend}
                    disabled={useRichEditor ? false : !message.trim()}
                    size="icon"
                    className="flex-shrink-0"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
