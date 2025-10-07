import { useQuery } from '@rocicorp/zero/react';

import type {
    IPrivateGroupRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';
import { groupById } from '@cbnsndwch/zrocket-contracts';

// Type-safe mock context for client-side compliance
const mockContext = {} as Parameters<typeof groupById>[0];

export default function useGroup(id: string | undefined) {
    // Handle undefined id by providing empty string to query
    // Context is provided by Zero framework at runtime on the server
    // Use a type-safe mock context for client-side TypeScript compliance
    const query = groupById(mockContext, id ?? '');
    return useQuery(query, { enabled: Boolean(id) });
}

export type GroupWithMessages = Readonly<
    IPrivateGroupRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;
