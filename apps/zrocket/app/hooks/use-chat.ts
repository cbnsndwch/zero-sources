import type { Query } from '@rocicorp/zero';
import { useQuery, type Schema } from '@rocicorp/zero/react';

import type {
    IDirectMessagesRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';

import { useZero } from '@/zero/use-zero';

export default function useChat(id: string) {
    const zero = useZero();

    const query = zero.query.chats
        .where('_id', '=', id)
        .one()
        .related('messages')
        .related('systemMessages');

    return useQuery(
        query as unknown as Query<Schema, 'chats', ChatWithMessages>,
        { enabled: zero && !!id }
    );
}

export type ChatWithMessages = Readonly<
    IDirectMessagesRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;
