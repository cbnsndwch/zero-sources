import { string, number, boolean, json } from '@rocicorp/zero';

import { entityBaseColumns } from '../../common/tables/common.schema.js';
import type { IMessageBase, SystemMessageType } from '../../messages/index.js';

export const roomBaseColumns = {
    ...entityBaseColumns,

    /**
     * The message types that should be treated as system messages for this room.
     */
    systemMessages: json<SystemMessageType[]>().optional(),

    //#region User Cache

    /**
     * The IDs of the users in the room.
     */
    memberIds: json<string[]>(),

    /**
     * The usernames of the users in the room
     */
    usernames: json<string[]>(),

    //#endregion User Cache

    //#region Message Cache

    /**
     * The total number of messages in the room.
     */
    messageCount: number(),

    /**
     * The last message sent in the room.
     */
    // @ts-expect-error ReadonlyJSONValue is too strict
    lastMessage: json<Readonly<IMessageBase>>().optional(),

    /**
     * The timestamp of the last message sent in the room.
     */
    lastMessageAt: string().optional()

    //#endregion Message Cache
} as const;

export const groupRoomBaseColumns = {
    ...roomBaseColumns,

    /**
     * The name of the room.
     */
    name: string(),

    /**
     * The topic of the room.
     */
    topic: string().optional(),

    /**
     * The description of the room.
     */
    description: string().optional(),

    /**
     * Indicates if the room is read-only.
     */
    readOnly: boolean().optional(),

    /**
     * Indicates if the room is archived.
     */
    archived: boolean().optional()
} as const;
