import {
    definePermissions,
    NOBODY_CAN,
    type ExpressionBuilder,
    type Condition
} from '@cbnsndwch/zero';

import { schema, type Schema, type TableName } from './schema';

/**
 * The contents of the zbugs JWT
 */
export type TokenClaims = {
    // The logged in userID.
    sub: string;
    role: 'crew' | 'user';
};

export type PermissionRule<TTable extends TableName> = (
    claims: TokenClaims,
    eb: ExpressionBuilder<Schema, TTable>
) => Condition;

//#region Helpers

function and<TTable extends TableName>(...rules: PermissionRule<TTable>[]): PermissionRule<TTable> {
    return (claims, eb) => eb.and(...rules.map(rule => rule(claims, eb)));
}

function userIsLoggedIn(claims: TokenClaims, b: ExpressionBuilder<Schema, TableName>) {
    return b.cmpLit(claims.sub, 'IS NOT', null);
}

function loggedInUserIsCreator(
    claims: TokenClaims,
    b: ExpressionBuilder<Schema, 'comment' | 'emoji' | 'issue'>
) {
    return b.and(userIsLoggedIn(claims, b), b.cmp('creatorID', '=', claims.sub));
}

function loggedInUserIsAdmin(claims: TokenClaims, b: ExpressionBuilder<Schema, TableName>) {
    return b.and(userIsLoggedIn(claims, b), b.cmpLit(claims.role, '=', 'crew'));
}

function allowIfUserIDMatchesLoggedInUser(
    claims: TokenClaims,
    b: ExpressionBuilder<Schema, 'viewState' | 'userPref'>
) {
    return b.cmp('userID', '=', claims.sub);
}

// function allowIfAdminOrIssueCreator(
//     claims: TokenClaims,
//     b: ExpressionBuilder<Schema, 'issueLabel'>
// ) {
//     return b.or(
//         loggedInUserIsAdmin(claims, b),
//         b.exists('issue', iq => iq.where(eb => loggedInUserIsCreator(claims, eb)))
//     );
// }

function canSeeIssue(claims: TokenClaims, b: ExpressionBuilder<Schema, 'issue'>) {
    return b.or(loggedInUserIsAdmin(claims, b), b.cmp('visibility', 'public'));
}

/**
 * Comments are only visible if the user can see the issue they're attached to.
 */
function canSeeComment(claims: TokenClaims, b: ExpressionBuilder<Schema, 'comment'>) {
    return b.exists('issue', q => q.where(eb => canSeeIssue(claims, eb)));
}

// /**
//  * Issue labels are only visible if the user can see the issue they're attached to.
//  */
// function canSeeIssueLabel(claims: TokenClaims, b: ExpressionBuilder<Schema, 'issueLabel'>) {
//     return b.exists('issue', q => q.where(eb => canSeeIssue(claims, eb)));
// }

/**
 * Emoji are only visible if the user can see the issue they're attached to.
 */
function canSeeEmoji(claims: TokenClaims, b: ExpressionBuilder<Schema, 'emoji'>) {
    return b.or(
        b.exists('issue', q => q.where(eb => canSeeIssue(claims, eb))),
        b.exists('comment', q => q.where(eb => canSeeComment(claims, eb)))
    );
}

//#endregion Helpers

export const permissions = definePermissions<TokenClaims, Schema>(schema, () => ({
    user: {
        // Only the authentication system can write to the user table.
        row: {
            insert: NOBODY_CAN,
            update: {
                preMutation: NOBODY_CAN
            },
            delete: NOBODY_CAN
        }
    },
    issue: {
        row: {
            insert: [
                // prevents setting the creatorID of an issue to someone
                // other than the user doing the creating
                loggedInUserIsCreator
            ],
            update: {
                preMutation: [loggedInUserIsCreator, loggedInUserIsAdmin],
                postMutation: [loggedInUserIsCreator, loggedInUserIsAdmin]
            },
            delete: [loggedInUserIsCreator, loggedInUserIsAdmin],
            select: [canSeeIssue]
        }
    },
    comment: {
        row: {
            insert: [loggedInUserIsAdmin, and(loggedInUserIsCreator, canSeeComment)],
            update: {
                preMutation: [loggedInUserIsAdmin, and(loggedInUserIsCreator, canSeeComment)]
            },
            delete: [loggedInUserIsAdmin, and(canSeeComment, loggedInUserIsCreator)]
        }
    },

    viewState: {
        row: {
            insert: [allowIfUserIDMatchesLoggedInUser],
            update: {
                preMutation: [allowIfUserIDMatchesLoggedInUser],
                postMutation: [allowIfUserIDMatchesLoggedInUser]
            },
            delete: NOBODY_CAN
        }
    },
    // label: {
    //     row: {
    //         insert: [loggedInUserIsAdmin],
    //         update: {
    //             preMutation: [loggedInUserIsAdmin]
    //         },
    //         delete: [loggedInUserIsAdmin]
    //     }
    // },
    // issueLabel: {
    //     row: {
    //         insert: [and(canSeeIssueLabel, allowIfAdminOrIssueCreator)],
    //         update: {
    //             preMutation: NOBODY_CAN
    //         },
    //         delete: [and(canSeeIssueLabel, allowIfAdminOrIssueCreator)]
    //     }
    // },
    emoji: {
        row: {
            // Can only insert emoji if the can see the issue.
            insert: [and(canSeeEmoji, loggedInUserIsCreator)],

            // Can only update their own emoji.
            update: {
                preMutation: [and(canSeeEmoji, loggedInUserIsCreator)],
                postMutation: [and(canSeeEmoji, loggedInUserIsCreator)]
            },
            delete: [and(canSeeEmoji, loggedInUserIsCreator)]
        }
    },
    userPref: {
        row: {
            insert: [allowIfUserIDMatchesLoggedInUser],
            update: {
                preMutation: [allowIfUserIDMatchesLoggedInUser],
                postMutation: [allowIfUserIDMatchesLoggedInUser]
            },
            delete: [allowIfUserIDMatchesLoggedInUser]
        }
    }
}));
