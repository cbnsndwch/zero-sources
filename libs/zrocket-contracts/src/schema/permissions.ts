import {
    definePermissions,
    ExpressionBuilder,
    ANYONE_CAN,
    NOBODY_CAN
} from '@rocicorp/zero';

import type { JwtPayload } from '../auth/index.js';

import { schema, type Schema } from './schema.js';

export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const allowIfLoggedIn = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, any>
    ) => cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'userMessages'>
    ) => cmpLit('sender.id', '=', authData.sub ?? '');

    return {
        // Room tables (discriminated union from 'rooms' collection) - read-only for now
        chats: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        channels: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        groups: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        // Message tables (discriminated union from 'messages' collection)
        userMessages: {
            row: {
                // TODO: restrict
                select: ANYONE_CAN,

                // Logged in users can create messages
                insert: [allowIfLoggedIn],

                // Only sender can update
                update: { preMutation: [allowIfMessageSender] },

                // Logged in users can delete
                delete: [allowIfLoggedIn]
            }
        },
        systemMessages: {
            row: {
                select: ANYONE_CAN,
                insert: ANYONE_CAN, // Allow inserting system messages
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
