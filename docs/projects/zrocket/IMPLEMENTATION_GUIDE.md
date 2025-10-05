# Implementation Guide: Proper Room Membership Permissions

This guide shows how to implement proper room membership checking using a junction table.

## Step 1: Create the RoomMember Schema

Create a new file: `libs/zrocket-contracts/src/rooms/tables/room-member.schema.ts`

```typescript
import { table as defineTable, string } from '@rocicorp/zero';

import type { RowOf, TableMapping } from '@cbnsndwch/zero-contracts';

export const table = defineTable('roomMembers')
    .columns({
        _id: string(),
        roomId: string(),
        userId: string(),
        joinedAt: string(),
        role: string().optional()
    })
    .primaryKey('_id');

const mapping: TableMapping<IRoomMember> = {
    source: 'room_members',
    projection: {
        _id: 1,
        roomId: 1,
        userId: 1,
        joinedAt: 1,
        role: 1
    }
};

export type IRoomMember = RowOf<typeof table>;

export default {
    table,
    mapping
};
```

## Step 2: Update the Main Schema

Update `libs/zrocket-contracts/src/schema/schema.ts`:

```typescript
import { createSchema, relationships } from '@rocicorp/zero';

import chats from '../rooms/tables/direct-message-room.schema.js';
import groups from '../rooms/tables/private-group.schema.js';
import channels from '../rooms/tables/public-channel.schema.js';
import roomMembers from '../rooms/tables/room-member.schema.js'; // NEW

import userMessages from '../messages/tables/user-messages.schema.js';
import systemMessages from '../messages/tables/system-message.schema.js';

import users from '../users/tables/user.schema.js';

//#region Relationships

// ... existing relationships ...

// NEW: Room Member relationships
const roomMemberRelationships = relationships(roomMembers.table, ({ one }) => ({
    user: one({
        sourceField: ['userId'],
        destSchema: users.table,
        destField: ['_id']
    })
}));

//#endregion Relationships

export const schema = createSchema({
    tables: [
        chats.table,
        channels.table,
        groups.table,
        roomMembers.table,  // NEW
        userMessages.table,
        systemMessages.table,
        users.table
    ],
    relationships: [
        chatRelationships,
        channelRelationships,
        groupRelationships,
        roomMemberRelationships,  // NEW
        userMessageRelationships,
        userRelationships
    ]
});

export type Schema = typeof schema;

export type TableName = keyof typeof schema.tables;

export const mapping = {
    chats: chats.mapping,
    channels: channels.mapping,
    groups: groups.mapping,
    roomMembers: roomMembers.mapping,  // NEW
    userMessages: userMessages.mapping,
    systemMessages: systemMessages.mapping
} as const;
```

## Step 3: Update Permissions

Update `libs/zrocket-contracts/src/schema/permissions.ts`:

```typescript
import {
    definePermissions,
    ExpressionBuilder,
    ANYONE_CAN,
    NOBODY_CAN
} from '@rocicorp/zero';

import type { JwtPayload } from '../auth/index.js';

import { schema, type Schema } from './schema.js';

export const permissions = definePermissions<JwtPayload, Schema>(schema, () => {
    const allowIfLoggedIn = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, any>
    ) => cmpLit(authData.sub, 'IS NOT', null);

    const allowIfMessageSender = (
        authData: JwtPayload,
        { cmpLit }: ExpressionBuilder<Schema, 'userMessages'>
    ) => cmpLit('sender.id', '=', authData.sub ?? '');

    const allowIfRoomMember = (
        authData: JwtPayload,
        eb: ExpressionBuilder<Schema, 'chats' | 'groups'>
    ) => {
        // If not logged in, deny access
        if (!authData.sub) {
            return eb.cmpLit(1, '=', 0); // Always false
        }
        
        // Check if a roomMember record exists for this room and user
        return eb.exists('roomMembers', q =>
            q.where(qeb => 
                qeb.cmp('roomId', '=', '_id')
                    .and(qeb.cmpLit('userId', '=', authData.sub))
            )
        );
    };

    const allowIfMessageInAccessibleRoom = (
        authData: JwtPayload,
        eb: ExpressionBuilder<Schema, 'userMessages' | 'systemMessages'>
    ) => {
        // Allow if message is in a public channel (anyone can see)
        const inPublicChannel = eb.exists('channels', q =>
            q.where(qeb => qeb.cmp('_id', '=', 'roomId'))
        );

        // If not logged in, only allow public channel messages
        if (!authData.sub) {
            return inPublicChannel;
        }

        // Allow if message is in a room the user is a member of
        const inMemberRoom = eb.exists('roomMembers', q =>
            q.where(qeb =>
                qeb.cmp('roomId', '=', 'roomId')
                    .and(qeb.cmpLit('userId', '=', authData.sub))
            )
        );

        return inPublicChannel.or(inMemberRoom);
    };

    return {
        // Room tables
        
        // Direct messages - only visible to members
        chats: {
            row: {
                select: [allowIfRoomMember],
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        
        // Public channels - visible to anyone
        channels: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        
        // Private groups - only visible to members
        groups: {
            row: {
                select: [allowIfRoomMember],
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        
        // Room members - users can see their own memberships
        roomMembers: {
            row: {
                select: [
                    (authData, { cmpLit }) => 
                        cmpLit('userId', '=', authData.sub ?? '')
                ],
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        
        // Message tables
        userMessages: {
            row: {
                // Messages visible based on room accessibility
                select: [allowIfMessageInAccessibleRoom],
                insert: [allowIfLoggedIn],
                update: { preMutation: [allowIfMessageSender] },
                delete: [allowIfLoggedIn]
            }
        },
        systemMessages: {
            row: {
                // System messages follow same room access rules
                select: [allowIfMessageInAccessibleRoom],
                insert: ANYONE_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        },
        
        // Users table
        users: {
            row: {
                select: ANYONE_CAN,
                insert: NOBODY_CAN,
                update: { preMutation: NOBODY_CAN },
                delete: NOBODY_CAN
            }
        }
    };
});
```

