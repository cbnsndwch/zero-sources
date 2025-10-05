import {
    ANYONE_CAN,
    definePermissions,
    ExpressionBuilder,
    NOBODY_CAN
} from '@rocicorp/zero';

import type { JwtPayload } from '../auth/index.js';

import { schema, type Schema } from './schema.js';

/**
 * Zero Permissions for Zrocket
 *
 * IMPORTANT LIMITATIONS:
 *
 * Zero does not currently support checking membership in JSON array columns (e.g., memberIds).
 * This means we cannot implement row-level permissions that check if a user's ID exists in a
 * room's memberIds array.
 *
 * CURRENT IMPLEMENTATION:
 *
 * - Public channels (channels): Anyone can read (including non-logged-in users) ✅
 * - Direct messages (chats): Only logged-in users can read ⚠️
 *   TODO: Should be restricted to members only (requires relationship table or Zero feature)
 * - Private groups (groups): Only logged-in users can read ⚠️
 *   TODO: Should be restricted to members only (requires relationship table or Zero feature)
 * - Messages: Anyone can read ⚠️
 *   TODO: Should respect room permissions (requires room membership checks)
 *
 * RECOMMENDED SOLUTIONS:
 *
 * 1. Create a proper many-to-many relationship table (e.g., room_members) instead of using
 *    JSON arrays. This would allow using Zero's `exists` function to check membership.
 *
 * 2. Implement client-side filtering for now, acknowledging that this is not secure and
 *    any data synced to the client is technically accessible.
 *
 * 3. Wait for Zero to support JSON array membership operators (e.g., Postgres @> operator).
 */
export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const isLoggedIn = (
        claims: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, any>
    ) => cmpLit(claims.sub, 'IS NOT', null);

    const isMessageSender = (
        claims: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'userMessages'>
    ) => cmpLit('sender.id', '=', claims.sub ?? '');

    const isRoomMember = (
        claims: JwtPayload,
        eb: ExpressionBuilder<Schema, 'channels' | 'groups' | 'chats'>
    ) =>
        eb.and(
            isLoggedIn(claims, eb),
            eb.cmpLit(claims.sub, 'IN', 'memberIds')
        );

    return {
        // Public channels - Anyone can see (including non-logged-in users) ✅
        channels: {
            row: {
                select: NOBODY_CAN,
                // select: ANYONE_CAN,
                insert: [isLoggedIn],
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },

        // Direct messages - Only logged-in users can see
        // ⚠️ WARNING: This is not secure! Any logged-in user can see all DMs.
        // Should be restricted to room members, but Zero doesn't support JSON array membership checks.
        chats: {
            row: {
                select: [isRoomMember],
                insert: [isRoomMember],
                update: { preMutation: [isMessageSender] },
                delete: [isMessageSender]
            }
        },

        // Private groups - Only logged-in users can see
        // ⚠️ WARNING: This is not secure! Any logged-in user can see all private groups.
        // Should be restricted to room members, but Zero doesn't support JSON array membership checks.
        groups: {
            row: {
                select: [isRoomMember],
                insert: [isRoomMember],
                update: { preMutation: [isMessageSender] },
                delete: [isMessageSender]
            }
        },

        // Message tables (discriminated union from 'messages' collection)
        userMessages: {
            row: {
                // ⚠️ WARNING: Anyone can see all messages!
                // Ideally, messages should only be visible if the user has access to the room,
                // but we can't implement this without JSON array membership checks or proper relationships.
                // Client-side filtering is required for now.
                select: ANYONE_CAN,

                // Logged in users can create messages
                insert: [isLoggedIn],

                // Only sender can update their own messages
                update: { preMutation: [isMessageSender] },

                // Logged in users can delete messages
                // TODO: Should probably be restricted to sender only
                delete: [isMessageSender]
            }
        },
        systemMessages: {
            row: {
                // System messages follow same access rules as user messages
                // ⚠️ WARNING: Anyone can see all system messages!
                select: ANYONE_CAN,
                insert: NOBODY_CAN, // TODO: figure out permissions for system message
                update: { preMutation: NOBODY_CAN }, // System messages are immutable
                delete: NOBODY_CAN // System messages can't be deleted
            }
        },

        // Users table - read-only for now
        users: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        }
    };
});
