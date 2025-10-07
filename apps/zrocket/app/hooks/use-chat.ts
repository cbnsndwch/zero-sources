import { useQuery } from '@rocicorp/zero/react';

import type {
    IDirectMessagesRoom,
    ISystemMessage,
    IUserMessage
} from '@cbnsndwch/zrocket-contracts';
import { chatById } from '@cbnsndwch/zrocket-contracts';

export default function useChat(id: string | undefined) {
    // Handle undefined id by providing empty string to query
    // Context is provided by Zero framework at runtime on the server
    // Pass null as placeholder for client-side TypeScript compliance
    const query = chatById(null as any, id ?? '');
    return useQuery(query, { enabled: Boolean(id) });
}

export type ChatWithMessages = Readonly<
    IDirectMessagesRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;
