import {
    createSchema,
    definePermissions,
    NOBODY_CAN,
    ANYONE_CAN,
    type ExpressionBuilder,
    PermissionsConfig
} from '@rocicorp/zero';

import { JwtPayload } from './auth/index.js';
import { messages, messageRelationships } from './messages/index.js';
import { rooms, roomRelationships } from './rooms/index.js';
import { users, userRelationships } from './users/index.js';
// import { ROLE_SUPER_ADMIN } from './roles/index.js';

export const SCHEMA_VERSION = 1;

export type Schema = typeof schema;

export const schema = createSchema(SCHEMA_VERSION, {
    tables: [users, rooms, messages],
    relationships: [userRelationships, roomRelationships, messageRelationships]
});

export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const allowIfLoggedIn = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'users'>
    ) => cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'messages'>
        // ) => cmp('sender', '=', authData.sub ?? '');
    ) => cmpLit('sender.id', '=', authData.sub ?? '');

    // const canReadRoomIfIsAdminOrMember = (
    //     authData: JwtPayload,
    //     { cmpLit, or, cmp }: ExpressionBuilder<Schema, 'rooms'>
    // ) => {
    //     return or(
    //         cmp('userIds', 'IN'),
    //         cmpLit(authData.sub, 'IN', 'userIds'),
    //         cmpLit(ROLE_SUPER_ADMIN, 'IN', authData.roles ?? [])
    //     );
    // };

    return {
        rooms: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: {
                    preMutation: NOBODY_CAN
                },
                delete: NOBODY_CAN
            }
        },
        users: {
            row: {
                insert: NOBODY_CAN,
                update: {
                    preMutation: NOBODY_CAN
                },
                delete: NOBODY_CAN
            }
        },
        messages: {
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
    } satisfies PermissionsConfig<JwtPayload, Schema>;
});
