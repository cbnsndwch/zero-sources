import type { CustomMutatorDefs } from '@rocicorp/zero/server';
import type { RoomType } from '@cbnsndwch/zrocket-contracts';

import type { MessageService } from '../services/message.service.js';
import type { RoomService } from '../services/room.service.js';
import type { MongoTransaction } from './mongo-transaction.js';

/**
 * Server-side mutator implementations for Zero custom mutators.
 * These use NestJS services and run within MongoDB transactions.
 */
export function createServerMutators(
    messageService: MessageService,
    roomService: RoomService
): CustomMutatorDefs<MongoTransaction> {
    return {
        message: {
            /**
             * Send a new message to a room
             */
            send: async (
                tx: MongoTransaction,
                args: {
                    roomId: string;
                    content: string;
                    userId: string;
                    username: string;
                }
            ) => {
                // Delegate to message service with transaction session
                await messageService.sendMessage(
                    {
                        roomId: args.roomId,
                        content: args.content,
                        userId: args.userId,
                        username: args.username
                    },
                    tx.session
                );
            }
        },

        room: {
            /**
             * Create a new room
             */
            create: async (
                tx: MongoTransaction,
                args: {
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
                // Delegate to room service with transaction session
                await roomService.createRoom(
                    {
                        type: args.type as RoomType,
                        memberIds: args.memberIds,
                        usernames: args.usernames,
                        name: args.name,
                        topic: args.topic,
                        description: args.description,
                        readOnly: args.readOnly
                    },
                    args.createdBy,
                    tx.session
                );
            },

            /**
             * Invite users to a room
             */
            invite: async (
                tx: MongoTransaction,
                args: {
                    roomId: string;
                    userIds: string[];
                    usernames: string[];
                }
            ) => {
                // Delegate to room service with transaction session
                await roomService.inviteToRoom(
                    {
                        roomId: args.roomId,
                        userIds: args.userIds,
                        usernames: args.usernames
                    },
                    tx.session
                );
            }
        }
    } as const;
}

export type ServerMutators = ReturnType<typeof createServerMutators>;
