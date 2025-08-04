import type { ReactElement } from 'react';
import {
    DecoratorNode,
    type SerializedLexicalNode,
    type NodeKey
} from 'lexical';

export interface MentionPayload {
    mentionID: string;
    username: string;
    name?: string;
}

export type SerializedMentionNode = SerializedLexicalNode & {
    mentionID: string;
    username: string;
    name?: string;
};

export class MentionNode extends DecoratorNode<ReactElement> {
    __mentionID: string;
    __username: string;
    __name?: string;

    static getType(): string {
        return 'mention';
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(
            {
                mentionID: node.__mentionID,
                username: node.__username,
                name: node.__name
            },
            node.__key
        );
    }

    static importJSON(serializedNode: SerializedMentionNode): MentionNode {
        const { mentionID, username, name } = serializedNode;
        return $createMentionNode({
            mentionID,
            username,
            name
        });
    }

    exportJSON(): SerializedMentionNode {
        return {
            mentionID: this.__mentionID,
            username: this.__username,
            name: this.__name,
            type: 'mention',
            version: 1
        };
    }

    constructor(payload: MentionPayload, key?: NodeKey) {
        super(key);
        this.__mentionID = payload.mentionID;
        this.__username = payload.username;
        this.__name = payload.name;
    }

    createDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'mention';
        span.setAttribute('data-mention-id', this.__mentionID);
        span.setAttribute('data-username', this.__username);
        if (this.__name) {
            span.setAttribute('data-name', this.__name);
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getMentionID(): string {
        return this.__mentionID;
    }

    getUsername(): string {
        return this.__username;
    }

    getName(): string | undefined {
        return this.__name;
    }

    getTextContent(): string {
        return `@${this.__username}`;
    }

    isInline(): true {
        return true;
    }

    canInsertTextBefore(): false {
        return false;
    }

    canInsertTextAfter(): false {
        return false;
    }

    canBeEmpty(): false {
        return false;
    }

    isIsolated(): true {
        return true;
    }

    decorate(): ReactElement {
        return (
            <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
                data-mention-id={this.__mentionID}
                data-username={this.__username}
                data-name={this.__name}
                contentEditable={false}
                suppressContentEditableWarning
            >
                @{this.__username}
            </span>
        );
    }
}

export function $createMentionNode(payload: MentionPayload): MentionNode {
    return new MentionNode(payload);
}

export function $isMentionNode(node: any): node is MentionNode {
    return node instanceof MentionNode;
}
