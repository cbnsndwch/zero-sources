import type { SerializedEditorState } from 'lexical';

import type { IHasName } from '../common/index.js';
import type { IUserSummary } from '../users/user.contract.js';

import type { MessageAttachment } from './attachments/index.js';
import type { IMessageReaction } from './message-reaction.contract.js';
import type { IMessageBase } from './message-base.contract.js';

export interface IUserMessage extends IMessageBase {
    /**
     * The user who sent the message
     */
    sender: Required<IUserSummary> & Partial<IHasName>;

    /**
     * The message contents, in Lexical JSON format
     */
    contents: SerializedEditorState;

    /**
     * Whether the message can be grouped with other messages from the same user
     */
    groupable?: boolean;

    /**
     * List of user ids that have replied to this message
     */
    repliedBy?: string[];

    /**
     * List of user ids that have reacted to this message
     */
    starredBy?: string[];

    /**
     * Whether the message is pinned in the room
     */
    pinned?: boolean;

    /**
     * If the messages is pinned, the date and time it was pinned
     */
    pinnedAt?: Date;

    /**
     * If the messages is pinned, the user who pinned it
     */
    pinnedBy?: IUserSummary;

    /**
     * Whether the message is has not been viewed by the users in the room
     */
    unread?: boolean;

    /**
     * Attachments of the message, if any
     */
    attachments?: MessageAttachment[];

    /**
     * A map of reaction emojis to the list of user ids that have reacted with that emoji
     */
    reactions?: Record<string, IMessageReaction>;
}
