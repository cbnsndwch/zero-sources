import { useState } from 'react';
import type { SerializedEditorState } from 'lexical';

import { RichMessageEditor } from '@/components/RichMessageEditor';

export default function RichMessageEditorDemo() {
  const [messages, setMessages] = useState<SerializedEditorState[]>([]);

  const handleSendMessage = (content: SerializedEditorState) => {
    console.log('Message sent:', content);
    setMessages(prev => [...prev, content]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">RichMessageEditor Demo</h1>
          <p className="text-muted-foreground">
            A demonstration of the new RichMessageEditor component with Lexical integration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Editor */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Editor</h2>
            <div className="border rounded-lg p-4 bg-card">
              <RichMessageEditor
                onSendMessage={handleSendMessage}
                placeholder="Type your message and press Enter to send..."
              />
            </div>
          </div>

          {/* Editor with Character Limit */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">With Character Limit</h2>
            <div className="border rounded-lg p-4 bg-card">
              <RichMessageEditor
                onSendMessage={handleSendMessage}
                placeholder="Type a message (max 100 characters)..."
                maxLength={100}
              />
            </div>
          </div>

          {/* Disabled Editor */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Disabled State</h2>
            <div className="border rounded-lg p-4 bg-card">
              <RichMessageEditor
                onSendMessage={handleSendMessage}
                placeholder="This editor is disabled..."
                disabled={true}
              />
            </div>
          </div>

          {/* Message Log */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Sent Messages ({messages.length})</h2>
            <div className="border rounded-lg p-4 bg-card max-h-80 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-muted-foreground">No messages sent yet</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-sm">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(message, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-2"><span role="img" aria-label="target">🎯</span> Key Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Rich text editing with Lexical</li>
                <li>• Enter to send, Shift+Enter for new line</li>
                <li>• Undo/redo support (Ctrl+Z/Ctrl+Y)</li>
                <li>• Character counting and limits</li>
                <li>• Error boundary protection</li>
                <li>• TypeScript support</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-card">
              <h3 className="font-medium mb-2"><span role="img" aria-label="package">📦</span> Implementation</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• LexicalComposer setup</li>
                <li>• RichTextPlugin integration</li>
                <li>• OnChangePlugin for monitoring</li>
                <li>• HistoryPlugin for undo/redo</li>
                <li>• Custom keyboard handling</li>
                <li>• SerializedEditorState output</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}