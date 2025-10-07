import { useQuery } from '@rocicorp/zero/react';

import type {
    IPrivateGroupRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';
import { groupById } from '@cbnsndwch/zrocket-contracts';

export default function useGroup(id: string | undefined) {
    // Handle undefined id by providing empty string to query
    // Context is provided by Zero framework at runtime on the server
    // Pass null as placeholder for client-side TypeScript compliance
    const query = groupById(null as any, id ?? '');
    return useQuery(query, { enabled: Boolean(id) });
}

export type GroupWithMessages = Readonly<
    IPrivateGroupRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;
