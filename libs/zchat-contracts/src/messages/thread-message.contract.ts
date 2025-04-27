import type { IMessage } from './message.contracts.js';

/**
 * A message that is the starting message for a thread
 */
export interface IThreadMainMessage extends IMessage {
    /**
     * The number of replies to the thread under this message
     */
    threadReplyCount: number;

    /**
     * The date and time of the last reply to the thread under this message
     */
    threadLastMReplyAt: Date;

    /**
     * User IDs of the users that have replied to this thread
     */
    repliedBy: string[];
}

export interface IThreadMessage extends IMessage {
    /**
     * The message ID of the message that started the thread this message belongs to
     */
    threadId: string;

    /**
     * Whether this thread message should also be displayed in the main chat at
     * the same time it was sent, in addition to being displayed in the thread
     **/
    shouldShowInRoom?: boolean;
}

/**
 * Determines if a given message is a main thread message. i.e.: a message that
 * is the starting message for a thread.
 *
 * @param message - The message to check.
 * @returns `true` if the message is a main thread message, otherwise `false`.
 */
export function isThreadMainMessage(
    message: IMessage
): message is IThreadMainMessage {
    return 'threadReplyCount' in message && 'threadLastMReplyAt' in message;
}

/**
 * Determines if a given message is a thread message.
 *
 * @param message - The message to check.
 * @returns `true` if the message is a thread message, otherwise `false`.
 */
export function isThreadMessage(message: IMessage): message is IThreadMessage {
    const maybeThreadId = (message as IThreadMessage).threadId;
    return Boolean(maybeThreadId);
}
