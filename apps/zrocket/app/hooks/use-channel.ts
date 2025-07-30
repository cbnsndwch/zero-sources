import type { Query } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import type {
    IPublicChannelRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';
import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

import { useZero } from '@/zero/use-zero';

export type ChannelWithMessages = Readonly<
    IPublicChannelRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;

export default function useChannel(id: string) {
    const zero = useZero();

    const query = zero.query.channels
        .where('_id', '=', id)
        .one()
        .related('messages')
        .related('systemMessages');

    const result = useQuery(
        query as unknown as Query<Schema, 'channels', ChannelWithMessages>,
        { enabled: zero && !!id }
    );

    return result;
}
