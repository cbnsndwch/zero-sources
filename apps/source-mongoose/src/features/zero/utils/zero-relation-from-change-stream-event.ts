import type {
    ChangeStreamInsertDocument,
    ChangeStreamUpdateDocument,
    ChangeStreamReplaceDocument,
    ChangeStreamDeleteDocument
} from 'mongodb';

// import { MessageRelation } from '@rocicorp/zero';

type MessageRelation = any;

export function relationFromChangeStreamEvent(
    doc:
        | ChangeStreamInsertDocument
        | ChangeStreamUpdateDocument
        | ChangeStreamReplaceDocument
        | ChangeStreamDeleteDocument
): MessageRelation {
    return {
        tag: 'relation',
        keyColumns: ['_id'], // mongo uses _id as the primary key unless explicitly disabled
        replicaIdentity: 'default',
        schema: doc.ns.db, // mongo doesn't have namespaces (schemas)
        name: doc.ns.coll
    };
}
