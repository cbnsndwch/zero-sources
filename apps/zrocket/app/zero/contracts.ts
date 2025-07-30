import type { PullRow, Zero as ZeroConstructor } from '@rocicorp/zero';

import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

import type { Mutators } from './mutators';

export type Zero = ZeroConstructor<Schema, Mutators>;

export type IChannel = PullRow<'channels', Schema>;
export type IChat = PullRow<'chats', Schema>;
export type IGroup = PullRow<'groups', Schema>;

export type IRoom = IChannel | IChat | IGroup;
