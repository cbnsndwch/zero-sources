import {
    string,
    boolean,
    enumeration,
    relationships,
    table,
    json
} from '@rocicorp/zero';

import type { Dict } from '@cbnsndwch/zero-contracts';

import { entityBaseColumns } from '../../common/tables/common.schema.js';
import { ExternalUserId } from '../user.contract.js';
import { UserPresenceStatus } from '../user-presence-status.contract.js';

export const usersTable = table('users')
    .columns({
        ...entityBaseColumns,

        name: string(),
        username: string(),

        //#region Public Profile

        /**
         * The user's preferred email address.
         */
        email: string(),

        /**
         * The user's additional email addresses.
         */
        additionalEmails: json<string[]>().optional(),

        /**
         * Whether the user's profile is currently active (enabled) in the system.
         */
        active: boolean(),

        /**
         * A short text bio or description of the user.
         */
        bio: string().optional(),

        /**
         * The URL of the user's avatar image.
         */
        avatarUrl: string().optional(),

        /**
         * If the user signed up using an external provider, this field contains
         * the user's id on that provider.
         *
         * The format is `<providerId>/<userId>`, e.g. `google/1234567890` where
         * `google` is the provider id and `1234567890` is the user's Google Id.
         */
        externalId: string<ExternalUserId>().optional(),

        //#endregion Public Profile

        //#region User Presence Status

        /**
         * Default presence status of the user.
         */
        defaultPresence: enumeration<UserPresenceStatus>().optional(),

        /**
         * Current presence status of the user.
         */
        presence: enumeration<UserPresenceStatus>().optional(),

        /**
         * Text that describes the user's current presence status.
         */
        presenceText: string().optional(),

        //#endregion User Presence Status

        //#region User Settings & Preferences

        /**
         * The default room that the user has set for quick access.
         */
        defaultRoom: string().optional(),

        /**
         * Additional user profile information stored as a dictionary.
         */
        profile: json<Dict>().optional(),

        /**
         * User preferences stored as a dictionary.
         */
        preferences: json<Dict>().optional()

        //#endregion User Settings & Preferences
    })
    .primaryKey('_id');

export const userRelationships = relationships(usersTable, () => ({
    // rooms: many(
    //     {
    //         sourceField: ['id'],
    //         destSchema: roomMember,
    //         destField: ['userId']
    //     },
    //     {
    //         sourceField: ['roomId'],
    //         destSchema: room,
    //         destField: ['id']
    //     }
    // )
}));
