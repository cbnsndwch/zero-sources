import { IMessageBase } from './message.contracts.js';

export type IEmailMessage = IMessageBase & {
    // email message fields
    email?: {
        references?: string[];
        messageId?: string;
        thread?: string[];
    };
};

export function isEmailMessage(message: IMessageBase): message is IEmailMessage {
    return 'email' in message;
}
