import {
    definePermissions,
    type ExpressionBuilder
    // type Condition
} from '@rocicorp/zero';

import { schema, type Schema, type TableName } from './schema.js';

type Condition = any;

/**
 * The contents of the zbugs JWT
 */
export type TokenClaims = {
    /**
     * The logged in user ID
     */
    sub: string;

    /**
     * The user's global (cross-tenant) roles
     */
    roles: string[];
};

export type PermissionRule<TTable extends TableName> = (
    claims: TokenClaims,
    eb: ExpressionBuilder<Schema, TTable>
) => Condition;

//#region Helpers

// function and<TTable extends TableName>(
//     ...rules: PermissionRule<TTable>[]
// ): PermissionRule<TTable> {
//     return (claims, eb) => eb.and(...rules.map(rule => rule(claims, eb)));
// }

function userIsLoggedIn(
    claims: TokenClaims,
    b: ExpressionBuilder<Schema, TableName>
) {
    return b.cmpLit(claims.sub, 'IS NOT', null);
}

// function loggedInUserIsCreator(
//     claims: TokenClaims,
//     b: ExpressionBuilder<Schema, 'party'>
// ) {
//     return b.and(userIsLoggedIn(claims, b), b.cmp('createdBy', '=', claims.sub));
// }

function loggedInUserIsAdmin(
    claims: TokenClaims,
    b: ExpressionBuilder<Schema, TableName>
) {
    return b.and(
        userIsLoggedIn(claims, b),
        b.cmpLit('superAdmin', 'IN', claims.roles)
    );
}

// function allowIfUserIdMatchesLoggedInUser(
//     claims: TokenClaims,
//     b: ExpressionBuilder<Schema, 'party'>
// ) {
//     return b.cmp('trainerId', '=', claims.sub);
// }

// function allowIfAdminOrIssueCreator(
//     claims: TokenClaims,
//     b: ExpressionBuilder<Schema, 'issueLabel'>
// ) {
//     return b.or(
//         loggedInUserIsAdmin(claims, b),
//         b.exists('issue', iq => iq.where(eb => loggedInUserIsCreator(claims, eb)))
//     );
// }

//#endregion Helpers

export const permissions: any = definePermissions<TokenClaims, Schema>(
    schema,
    () => ({
        pokemon: {
            // Only the authentication system can write to the user table.
            row: {
                insert: [loggedInUserIsAdmin],
                update: {
                    preMutation: [loggedInUserIsAdmin]
                },
                delete: [loggedInUserIsAdmin]
            }
        }
    })
);
