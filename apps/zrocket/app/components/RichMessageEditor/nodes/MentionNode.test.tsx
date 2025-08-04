import { describe, it, expect, beforeEach } from 'vitest';
import { createEditor } from 'lexical';

import {
    $createMentionNode,
    $isMentionNode,
    MentionNode
} from '../nodes/MentionNode';

describe('MentionNode', () => {
    let editor: ReturnType<typeof createEditor>;

    beforeEach(() => {
        editor = createEditor({
            nodes: [MentionNode],
            onError: error => {
                throw error;
            }
        });
    });

    describe('$createMentionNode', () => {
        it('should create a mention node with correct properties', () => {
            editor.update(() => {
                const payload = {
                    mentionID: 'user123',
                    username: 'testuser',
                    name: 'Test User'
                };

                const mentionNode = $createMentionNode(payload);

                expect(mentionNode).toBeInstanceOf(MentionNode);
                expect(mentionNode.getMentionID()).toBe('user123');
                expect(mentionNode.getUsername()).toBe('testuser');
                expect(mentionNode.getName()).toBe('Test User');
            });
        });

        it('should work without optional name', () => {
            editor.update(() => {
                const payload = {
                    mentionID: 'user456',
                    username: 'anotheruser'
                };

                const mentionNode = $createMentionNode(payload);

                expect(mentionNode.getMentionID()).toBe('user456');
                expect(mentionNode.getUsername()).toBe('anotheruser');
                expect(mentionNode.getName()).toBeUndefined();
            });
        });
    });

    describe('$isMentionNode', () => {
        it('should return true for mention nodes', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser'
                });

                expect($isMentionNode(mentionNode)).toBe(true);
            });
        });

        it('should return false for non-mention nodes', () => {
            expect($isMentionNode(null)).toBe(false);
            expect($isMentionNode(undefined)).toBe(false);
            // We can't easily test with other node types without more complex setup
        });
    });

    describe('MentionNode methods', () => {
        it('should return correct text content', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser',
                    name: 'Test User'
                });

                expect(mentionNode.getTextContent()).toBe('@testuser');
            });
        });

        it('should be inline', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser'
                });

                expect(mentionNode.isInline()).toBe(true);
            });
        });

        it('should not allow text insertion before or after', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser'
                });

                expect(mentionNode.canInsertTextBefore()).toBe(false);
                expect(mentionNode.canInsertTextAfter()).toBe(false);
            });
        });

        it('should not allow empty state', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser'
                });

                expect(mentionNode.canBeEmpty()).toBe(false);
            });
        });

        it('should be isolated', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser'
                });

                expect(mentionNode.isIsolated()).toBe(true);
            });
        });

        it('should export JSON correctly', () => {
            editor.update(() => {
                const mentionNode = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser',
                    name: 'Test User'
                });

                const json = mentionNode.exportJSON();

                expect(json).toEqual({
                    mentionID: 'user123',
                    username: 'testuser',
                    name: 'Test User',
                    type: 'mention',
                    version: 1
                });
            });
        });
    });

    describe('MentionNode.clone', () => {
        it('should clone a mention node correctly', () => {
            editor.update(() => {
                const original = $createMentionNode({
                    mentionID: 'user123',
                    username: 'testuser',
                    name: 'Test User'
                });

                const cloned = MentionNode.clone(original);

                expect(cloned).toBeInstanceOf(MentionNode);
                expect(cloned.getMentionID()).toBe('user123');
                expect(cloned.getUsername()).toBe('testuser');
                expect(cloned.getName()).toBe('Test User');
                expect(cloned).not.toBe(original); // Should be different instances
            });
        });
    });

    describe('MentionNode.importJSON', () => {
        it('should import from JSON correctly', () => {
            editor.update(() => {
                const json = {
                    mentionID: 'user456',
                    username: 'imported',
                    name: 'Imported User',
                    type: 'mention' as const,
                    version: 1
                };

                const imported = MentionNode.importJSON(json);

                expect(imported).toBeInstanceOf(MentionNode);
                expect(imported.getMentionID()).toBe('user456');
                expect(imported.getUsername()).toBe('imported');
                expect(imported.getName()).toBe('Imported User');
            });
        });

        it('should import without optional name', () => {
            editor.update(() => {
                const json = {
                    mentionID: 'user789',
                    username: 'noname',
                    type: 'mention' as const,
                    version: 1
                };

                const imported = MentionNode.importJSON(json);

                expect(imported.getMentionID()).toBe('user789');
                expect(imported.getUsername()).toBe('noname');
                expect(imported.getName()).toBeUndefined();
            });
        });
    });
});
