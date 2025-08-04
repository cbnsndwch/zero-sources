/* eslint-disable jsx-a11y/accessible-emoji */
import { useState } from 'react';
import type { SerializedEditorState } from 'lexical';

import { RichMessageEditor } from '../RichMessageEditor';

/**
 * Simple visual test component to verify FormattingToolbar integration
 * This can be used in the development environment to manually test the toolbar
 */
export function ToolbarVisualTest() {
    const [messages, setMessages] = useState<SerializedEditorState[]>([]);

    const handleSendMessage = (content: SerializedEditorState) => {
        console.log('Message sent with formatting:', content);
        setMessages(prev => [...prev, content]);
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">
                    Text Formatting Toolbar - Visual Test
                </h1>
                <p className="text-muted-foreground">
                    Test the toolbar buttons and keyboard shortcuts
                </p>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">
                        Formatting Toolbar Test
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Try clicking the toolbar buttons or use keyboard
                        shortcuts:
                    </p>
                    <ul className="text-sm text-muted-foreground mb-4 space-y-1">
                        <li>
                            • <strong>Bold:</strong> Click B button or Ctrl+B
                        </li>
                        <li>
                            • <strong>Italic:</strong> Click I button or Ctrl+I
                        </li>
                        <li>
                            • <strong>Underline:</strong> Click U button or
                            Ctrl+U
                        </li>
                        <li>
                            • <strong>Strikethrough:</strong> Click S button or
                            Ctrl+Shift+S
                        </li>
                    </ul>

                    <RichMessageEditor
                        onSendMessage={handleSendMessage}
                        placeholder="Type here and test the formatting toolbar above..."
                    />
                </div>

                {messages.length > 0 && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-semibold mb-2">
                            Sent Messages ({messages.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className="p-2 bg-background rounded text-xs"
                                >
                                    <details>
                                        <summary className="cursor-pointer font-medium">
                                            Message {index + 1} - Click to see
                                            SerializedEditorState
                                        </summary>
                                        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                                            {JSON.stringify(message, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
                <p>
                    ✅ If you can see formatting toolbar buttons (B, I, U, S)
                    above the editor, the implementation is working correctly!
                </p>
            </div>
        </div>
    );
}
