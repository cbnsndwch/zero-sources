import {
    createSchema,
    definePermissions,
    NOBODY_CAN,
    ANYONE_CAN,
    type ExpressionBuilder
} from '@rocicorp/zero';

import {
    message,
    messageRelationships,
    room,
    roomRelationships,
    user,
    userRelationships
} from './features/chat/schema/index.js';
import type { JwtPayload } from './features/auth/jwt/index.js';

export type Schema = typeof schema;

export const schema = createSchema(
    1, // Schema version
    {
        tables: [user, room, message],
        relationships: [userRelationships, roomRelationships, messageRelationships]
    }
);

//#region Permissions

export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const allowIfLoggedIn = (authData: JwtPayload, { cmpLit }: ExpressionBuilder<Schema, 'user'>) =>
        cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'message'>
        // ) => cmp('sender', '=', authData.sub ?? '');
    ) => cmpLit('sender.id', '=', authData.sub ?? '');

    return {
        room: {
            row: {
                insert: NOBODY_CAN,
                update: {
                    preMutation: NOBODY_CAN
                },
                delete: NOBODY_CAN
            }
        },
        user: {
            row: {
                insert: NOBODY_CAN,
                update: {
                    preMutation: NOBODY_CAN
                },
                delete: NOBODY_CAN
            }
        },
        message: {
            row: {
                // anyone can insert
                insert: ANYONE_CAN,
                // only sender can edit their own messages
                update: {
                    preMutation: [allowIfMessageSender]
                },
                // must be logged in to delete
                delete: [allowIfLoggedIn]
            }
        }
    };
});
