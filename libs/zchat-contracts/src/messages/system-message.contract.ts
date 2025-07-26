import type { Dict } from '@cbnsndwch/zero-contracts';

import type { IMessageBase } from './message-base.contract.js';
import {
    SYSTEM_MESSAGE_TYPES,
    type SystemMessageType
} from './message-type.contract.js';

/**
 * A message that is a control message or an event in the channel
 */
export interface ISystemMessage extends IMessageBase {
    /**
     * The type of system message
     */
    t: SystemMessageType;

    /**
     * (Optional) Data associated with the system message. Schema depends on
     * the type of system message and is not yet strictly enforced. This may
     * change later one
     */
    data?: Dict;
}

export function isSystemMessage(
    message: IMessageBase
): message is ISystemMessage {
    if (!message || typeof message !== 'object') {
        return false;
    }

    const maybeMessageType = (message as Dict).t;
    return (
        maybeMessageType !== undefined &&
        SYSTEM_MESSAGE_TYPES.includes(maybeMessageType)
    );
}
