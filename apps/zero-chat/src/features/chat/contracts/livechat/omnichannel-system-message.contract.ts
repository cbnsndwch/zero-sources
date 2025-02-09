import type { ILivechatVisitor } from './livechat-visitor.contract.js';
import type { IUser } from '../users/user.contract.js';
import { IMessageBase } from '../messages/message.contracts.js';



export interface IOmnichannelSystemMessage extends IMessageBase {
    navigation?: {
        page: {
            title: string;
            location: {
                href: string;
            };
            token?: string;
        };
    };
    transferData?: {
        comment: string;
        transferredBy: {
            name?: string;
            username: string;
        };
        transferredTo: {
            name?: string;
            username: string;
        };

        nextDepartment?: {
            _id: string;
            name?: string;
        };
        scope: 'department' | 'agent' | 'queue';
    };
    requestData?: {
        type: 'visitor' | 'user';
        visitor?: ILivechatVisitor;
        user?: Pick<IUser, '_id' | 'name' | 'username'> | null;
    };
    webRtcCallEndTs?: Date;
    comment?: string;
}
