import type { IHasUsername, IEntityBase } from '../common/index.js';
import type { UserPresenceStatus } from '../users/user-status.contract.js';
import type { ILivechatAgentSummary } from './livechat-agent.contracts.js';

export interface IVisitorPhone {
    phoneNumber: string;
}

export interface IVisitorLastChat {
    _id: string;
    ts: Date;
}

export interface ILivechatVisitorConnectionData {
    httpHeaders: {
        [k: string]: string;
    };
    clientAddress: string;
}

export interface IVisitorEmail {
    address: string;
}

interface ILivechatData {
    [k: string]: unknown;
}

export interface ILivechatVisitor extends IEntityBase {
    username: string;
    ts: Date;
    token: string;
    department?: string;
    name?: string;
    phone?: IVisitorPhone[] | null;
    lastChat?: IVisitorLastChat;
    userAgent?: string;
    ip?: string;
    host?: string;
    visitorEmails?: IVisitorEmail[];
    status?: UserPresenceStatus;
    lastAgent?: ILivechatAgentSummary;

    livechatData?: ILivechatData;

    contactManager?: IHasUsername;

    activity?: string[];
    disabled?: boolean;
}

export interface ILivechatVisitorInput {
    id?: string;
    token: string;
    name?: string;
    email?: string;
    department?: string;
    phone?: string;
    username?: string;
    customFields?: ILivechatCustomFieldInput[];
    connectionData?: {
        httpHeaders: Record<string, string | string[] | undefined>;
    };
}

export type ILivechatCustomFieldInput = {
    key: string;
    value: string;
    overwrite: boolean;
};

export const isILivechatVisitor = (a: any): a is ILivechatVisitor =>
    typeof a?.token === 'string';
