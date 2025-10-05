# Zrocket Permissions Limitations

## Current Situation

The zrocket schema uses JSON arrays to store room membership (`memberIds` field in rooms). While this is a valid MongoDB/Mongoose pattern, **Zero does not currently support checking membership in JSON array columns** when defining permissions.

This means we cannot implement row-level permissions that check if a user's ID exists in a room's `memberIds` array.

## Required Permissions (Ideal State)

Based on your requirements:

1. **Public channels** - Anyone can read (including non-logged-in users) ✅ **IMPLEMENTED**
2. **Direct messages** - Only members can read ❌ **CANNOT BE IMPLEMENTED**
3. **Private groups** - Only members can read ❌ **CANNOT BE IMPLEMENTED**
4. **Messages in public channels** - Anyone can read ✅ **PARTIALLY IMPLEMENTED** (all messages are visible)
5. **Messages in private rooms/DMs** - Only members can read ❌ **CANNOT BE IMPLEMENTED**

## Current Implementation

The current permissions in `libs/zrocket-contracts/src/schema/permissions.ts` are:

- **Public channels (`channels`)**: Anyone can read ✅
- **Direct messages (`chats`)**: Only logged-in users can read ⚠️
- **Private groups (`groups`)**: Only logged-in users can read ⚠️
- **Messages (`userMessages`, `systemMessages`)**: Anyone can read ⚠️

### Security Implications

⚠️ **WARNING**: The current implementation has significant security issues:

1. Any logged-in user can see ALL direct messages (not just their own)
2. Any logged-in user can see ALL private groups (not just ones they're members of)
3. ANY user (even non-logged-in) can see ALL messages in ALL rooms

This is not secure and should only be used in development or if you're okay with all data being publicly visible.

## Recommended Solutions

### Option 1: Create a Proper Relationship Table (RECOMMENDED)

The best solution is to change the schema to use a proper many-to-many relationship instead of JSON arrays.

#### Step 1: Create a `room_members` table in MongoDB

```javascript
// New collection: room_members
{
  _id: ObjectId,
  roomId: ObjectId,  // Reference to rooms collection
  userId: ObjectId,  // Reference to users collection
  joinedAt: Date,
  role: String       // Optional: 'owner', 'admin', 'member'
}
```

#### Step 2: Update Zero Schema

```typescript
// Add to libs/zrocket-contracts/src/schema/

// New table for room membership
const roomMembers = table('roomMembers')
  .columns({
    _id: string(),
    roomId: string(),
    userId: string(),
    joinedAt: string(),
    role: string().optional()
  })
  .primaryKey('_id');

// Add relationships
const roomMemberRelationships = relationships(roomMembers, ({ one }) => ({
  room: one({
    sourceField: ['roomId'],
    destSchema: () => chats.table, // or channels/groups
    destField: ['_id']
  }),
  user: one({
    sourceField: ['userId'],
    destSchema: () => users.table,
    destField: ['_id']
  })
}));
```

#### Step 3: Update Permissions

```typescript
const allowIfRoomMember = (
  authData: JwtPayload,
  eb: ExpressionBuilder<Schema, 'chats' | 'groups'>
) => {
  if (!authData.sub) {
    return eb.cmpLit(1, '=', 0); // Deny if not logged in
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
  // Message is in a public channel (anyone can see)
  const inPublicChannel = eb.exists('channels', q =>
    q.where(qeb => qeb.cmp('_id', '=', 'roomId'))
  );
  
  if (!authData.sub) {
    // Not logged in - only public channels
    return inPublicChannel;
  }
  
  // Message is in a room the user is a member of
  const inMemberRoom = eb.exists('roomMembers', q =>
    q.where(qeb =>
      qeb.cmp('roomId', '=', 'roomId')
        .and(qeb.cmpLit('userId', '=', authData.sub))
    )
  );
  
  return inPublicChannel.or(inMemberRoom);
};
```

### Option 2: Use Client-Side Filtering (TEMPORARY WORKAROUND)

If you can't change the schema right away, you can implement client-side filtering. This is **NOT SECURE** from a data leak perspective, but can provide a better UX.

```typescript
// In your React components
import { useQuery } from '@rocicorp/zero/react';
import { useAuth } from './auth';

function useUserChats() {
  const { user } = useAuth();
  const [allChats] = useQuery(zero.query.chats);
  
  // Filter client-side
  return allChats?.filter(chat => 
    chat.memberIds.includes(user?.id)
  ) || [];
}

function useAccessibleMessages() {
  const { user } = useAuth();
  const [allMessages] = useQuery(zero.query.userMessages);
  const [publicChannels] = useQuery(zero.query.channels);
  const [accessibleChats] = useQuery(zero.query.chats.where(/* ... */));
  const [accessibleGroups] = useQuery(zero.query.groups.where(/* ... */));
  
  const accessibleRoomIds = new Set([
    ...publicChannels.map(c => c._id),
    ...accessibleChats.filter(c => c.memberIds.includes(user?.id)).map(c => c._id),
    ...accessibleGroups.filter(g => g.memberIds.includes(user?.id)).map(g => g._id)
  ]);
  
  return allMessages?.filter(msg => 
    accessibleRoomIds.has(msg.roomId)
  ) || [];
}
```

⚠️ **Important**: This approach still syncs ALL data to the client - it just hides it in the UI. A malicious user could still access the data through browser dev tools or by modifying the client code.

### Option 3: Wait for Zero to Support JSON Array Membership

You could wait for Zero to add support for Postgres JSONB operators (like `@>` or `?`) that can check array membership. However, there's no timeline for when/if this feature will be added.

Track progress on Zero's GitHub or reach out to the Zero team to request this feature.

## Migration Path

If you choose Option 1 (recommended), here's a migration strategy:

### Phase 1: Add the new table (backward compatible)

1. Create the `room_members` collection in MongoDB
2. Write a migration script to populate it from existing `memberIds` arrays
3. Add the new Zero table schema and relationships
4. Deploy without changing permissions yet

### Phase 2: Update permissions

1. Update permissions to use the new `roomMembers` relationship
2. Deploy permissions using `npx zero-deploy-permissions`
3. Test thoroughly

### Phase 3: Clean up (optional)

1. Remove `memberIds` arrays from rooms (if no longer needed)
2. Update any other code that was using `memberIds`

## Conclusion

The fundamental issue is that Zero's permissions system works best with **normalized relational data**, not with **embedded JSON arrays**. 

The recommended solution is to denormalize the membership data into a separate table, which allows Zero's permissions system to work properly using the `exists` function with relationships.

This is a common pattern in Zero applications and aligns with how Postgres/relational databases typically handle many-to-many relationships.
