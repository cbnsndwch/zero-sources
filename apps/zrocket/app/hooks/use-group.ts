import type { Query } from '@rocicorp/zero';
import { useQuery, type QueryResult, type Schema } from '@rocicorp/zero/react';

import type {
    IPrivateGroupRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';

import { useZero } from '@/zero/use-zero';

export default function useGroup(id: string) {
    const zero = useZero();

    const query = zero.query.groups
        .where('_id', '=', id)
        .one()
        .related('messages')
        .related('systemMessages');

    return useQuery(
        query, // as unknown as Query<Schema, 'groups', GroupWithMessages>,
        { enabled: zero && !!id }
    ) as unknown as QueryResult<GroupWithMessages | undefined>;
}

export type GroupWithMessages = Readonly<
    IPrivateGroupRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;
