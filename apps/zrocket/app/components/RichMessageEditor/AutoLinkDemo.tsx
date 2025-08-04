import { useState } from 'react';
import { RichMessageEditor } from './RichMessageEditor';
import type { SerializedEditorState } from 'lexical';

/**
 * AutoLinkDemo component for manually testing URL detection
 */
export function AutoLinkDemo() {
    const [sentMessages, setSentMessages] = useState<SerializedEditorState[]>([]);

    const handleSendMessage = (content: SerializedEditorState) => {
        setSentMessages(prev => [...prev, content]);
    };

    const testUrls = [
        'https://example.com',
        'http://example.com',
        'www.example.com',
        'example.com',
        'test@example.com',
        'Check out https://github.com/rocicorp/zero',
        'Visit www.google.com for search',
        'Contact support@myapp.com for help',
        'Multi-link: Visit example.com and email test@example.com',
        'Valid but not converted: not-a-url and just text'
    ];

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-4">AutoLink Plugin Demo</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Type or paste URLs in the editor below. They should automatically 
                    become clickable links with proper styling and security attributes.
                </p>
                
                <RichMessageEditor 
                    onSendMessage={handleSendMessage}
                    placeholder="Type a message with URLs to test auto-linking..."
                />
            </div>

            <div className="space-y-2">
                <h3 className="font-medium">Test URLs to try:</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                    {testUrls.map((url, index) => (
                        <button
                            key={index}
                            className="text-left p-2 bg-muted rounded hover:bg-muted/80 transition-colors"
                            onClick={() => {
                                // Copy to clipboard for easy testing
                                navigator.clipboard.writeText(url);
                            }}
                            title="Click to copy to clipboard"
                        >
                            {url}
                        </button>
                    ))}
                </div>
            </div>

            {sentMessages.length > 0 && (
                <div className="space-y-2">
                    <h3 className="font-medium">Sent Messages:</h3>
                    <div className="space-y-2">
                        {sentMessages.map((message, index) => (
                            <div key={index} className="p-3 bg-muted rounded">
                                <pre className="text-xs overflow-auto">
                                    {JSON.stringify(message, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Expected Behavior:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                    <li>URLs with https:// should be auto-linked</li>
                    <li>URLs with http:// should be auto-linked</li>
                    <li>URLs starting with www. should be auto-linked with https:// prefix</li>
                    <li>Domain-only URLs (e.g., example.com) should be auto-linked with https:// prefix</li>
                    <li>Email addresses should be auto-linked with mailto: prefix</li>
                    <li>Links should have blue color and underline on hover</li>
                    <li>Links should open in new tab with security attributes (rel="noopener noreferrer")</li>
                    <li>Invalid URLs should not be converted to links</li>
                </ul>
            </div>
        </div>
    );
}