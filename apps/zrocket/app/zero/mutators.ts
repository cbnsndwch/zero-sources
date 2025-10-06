import type { CustomMutatorDefs, Transaction } from '@rocicorp/zero';
import { z } from 'zod';

import { RoomType } from '@cbnsndwch/zrocket-contracts';
import type { Schema } from '@cbnsndwch/zrocket-contracts/schema';

/**
 * Zod schema for sending a message
 */
export const sendMessageInputSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    content: z.string().min(1, 'Message content cannot be empty'),
    userId: z.string().min(1, 'User ID is required'),
    username: z.string().min(1, 'Username is required')
});

export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;

/**
 * Zod schema for creating a room
 */
export const createRoomInputSchema = z.object({
    type: z.nativeEnum(RoomType),
    memberIds: z.array(z.string()).min(1, 'At least one member is required'),
    usernames: z.array(z.string()).min(1, 'At least one username is required'),
    name: z.string().optional(),
    topic: z.string().optional(),
    description: z.string().optional(),
    readOnly: z.boolean().optional(),
    createdBy: z.string().min(1, 'Creator ID is required')
});

export type CreateRoomInput = z.infer<typeof createRoomInputSchema>;

/**
 * Zod schema for inviting users to a room
 */
export const inviteToRoomInputSchema = z.object({
    roomId: z.string().min(1, 'Room ID is required'),
    userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
    usernames: z.array(z.string()).min(1, 'At least one username is required')
});

export type InviteToRoomInput = z.infer<typeof inviteToRoomInputSchema>;

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
