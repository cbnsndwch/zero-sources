import { IMessage } from './message.contracts.js';

export type IEmailMessage = IMessage & {
    // email message fields
    email?: {
        references?: string[];
        messageId?: string;
        thread?: string[];
    };
};

export function isEmailMessage(message: IMessage): message is IEmailMessage {
    return 'email' in message;
}
