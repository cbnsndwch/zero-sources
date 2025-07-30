import type { SystemMessageType } from './message-type.enum.js';
import type { IUserMessage } from './user-message.contract.js';

export * from './attachments/index.js';

export * from './message-type.enum.js';
export * from './message-base.contract.js';
export * from './message-reaction.contract.js';

export * from './user-message.contract.js';

export * from './system-message.contract.js';
export * from './thread-message.contract.js';

export type IMessage = IUserMessage | SystemMessageType;
