import { useQuery } from '@rocicorp/zero/react';

import {
    type IPublicChannelRoom,
    type ISystemMessage,
    type IUserMessage,
    channelById
} from '@cbnsndwch/zrocket-contracts';

export type ChannelWithMessages = Readonly<
    IPublicChannelRoom & {
        messages: IUserMessage[];
        systemMessages: ISystemMessage[];
    }
>;

export default function useChannel(id: string | undefined) {
    // Handle undefined id by providing a query that returns empty results
    // This maintains backward compatibility while using synced queries
    const query = id ? channelById(id) : undefined;
    return useQuery(query as any);
}
