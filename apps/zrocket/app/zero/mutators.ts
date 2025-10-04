import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero';
import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

/**
 * Client-side mutator definitions for Zero custom mutators.
 * These are mirrored from server-side but only server implementation runs.
 */
export function createMutators() {
    return {
        message: {
            /**
             * Send a new message to a room.
             * Server-side implementation validates and creates the message.
             */
            send: async (
                _tx: Transaction<Schema>,
                _args: {
                    roomId: string;
                    content: string;
                    userId: string;
                    username: string;
                }
            ) => {
                // No client-side logic - server handles everything
                // The mutation will be sent to the push endpoint
            }
        },

        room: {
            /**
             * Create a new room.
             * Server-side implementation validates and creates the room.
             */
            create: async (
                _tx: Transaction<Schema>,
                _args: {
                    type: RoomType;
                    memberIds: string[];
                    usernames: string[];
                    name?: string;
                    topic?: string;
                    description?: string;
                    readOnly?: boolean;
                    createdBy: string;
                }
            ) => {
                // No client-side logic - server handles everything
            },

            /**
             * Invite users to an existing room.
             * Server-side implementation validates and adds members.
             */
            invite: async (
                _tx: Transaction<Schema>,
                _args: {
                    roomId: string;
                    userIds: string[];
                    usernames: string[];
                }
            ) => {
                // No client-side logic - server handles everything
            }
        }
    } as const satisfies CustomMutatorDefs;
}

export type Mutators = ReturnType<typeof createMutators>;
