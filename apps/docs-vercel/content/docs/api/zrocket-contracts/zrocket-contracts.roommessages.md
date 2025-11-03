---
title: 'roomMessages variable'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [roomMessages](./zrocket-contracts.roommessages.md)

## roomMessages variable

Query to retrieve user messages for a specific room.

**Signature:**

```typescript
roomMessages: _rocicorp_zero.SyncedQuery<
    'roomMessages',
    JwtPayload,
    true,
    [string, RoomType, number],
    _rocicorp_zero.Query<
        {
            tables: {
                readonly chats: {
                    name: 'chats';
                    columns: {
                        readonly t: {
                            type: 'string';
                            optional: false;
                            customType: RoomType.DirectMessages;
                        };
                        readonly systemMessageTypes: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: SystemMessageType[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly memberIds: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly usernames: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly messageCount: {
                            type: 'number';
                            optional: false;
                            customType: number;
                        };
                        readonly lastMessage: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: Readonly<IMessageBase>;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly lastMessageAt: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
                readonly groups: {
                    name: 'groups';
                    columns: {
                        readonly t: {
                            type: 'string';
                            optional: false;
                            customType: RoomType.PrivateGroup;
                        };
                        readonly name: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly topic: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly description: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly readOnly: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly archived: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly systemMessageTypes: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: SystemMessageType[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly memberIds: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly usernames: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly messageCount: {
                            type: 'number';
                            optional: false;
                            customType: number;
                        };
                        readonly lastMessage: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: Readonly<IMessageBase>;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly lastMessageAt: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
                readonly channels: {
                    name: 'channels';
                    columns: {
                        readonly t: {
                            type: 'string';
                            optional: false;
                            customType: RoomType.PublicChannel;
                        };
                        readonly default: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly featured: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly name: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly topic: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly description: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly readOnly: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly archived: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly systemMessageTypes: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: SystemMessageType[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly memberIds: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly usernames: {
                            type: 'json';
                            optional: false;
                            customType: string[];
                        };
                        readonly messageCount: {
                            type: 'number';
                            optional: false;
                            customType: number;
                        };
                        readonly lastMessage: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: Readonly<IMessageBase>;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly lastMessageAt: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
                readonly userMessages: {
                    name: 'userMessages';
                    columns: {
                        readonly sender: {
                            type: 'json';
                            optional: false;
                            customType: Required<IUserSummary> &
                                Partial<IHasName>;
                        };
                        readonly contents: {
                            type: 'json';
                            optional: false;
                            customType: lexical.SerializedEditorState<lexical.SerializedLexicalNode>;
                        };
                        readonly groupable: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly repliedBy: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: string[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly starredBy: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: string[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly pinned: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly pinnedAt: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly pinnedBy: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: IUserSummary;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly attachments: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: readonly MessageAttachment[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly reactions: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: Readonly<
                                    Record<string, IMessageReaction>
                                >;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly roomId: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly hidden: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
                readonly systemMessages: {
                    name: 'systemMessages';
                    columns: {
                        readonly t: {
                            type: 'string';
                            optional: false;
                            customType: SystemMessageType;
                        };
                        readonly data: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: _cbnsndwch_zero_contracts.Dict;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly roomId: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly hidden: Omit<
                            {
                                type: 'boolean';
                                optional: false;
                                customType: boolean;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
                readonly users: {
                    name: 'users';
                    columns: {
                        readonly name: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly username: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly email: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly additionalEmails: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: string[];
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly active: {
                            type: 'boolean';
                            optional: false;
                            customType: boolean;
                        };
                        readonly bio: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly avatarUrl: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly externalId: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: `${string}/${string}`;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly defaultPresence: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: UserPresenceStatus;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly presence: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: UserPresenceStatus;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly presenceText: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly defaultRoom: Omit<
                            {
                                type: 'string';
                                optional: false;
                                customType: string;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly profile: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: _cbnsndwch_zero_contracts.Dict;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly preferences: Omit<
                            {
                                type: 'json';
                                optional: false;
                                customType: _cbnsndwch_zero_contracts.Dict;
                            },
                            'optional'
                        > & {
                            optional: true;
                        };
                        readonly _id: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly createdAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                        readonly updatedAt: {
                            type: 'string';
                            optional: false;
                            customType: string;
                        };
                    };
                    primaryKey: readonly [string, ...string[]];
                } & {
                    primaryKey: ['_id'];
                };
            };
            relationships: {
                readonly chats: {
                    messages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 'roomId'
                                | 'hidden'
                                | 'sender'
                                | 'contents'
                                | 'groupable'
                                | 'repliedBy'
                                | 'starredBy'
                                | 'pinned'
                                | 'pinnedAt'
                                | 'pinnedBy'
                                | 'attachments'
                                | 'reactions'
                            )[];
                            readonly destSchema: 'userMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                    systemMessages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 't'
                                | 'roomId'
                                | 'hidden'
                                | 'data'
                            )[];
                            readonly destSchema: 'systemMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                };
                readonly groups: {
                    messages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 'roomId'
                                | 'hidden'
                                | 'sender'
                                | 'contents'
                                | 'groupable'
                                | 'repliedBy'
                                | 'starredBy'
                                | 'pinned'
                                | 'pinnedAt'
                                | 'pinnedBy'
                                | 'attachments'
                                | 'reactions'
                            )[];
                            readonly destSchema: 'userMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                    systemMessages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 't'
                                | 'roomId'
                                | 'hidden'
                                | 'data'
                            )[];
                            readonly destSchema: 'systemMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                };
                readonly channels: {
                    messages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 'roomId'
                                | 'hidden'
                                | 'sender'
                                | 'contents'
                                | 'groupable'
                                | 'repliedBy'
                                | 'starredBy'
                                | 'pinned'
                                | 'pinnedAt'
                                | 'pinnedBy'
                                | 'attachments'
                                | 'reactions'
                            )[];
                            readonly destSchema: 'userMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                    systemMessages: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 't'
                                | 'roomId'
                                | 'hidden'
                                | 'data'
                            )[];
                            readonly destSchema: 'systemMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                };
                readonly userMessages: {
                    replies: [
                        {
                            readonly sourceField: string[];
                            readonly destField: (
                                | '_id'
                                | 'createdAt'
                                | 'updatedAt'
                                | 'roomId'
                                | 'hidden'
                                | 'sender'
                                | 'contents'
                                | 'groupable'
                                | 'repliedBy'
                                | 'starredBy'
                                | 'pinned'
                                | 'pinnedAt'
                                | 'pinnedBy'
                                | 'attachments'
                                | 'reactions'
                            )[];
                            readonly destSchema: 'userMessages';
                            readonly cardinality: 'many';
                        }
                    ];
                };
                readonly users: {};
            };
            enableLegacyQueries: boolean | undefined;
            enableLegacyMutators: boolean | undefined;
        },
        'userMessages',
        {
            readonly sender: Required<IUserSummary> & Partial<IHasName>;
            readonly contents: lexical.SerializedEditorState<lexical.SerializedLexicalNode>;
            readonly groupable: boolean | null;
            readonly repliedBy: string[] | null;
            readonly starredBy: string[] | null;
            readonly pinned: boolean | null;
            readonly pinnedAt: string | null;
            readonly pinnedBy: IUserSummary | null;
            readonly attachments: readonly MessageAttachment[] | null;
            readonly reactions: Readonly<
                Record<string, IMessageReaction>
            > | null;
            readonly roomId: string;
            readonly hidden: boolean | null;
            readonly _id: string;
            readonly createdAt: string;
            readonly updatedAt: string;
        }
    >
>;
```

## Remarks

\*\*Client-side\*\*: Returns messages ordered by creation time (newest first) \*\*Server-side\*\*: Filters messages based on room access permissions: - Public channels: accessible to all authenticated users - Private groups/chats: accessible only to room members

Anonymous users receive empty results for all room types on the server.

## Example

```typescript
// In a React component - get messages for a public channel:
import { useQuery } from '@rocicorp/zero/react';
import {
    roomMessages,
    RoomType
} from '@cbnsndwch/zrocket-contracts/queries/messages';

const [messages] = useQuery(roomMessages(channelId, RoomType.PublicChannel));

// Get messages with a custom limit:
const [recentMessages] = useQuery(
    roomMessages(roomId, RoomType.DirectMessages, 50)
);
```
