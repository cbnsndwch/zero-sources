/* eslint-disable jsx-a11y/accessible-emoji */
import { useState } from 'react';
import type { SerializedEditorState } from 'lexical';

import { Copy, Clipboard, FileText, Globe, Code } from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { RichMessageEditor } from './RichMessageEditor';

interface PasteEvent {
    id: string;
    timestamp: Date;
    type: 'html' | 'text' | 'external';
    content: {
        html?: string;
        text?: string;
        nodes?: any[];
    };
    source: string;
}

export function CopyPasteDemo() {
    const [messages, setMessages] = useState<SerializedEditorState[]>([]);
    const [pasteEvents, setPasteEvents] = useState<PasteEvent[]>([]);

    const handleSendMessage = (content: SerializedEditorState) => {
        setMessages(prev => [...prev, content]);
    };

    const handlePaste = (content: {
        html?: string;
        text?: string;
        nodes?: any[];
    }) => {
        const event: PasteEvent = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            type: content.html ? 'html' : 'text',
            content,
            source: content.html ? 'Rich Text Source' : 'Plain Text Source'
        };

        setPasteEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
    };

    const clearMessages = () => setMessages([]);
    const clearPasteEvents = () => setPasteEvents([]);

    const sampleContent = [
        {
            title: 'Rich HTML Content',
            content:
                '<p><strong>Bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p><p>Multiple paragraphs with <a href="https://example.com">links</a>.</p>',
            description: 'Copy and paste this HTML content'
        },
        {
            title: 'Plain Text',
            content:
                'This is plain text without any formatting.\nIt has multiple lines\nand should be pasted as-is.',
            description: 'Copy and paste this plain text'
        },
        {
            title: 'Mixed Content',
            content:
                '<p>This contains <strong>bold</strong> and <em>italic</em> text.</p><ul><li>List item 1</li><li>List item 2</li></ul><p>With a <a href="https://example.com">link</a>.</p>',
            description: 'Copy from external sources like Word or Google Docs'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">
                    📋 Copy/Paste Support Demo
                </h1>
                <p className="text-muted-foreground">
                    Test rich text copy/paste functionality with external
                    sources and formatting preservation
                </p>
            </div>

            {/* Sample Content to Copy */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Copy className="h-5 w-5" />
                        Sample Content to Copy
                    </CardTitle>
                    <CardDescription>
                        Copy these samples and paste them into the editor below
                        to test different scenarios
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sampleContent.map((sample, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">
                                    {sample.title}
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (sample.content.includes('<')) {
                                            // Copy as HTML
                                            const blob = new Blob(
                                                [sample.content],
                                                { type: 'text/html' }
                                            );
                                            const textBlob = new Blob(
                                                [
                                                    sample.content.replace(
                                                        /<[^>]*>/g,
                                                        ''
                                                    )
                                                ],
                                                { type: 'text/plain' }
                                            );
                                            const clipboardItem =
                                                new ClipboardItem({
                                                    'text/html': blob,
                                                    'text/plain': textBlob
                                                });
                                            navigator.clipboard.write([
                                                clipboardItem
                                            ]);
                                        } else {
                                            // Copy as plain text
                                            navigator.clipboard.writeText(
                                                sample.content
                                            );
                                        }
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                                {sample.description}
                            </p>
                            <div className="bg-muted/50 p-3 rounded text-sm font-mono">
                                {sample.content.includes('<') ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: sample.content
                                        }}
                                    />
                                ) : (
                                    <pre className="whitespace-pre-wrap">
                                        {sample.content}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Main Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Rich Text Editor with Copy/Paste Support
                    </CardTitle>
                    <CardDescription>
                        Paste content here. Use Ctrl+V for rich paste,
                        Ctrl+Shift+V for plain text paste
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RichMessageEditor
                        onSendMessage={handleSendMessage}
                        placeholder="Paste your content here and press Enter to send..."
                        maxLength={2000}
                        onPaste={handlePaste}
                    />

                    <div className="mt-4 text-sm text-muted-foreground">
                        <p>
                            <strong>Keyboard shortcuts:</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                                    Ctrl+V
                                </kbd>{' '}
                                - Paste with formatting preserved
                            </li>
                            <li>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                                    Ctrl+Shift+V
                                </kbd>{' '}
                                - Paste as plain text
                            </li>
                            <li>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                                    Enter
                                </kbd>{' '}
                                - Send message
                            </li>
                            <li>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                                    Shift+Enter
                                </kbd>{' '}
                                - New line
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Paste Events Log */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Clipboard className="h-5 w-5" />
                                Paste Events ({pasteEvents.length})
                            </CardTitle>
                            <CardDescription>
                                Real-time log of paste operations
                            </CardDescription>
                        </div>
                        {pasteEvents.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearPasteEvents}
                            >
                                Clear
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {pasteEvents.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No paste events yet. Copy and paste content
                                    to see events here.
                                </p>
                            ) : (
                                pasteEvents.map(event => (
                                    <div
                                        key={event.id}
                                        className="border rounded-lg p-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant={
                                                    event.type === 'html'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {event.type === 'html' ? (
                                                    <>
                                                        <Code className="h-3 w-3 mr-1" />{' '}
                                                        Rich Text
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="h-3 w-3 mr-1" />{' '}
                                                        Plain Text
                                                    </>
                                                )}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {event.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>

                                        <div className="text-sm">
                                            <p className="font-medium">
                                                {event.source}
                                            </p>
                                            {event.content.html && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        HTML:
                                                    </p>
                                                    <code className="text-xs bg-muted px-1 rounded">
                                                        {event.content.html.substring(
                                                            0,
                                                            100
                                                        )}
                                                        {event.content.html
                                                            .length > 100
                                                            ? '...'
                                                            : ''}
                                                    </code>
                                                </div>
                                            )}
                                            {event.content.text && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Text:
                                                    </p>
                                                    <code className="text-xs bg-muted px-1 rounded">
                                                        {event.content.text.substring(
                                                            0,
                                                            100
                                                        )}
                                                        {event.content.text
                                                            .length > 100
                                                            ? '...'
                                                            : ''}
                                                    </code>
                                                </div>
                                            )}
                                            {event.content.nodes && (
                                                <div className="mt-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        Lexical Nodes:{' '}
                                                        {
                                                            event.content.nodes
                                                                .length
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sent Messages */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Sent Messages ({messages.length})
                            </CardTitle>
                            <CardDescription>
                                Messages created from pasted content
                            </CardDescription>
                        </div>
                        {messages.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearMessages}
                            >
                                Clear
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {messages.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    No messages sent yet. Paste content and
                                    press Enter to send.
                                </p>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-3"
                                    >
                                        <div className="text-sm">
                                            <p className="font-medium mb-2">
                                                Message{' '}
                                                {messages.length - index}
                                            </p>
                                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                {JSON.stringify(
                                                    message,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Summary */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200">
                        ✅ Copy/Paste Features Implemented
                    </CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-300">
                        Enhanced paste support with formatting preservation and
                        content sanitization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-2">
                                Rich Text Support ✅
                            </h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• HTML-to-Lexical conversion</li>
                                <li>• Formatting preservation</li>
                                <li>• External source support</li>
                                <li>• Content sanitization</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">
                                Keyboard Shortcuts ✅
                            </h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• Ctrl+V rich paste</li>
                                <li>• Ctrl+Shift+V plain paste</li>
                                <li>• Automatic format detection</li>
                                <li>• Error handling</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">
                                Security & Performance ✅
                            </h4>
                            <ul className="space-y-1 text-muted-foreground">
                                <li>• HTML sanitization</li>
                                <li>• Length limits</li>
                                <li>• Error boundaries</li>
                                <li>• Performance optimization</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
