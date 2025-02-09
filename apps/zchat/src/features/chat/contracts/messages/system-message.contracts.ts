import { SYSTEM_MESSAGE_TYPES, type SystemMessageType } from './message-type.contracts.js';
import type { IMessage } from './message.contracts.js';

/**
 * A message that is a control message or an event in the channel
 */
export interface ISystemMessage extends IMessage {
    /**
     * The type of system message
     */
    t: SystemMessageType;
}

export function isSystemMessage(message: IMessage): message is ISystemMessage {
    const maybeMessageType = (message as any).t;
    return maybeMessageType !== undefined && SYSTEM_MESSAGE_TYPES.includes(maybeMessageType);
}
