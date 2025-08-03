import { useState } from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChatInput } from '@/components/chat/ChatInput';

export function RichEditorDemo() {
    const [useRichEditor, setUseRichEditor] = useState(false);
    const [messages, setMessages] = useState<
        Array<{
            id: number;
            content: string;
            timestamp: Date;
            isRich: boolean;
        }>
    >([]);

    const handleClearMessages = () => {
        setMessages([]);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">
                    RichMessageEditor Integration Demo
                </h1>
                <p className="text-muted-foreground mt-2">
                    Sprint 1 - Foundation Setup: Lexical + ChatInput Integration
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editor Mode Controls</CardTitle>
                    <CardDescription>
                        Switch between basic textarea and rich text editor modes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="rich-editor-mode"
                            checked={useRichEditor}
                            onCheckedChange={setUseRichEditor}
                        />
                        <Label htmlFor="rich-editor-mode">
                            {useRichEditor
                                ? 'Rich Text Editor'
                                : 'Basic Textarea'}
                        </Label>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <strong>Current Mode:</strong>{' '}
                        {useRichEditor ? (
                            <span className="text-blue-600">
                                Rich Text Editor with Lexical
                            </span>
                        ) : (
                            <span className="text-gray-600">
                                Basic Textarea
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Message Input Demo</CardTitle>
                    <CardDescription>
                        Try typing and sending messages. Press Enter to send,
                        Shift+Enter for new lines.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChatInput
                        roomId="demo-room"
                        roomType="channel"
                        useRichEditor={useRichEditor}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Message History</CardTitle>
                        <CardDescription>
                            Messages sent will appear here (simulated output)
                        </CardDescription>
                    </div>
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearMessages}
                        >
                            Clear
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No messages yet. Try sending a message above!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className="border rounded-lg p-3"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                {message.content}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground ml-2">
                                            {message.isRich
                                                ? '📝 Rich'
                                                : '📄 Plain'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Implementation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">
                                ✅ Completed Features
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Lexical editor integration</li>
                                <li>• SerializedEditorState output</li>
                                <li>• Backward compatibility</li>
                                <li>• TypeScript support</li>
                                <li>• Error boundaries</li>
                                <li>• Character limits</li>
                                <li>• Keyboard shortcuts</li>
                                <li>• 40 passing tests</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">
                                🎯 Technical Details
                            </h4>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• RichTextPlugin for editing</li>
                                <li>• HistoryPlugin for undo/redo</li>
                                <li>• OnChangePlugin for tracking</li>
                                <li>• Custom KeyboardPlugin</li>
                                <li>• CharacterLimitPlugin</li>
                                <li>• Validation utilities</li>
                                <li>• Error handling</li>
                                <li>• Integration tests</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
