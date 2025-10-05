# Zrocket Permissions Update - Summary

## What Was Requested

Update the zrocket schema permissions so that:
- Users who are not logged in can see public channels and their messages ✅
- Logged-in users can additionally see only private rooms and DM rooms they are members of ❌

## What Was Implemented

### Implemented ✅

1. **Public channels (`channels`)**: Anyone can read, including non-logged-in users
2. **Public channel messages**: Anyone can read messages (currently all messages are visible)

### Partially Implemented ⚠️

1. **Direct messages (`chats`)**: Only logged-in users can read (not just members)
2. **Private groups (`groups`)**: Only logged-in users can read (not just members)

### Not Implemented ❌

1. **Member-only access to private rooms**: Cannot check if user is in the `memberIds` JSON array
2. **Message filtering by room access**: Cannot restrict messages based on room membership

## Why Full Implementation Wasn't Possible

**Zero does not currently support checking membership in JSON array columns.**

The zrocket schema stores room membership as a JSON array (`memberIds: string[]`), but Zero's permissions system cannot check if a value exists within a JSON array. Zero's permissions work best with normalized relational data using the `exists` function with relationships.

## Security Implications ⚠️

The current implementation has security issues:

1. ❌ Any logged-in user can see ALL direct messages
2. ❌ Any logged-in user can see ALL private groups  
3. ❌ Anyone (even non-logged-in) can see ALL messages

**This is not production-ready for a secure messaging application.**

## Recommended Solution

Create a proper `room_members` junction table instead of using JSON arrays:

```typescript
// New MongoDB collection
{
  _id: ObjectId,
  roomId: ObjectId,  // Reference to room
  userId: ObjectId,  // Reference to user
  joinedAt: Date,
  role: String       // Optional
}
```

Then use Zero's `exists` function with relationships to check membership:

```typescript
const allowIfRoomMember = (authData, eb) => {
  return eb.exists('roomMembers', q =>
    q.where(qeb => 
      qeb.cmp('roomId', '=', '_id')
        .and(qeb.cmpLit('userId', '=', authData.sub))
    )
  );
};
```

## Files Modified

1. **libs/zrocket-contracts/src/schema/permissions.ts**
   - Updated with current "best effort" permissions
   - Added extensive comments explaining limitations
   - Includes security warnings

## Documentation Created

1. **docs/projects/zrocket/PERMISSIONS_LIMITATIONS.md**
   - Detailed explanation of the limitations
   - Complete migration guide with code examples
   - Three solution options with pros/cons
   - Step-by-step implementation instructions

## Next Steps

Choose one of these approaches:

### Option 1: Implement Proper Relationships (Recommended)
- Create `room_members` junction table
- Update schema to include relationships
- Update permissions to use `exists` function
- Migrate existing data
- **Result**: Full security, proper permissions ✅

### Option 2: Client-Side Filtering (Temporary)
- Filter data in React components
- **Result**: Better UX, but data still leaks to client ⚠️

### Option 3: Accept Current State
- Use only for development/demo
- **Result**: Not secure, but simple ⚠️

### Option 4: Wait for Zero Feature
- Track Zero's GitHub for JSON array support
- **Result**: Unknown timeline ❓

## Testing

To test the current permissions:

```bash
# Export and deploy permissions
cd libs/zrocket-contracts
pnpm build

# If using the change source server setup
# The permissions should auto-deploy via the export script
```

Then test in the app:
1. Try accessing as non-logged-in user (should see only public channels)
2. Try accessing as logged-in user (will see all rooms - this is the security issue)
3. Verify messages are visible (currently all are visible)

## Contact

If you need help implementing Option 1 (proper relationships), let me know and I can help with:
- Creating the migration script
- Updating the schema files
- Implementing the new permissions
- Testing the changes
