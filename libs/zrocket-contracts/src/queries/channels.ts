import { syncedQuery } from '@rocicorp/zero';
import { z } from 'zod';

import { builder } from '../schema/index.js';

/**
 * Query to retrieve all public channels.
 *
 * @remarks
 * Public channels are accessible to all users, including anonymous users.
 * This query does not require authentication.
 *
 * **Client-side**: Returns all public channels ordered by name
 * **Server-side**: Returns all public channels (no permission filtering needed)
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { publicChannels } from '@cbnsndwch/zrocket-contracts/queries';
 *
 * const [channels] = useQuery(publicChannels());
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const publicChannels = syncedQuery('publicChannels', z.tuple([]), () => {
    // Public channels are accessible to everyone
    return builder.channels.orderBy('name', 'asc');
});

/**
 * Query to retrieve a specific public channel by ID.
 *
 * @param channelId - The ID of the channel to retrieve
 *
 * @remarks
 * Public channels are accessible to all users, including anonymous users.
 * This query does not require authentication.
 *
 * **Client-side**: Returns the channel with related messages if found
 * **Server-side**: Returns the channel (no permission filtering needed)
 *
 * Includes up to 100 most recent user messages and system messages ordered by creation time.
 *
 * @example
 * ```typescript
 * // In a React component:
 * import { useQuery } from '@rocicorp/zero/react';
 * import { channelById } from '@cbnsndwch/zrocket-contracts/queries';
 *
 * const [channel] = useQuery(channelById(channelId));
 * ```
 *
 * @see {@link https://rocicorp.dev/docs/zero/synced-queries Zero Synced Queries}
 */
export const channelById = syncedQuery(
    'channelById',
    z.tuple([z.string()]),
    (channelId: string) => {
        // Public channels are accessible to everyone
        return builder.channels
            .where('_id', '=', channelId)
            .related('messages', q => q.orderBy('createdAt', 'desc').limit(100))
            .related('systemMessages', q =>
                q.orderBy('createdAt', 'desc').limit(100)
            );
    }
);
