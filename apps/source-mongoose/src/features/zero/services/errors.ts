import type { ChangeStreamInvalidateDocument } from 'mongodb';

export class StreamInvalidatedError extends Error {
    name: 'StreamInvalidatedError' = 'StreamInvalidatedError';

    constructor(doc: ChangeStreamInvalidateDocument) {
        super(`Change stream invalidated at resume token: ${doc._id}`);
    }
}
