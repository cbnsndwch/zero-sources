import { invariant } from '@cbnsndwch/zero-contracts';

export class OutOfOrderMutation extends Error {
    constructor(
        clientId: string,
        receivedMutationId: number,
        lastMutationId: bigint
    ) {
        super(
            `Client ${clientId} sent mutation ID ${receivedMutationId} but expected ${lastMutationId}`
        );
    }
}

export class MutationAlreadyProcessedError extends Error {
    constructor(clientId: string, received: number, actual: bigint) {
        super(
            `Ignoring mutation from ${clientId} with ID ${received} as it was already processed. Expected: ${actual}`
        );
        invariant(
            received < actual,
            'MutationAlreadyProcessedError called with an actual mutation ID that is greater than or equal than the received mutation ID'
        );
    }
}

export function splitMutatorKey(key: string) {
    return key.split('|') as [string, string];
}
