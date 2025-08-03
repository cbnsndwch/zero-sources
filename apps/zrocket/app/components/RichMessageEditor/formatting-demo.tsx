// Demo: Text Formatting Implementation
// This file demonstrates how the formatting features work

import React from 'react';

import { RichMessageEditor } from './RichMessageEditor';
import { toggleTextFormat, getFormattingShortcut } from './formatting-utils';
import type { TextFormatType } from './types';

// Example of how to use the RichMessageEditor with formatting
function FormattingDemo() {
    const handleSendMessage = content => {
        console.log('Message sent:', content);
        // Content will include format information in the SerializedEditorState
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Text Formatting Demo</h2>

            {/* The RichMessageEditor now supports all formatting features */}
            <RichMessageEditor
                onSendMessage={handleSendMessage}
                placeholder="Try formatting shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), Ctrl+Shift+S (strikethrough)"
            />

            <div className="mt-4 text-sm text-gray-600">
                <h3 className="font-semibold">Available keyboard shortcuts:</h3>
                <ul className="list-disc list-inside mt-2">
                    {(
                        [
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough'
                        ] as TextFormatType[]
                    ).map(format => (
                        <li key={format}>
                            <strong>{format}:</strong>{' '}
                            {getFormattingShortcut(format)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// Example of programmatic formatting control
function ProgrammaticFormattingExample() {
    const editorRef = React.useRef(null);

    const handleFormatToggle = (formatType: TextFormatType) => {
        if (editorRef.current) {
            toggleTextFormat(editorRef.current, formatType);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={() => handleFormatToggle('bold')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Bold
                </button>
                <button
                    onClick={() => handleFormatToggle('italic')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Italic
                </button>
                <button
                    onClick={() => handleFormatToggle('underline')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Underline
                </button>
                <button
                    onClick={() => handleFormatToggle('strikethrough')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Strikethrough
                </button>
            </div>

            {/* Editor would be connected with ref for programmatic control */}
            <p className="text-sm text-gray-600">
                Note: Programmatic formatting buttons would require additional
                editor ref setup. Keyboard shortcuts work out of the box!
            </p>
        </div>
    );
}

// Example of how formatting appears in SerializedEditorState
const exampleFormattedOutput = {
    root: {
        children: [
            {
                children: [
                    {
                        text: 'This is ',
                        format: 0, // No formatting
                        type: 'text'
                    },
                    {
                        text: 'bold',
                        format: 1, // Bold format bit
                        type: 'text'
                    },
                    {
                        text: ' and ',
                        format: 0,
                        type: 'text'
                    },
                    {
                        text: 'italic',
                        format: 2, // Italic format bit
                        type: 'text'
                    },
                    {
                        text: ' and ',
                        format: 0,
                        type: 'text'
                    },
                    {
                        text: 'bold italic',
                        format: 3, // Bold + Italic (1 + 2)
                        type: 'text'
                    },
                    {
                        text: ' text!',
                        format: 0,
                        type: 'text'
                    }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1
            }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1
    }
};

export {
    FormattingDemo,
    ProgrammaticFormattingExample,
    exampleFormattedOutput
};
