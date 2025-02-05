import {
    createSchema,
    relationships,
    table,
    string as stringCol,
    boolean as booleanCol,
    number as numberCol,
    json as jsonCol
} from '@rocicorp/zero';

const col = {
    boolean: booleanCol,
    string: stringCol,
    number: numberCol,
    json: jsonCol
};

//#region Table Definitions

const user = table('user')
    .columns({
        id: col.string(),
        login: col.string(),
        name: col.string().optional(),
        avatar: col.string(),
        role: col.string()
    })
    .primaryKey('id');

const issue = table('issue')
    .columns({
        id: col.string(),
        shortID: col.number().optional(),
        title: col.string(),
        open: col.boolean(),
        modified: col.number(),
        created: col.number(),
        creatorID: col.string(),
        assigneeID: col.string().optional(),
        description: col.string(),
        visibility: col.string(),
        labels: col.json<string[]>()
    })
    .primaryKey('id');

const viewState = table('viewState')
    .columns({
        issueID: col.string(),
        userID: col.string(),
        viewed: col.number()
    })
    .primaryKey('userID', 'issueID');

const comment = table('comment')
    .columns({
        id: col.string(),
        issueID: col.string(),
        created: col.number(),
        body: col.string(),
        creatorID: col.string()
    })
    .primaryKey('id');

// const label = table('label')
//     .columns({
//         id: col.string(),
//         name: col.string()
//     })
//     .primaryKey('id');

// const issueLabel = table('issueLabel')
//     .columns({
//         issueID: col.string(),
//         labelID: col.string()
//     })
//     .primaryKey('issueID', 'labelID');

const emoji = table('emoji')
    .columns({
        id: col.string(),
        value: col.string(),
        annotation: col.string(),
        subjectID: col.string(),
        creatorID: col.string(),
        created: col.number()
    })
    .primaryKey('id');

const userPref = table('userPref')
    .columns({
        key: col.string(),
        userID: col.string(),
        value: col.string()
    })
    .primaryKey('userID', 'key');

//#endregion Table Definitions

//#region Relationships

const userRelationships = relationships(user, ({ many }) => ({
    createdIssues: many({
        sourceField: ['id'],
        destField: ['creatorID'],
        destSchema: issue
    })
}));

const issueRelationships = relationships(issue, ({ many, one }) => ({
    // labels: many(
    //     {
    //         sourceField: ['id'],
    //         destField: ['issueID'],
    //         destSchema: issueLabel
    //     },
    //     {
    //         sourceField: ['labelID'],
    //         destField: ['id'],
    //         destSchema: label
    //     }
    // ),
    comments: many({
        sourceField: ['id'],
        destField: ['issueID'],
        destSchema: comment
    }),
    creator: one({
        sourceField: ['creatorID'],
        destField: ['id'],
        destSchema: user
    }),
    assignee: one({
        sourceField: ['assigneeID'],
        destField: ['id'],
        destSchema: user
    }),
    viewState: many({
        sourceField: ['id'],
        destField: ['issueID'],
        destSchema: viewState
    }),
    emoji: many({
        sourceField: ['id'],
        destField: ['subjectID'],
        destSchema: emoji
    })
}));

const commentRelationships = relationships(comment, ({ one, many }) => ({
    creator: one({
        sourceField: ['creatorID'],
        destField: ['id'],
        destSchema: user
    }),
    emoji: many({
        sourceField: ['id'],
        destField: ['subjectID'],
        destSchema: emoji
    }),
    issue: one({
        sourceField: ['issueID'],
        destField: ['id'],
        destSchema: issue
    })
}));

// const issueLabelRelationships = relationships(issueLabel, ({ one }) => ({
//     issue: one({
//         sourceField: ['issueID'],
//         destField: ['id'],
//         destSchema: issue
//     })
// }));

const emojiRelationships = relationships(emoji, ({ one }) => ({
    creator: one({
        sourceField: ['creatorID'],
        destField: ['id'],
        destSchema: user
    }),
    issue: one({
        sourceField: ['subjectID'],
        destField: ['id'],
        destSchema: issue
    }),
    comment: one({
        sourceField: ['subjectID'],
        destField: ['id'],
        destSchema: comment
    })
}));

//#endregion Relationships

export const schema = createSchema(5, {
    tables: [
        user,
        issue,
        comment,
        // label,
        // issueLabel,
        viewState,
        emoji,
        userPref
    ],
    relationships: [
        userRelationships,
        issueRelationships,
        commentRelationships,
        // issueLabelRelationships,
        emojiRelationships
    ]
});

export type Schema = typeof schema;

export type TableName = keyof Schema['tables'];
