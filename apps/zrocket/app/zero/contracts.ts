import type { PullRow, Zero as ZeroConstructor } from '@rocicorp/zero';

import type { Schema } from '@cbnsndwch/zchat-contracts';

import type { Mutators } from './mutators';

export type Zero = ZeroConstructor<Schema, Mutators>;

export type IChannel = PullRow<'channels', Schema>;
export type IChat = PullRow<'chats', Schema>;
export type IGroup = PullRow<'groups', Schema>;

export type IRoom = IChannel | IChat | IGroup;

export type ITextMessage = PullRow<'textMessages', Schema> & { type: 'text' };
export type IImageMessage = PullRow<'imageMessages', Schema> & {
    type: 'image';
};
export type ISystemMessage = PullRow<'systemMessages', Schema>;

export type IMessage = ITextMessage | IImageMessage | ISystemMessage;