## Step 4: Create MongoDB Collection and Migration

Create a new MongoDB collection and migrate existing data:

```javascript
// Migration script: scripts/migrate-room-members.js

const { MongoClient } = require('mongodb');

async function migrate() {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    
    console.log('Creating room_members collection...');
    
    try {
        await db.createCollection('room_members');
        console.log('✓ Collection created');
    } catch (err) {
        console.log('Collection already exists');
    }
    
    // Create indexes
    await db.collection('room_members').createIndex({ roomId: 1, userId: 1 }, { unique: true });
    await db.collection('room_members').createIndex({ userId: 1 });
    await db.collection('room_members').createIndex({ roomId: 1 });
    console.log('✓ Indexes created');
    
    // Migrate data from rooms.memberIds to room_members
    console.log('Migrating membership data...');
    
    const rooms = await db.collection('rooms').find({
        memberIds: { $exists: true, $ne: [] }
    }).toArray();
    
    let totalInserted = 0;
    
    for (const room of rooms) {
        const members = room.memberIds.map(userId => ({
            roomId: room._id.toString(),
            userId: userId,
            joinedAt: room.createdAt || new Date(),
            role: 'member'
        }));
        
        if (members.length > 0) {
            try {
                await db.collection('room_members').insertMany(members, { ordered: false });
                totalInserted += members.length;
                console.log(`✓ Migrated ${members.length} members for room ${room._id}`);
            } catch (err) {
                // Ignore duplicate key errors
                if (err.code !== 11000) {
                    console.error(`✗ Error migrating room ${room._id}:`, err.message);
                }
            }
        }
    }
    
    console.log(`\n✓ Migration complete! Inserted ${totalInserted} room member records.`);
    
    await client.close();
}

migrate().catch(console.error);
```

Run the migration:

```bash
node scripts/migrate-room-members.js
```

## Step 5: Update Change Source Configuration

Update `apps/source-mongodb-server/zrocket-table-mappings.json` to include the new collection:

```json
{
  "tables": [
    {
      "zeroTable": "roomMembers",
      "mongoCollection": "room_members",
      "fields": {
        "_id": { "source": "_id", "transform": "toString" },
        "roomId": { "source": "roomId" },
        "userId": { "source": "userId" },
        "joinedAt": { "source": "joinedAt", "transform": "toISOString" },
        "role": { "source": "role" }
      }
    }
  ]
}
```

## Step 6: Rebuild and Deploy

```bash
# Build the contracts library
cd libs/zrocket-contracts
pnpm build

# Export configuration
pnpm export:config

# Deploy permissions (if using manual deployment)
# npx zero-deploy-permissions --schema-path='./src/schema/index.ts'

# Restart the change source server to pick up new schema
```

## Step 7: Test

1. Log out and verify you can only see public channels
2. Log in as a user and verify you can only see rooms you're a member of
3. Try accessing messages in rooms you're not a member of
4. Create a new room and verify membership is created in room_members

## Troubleshooting

### Permission errors in console

Check the zero-cache logs for permission denial messages. They should show the exact query and auth data being used.

### Data not syncing

Verify that:
- The room_members collection exists in MongoDB
- The migration ran successfully
- The change source server restarted after schema changes
- The table mappings are correct

### Still seeing all rooms

Make sure:
- Permissions were properly deployed
- Zero client refreshed after permission changes
- Auth token contains the expected `sub` field
- The roomMembers relationship is defined correctly in schema

## Notes

- The migration script is idempotent - you can run it multiple times
- Consider keeping both `memberIds` arrays and `room_members` collection in sync during a transition period
- Add proper error handling to your production migration script
- Test thoroughly in a staging environment before deploying to production
