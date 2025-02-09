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

export type Schema = typeof schema;

export const schema = createSchema(
    1, // Schema version
    {
        tables: [user, room, message],
        relationships: [userRelationships, roomRelationships, messageRelationships]
    }
);

//#region Permissions

type AuthData = {
    sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
    const allowIfLoggedIn = (authData: AuthData, { cmpLit }: ExpressionBuilder<Schema, 'user'>) =>
        cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: AuthData,
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
