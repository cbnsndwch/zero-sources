import type { ChangeStreamNameSpace } from 'mongodb';

import { v0 } from '@rocicorp/zero/change-protocol/v0';

export function relationFromChangeStreamEvent(
    ns: ChangeStreamNameSpace
): v0.MessageRelation {
    return {
        keyColumns: ['_id'], // mongo uses _id as the primary key unless explicitly disabled
        schema: 'public', // mongo doesn't have schemas like pg does
        name: ns.coll
    };
}
