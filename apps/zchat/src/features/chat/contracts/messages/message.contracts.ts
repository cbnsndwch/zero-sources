import type { MessageSurfaceLayout } from '@rocket.chat/ui-kit';
import type { SerializedEditorState } from 'lexical';

import type { IHasId, IHasName, IEntityBase } from '../../../../common/contracts/index.js';

import type { IUserSummary } from '../../../users/contracts/user.contract.js';

import type { MessageAttachment } from './attachments/index.js';
import type { IMessageReaction } from './message-reaction.contracts.js';

export type MentionType = 'user' | 'room' | 'role' | 'all' | 'here';

export type IMessageMention = IHasId & {
    type: MentionType;

    name?: string;

    username?: string;

    roomName?: string;
};

export interface IMessage extends IEntityBase {
    /**
     * The room id this message belongs to
     */
    roomId: string;

    /**
     * The date and time the message was sent
     */
    ts: Date;

    /**
     * The message contents, in Lexical JSON format
     */
    contents: SerializedEditorState;

    /**
     * The message contents, in markdown format
     */
    md?: string;

    /**
     * The message contents, in HTML format
     */
    html?: string;

    /**
     * Whether the message can be grouped with other messages from the same user
     */
    groupable?: boolean;

    /**
     * The user who sent the message
     */
    sender: Required<IUserSummary> & Partial<IHasName>;

    /**
     * The UI Kit blocks of the message, if any
     */
    blocks?: MessageSurfaceLayout;

    /**
     * Whether to hide the message from the UI
     */
    hidden?: boolean;

    /**
     * List of users, channels, or other entities mentioned in the message
     */
    mentions?: IMessageMention[];

    /**
     * List of user ids that have replied to this message
     */
    repliedBy?: string[];

    /**
     * List of user ids that have reacted to this message
     */
    starred?: IHasId[];

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

    /**
     * The date and time the message was edited, if it was edited
     */
    editedAt?: Date;

    /**
     * The user who edited the message, if it was edited
     */
    editedBy?: IUserSummary;
}

export interface IEditedMessage extends IMessage {
    /**
     * The date and time the message was edited, if it was edited
     */
    editedAt: Date;

    /**
     * The user who edited the message, if it was edited
     */
    editedBy: IUserSummary;
}

/**
 * Type predicate to determine if a message is an edited message.
 *
 * @param message - The message to check.
 * @returns `true` if the message is an edited message, `false` otherwise.
 */
export function isEditedMessage<T extends IMessage>(
    message: T & any
): message is T & IEditedMessage {
    const maybeEditedMessage = message as IEditedMessage;

    return (
        maybeEditedMessage.editedAt instanceof Date &&
        typeof maybeEditedMessage.editedBy === 'object' &&
        typeof maybeEditedMessage.editedBy?._id === 'string'
    );
}
