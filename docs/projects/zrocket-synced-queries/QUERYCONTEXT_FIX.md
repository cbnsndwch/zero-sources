# QueryContext JWT Claims Exact Mirror

## Issue

The `QueryContext` type definition did not properly match the actual JWT claims structure issued by our authentication system. To avoid "magic translations" and maintain clarity, we updated QueryContext to exactly mirror JWT field names.

## Root Cause

The initial `QueryContext` type was created based on assumptions rather than the actual `JwtPayload` structure defined in `libs/zrocket-contracts/src/auth/index.ts`.

## JWT Payload vs Original QueryContext

### Actual JWT Structure (`JwtPayload`)
```typescript
{
    sub: string;                    // User ID
    email: string;                  // Required
    name?: string;                  // Full name
    preferred_username?: string;    // Username handle
    picture?: string;               // Profile picture URL
    roles?: string[];               // Array of role strings
    iat?: number;
    exp?: number;
}
```

### Original QueryContext (INCORRECT)
```typescript
{
    userID: string;        // from 'sub' ✅
    role?: 'admin' | 'user';  // ❌ JWT has 'roles' (plural array)
    username?: string;     // from 'name' ✅ but missing 'preferred_username'
}
```

### Mismatches Identified

1. ❌ **Missing `email`** - Required field in JWT, not in QueryContext
2. ❌ **Wrong `role` type** - QueryContext had singular enum, JWT has `roles` array
3. ❌ **Missing `preferredUsername`** - JWT includes this field
4. ❌ **Missing `picture`** - Useful for avatar display
5. ✅ **`userID` ← `sub`** - Correctly mapped
6. ⚠️ **`username` ← `name`** - Present but could be confused with `preferred_username`

## Solution

Updated `QueryContext` to accurately reflect all JWT claims:

### Corrected QueryContext (Exact JWT Mirror)
```typescript
export type QueryContext = {
    // Required fields - exact JWT field names
    sub: string;                 // JWT 'sub' claim (no translation to 'userID')
    email: string;               // JWT 'email' claim
    
    // Optional fields - exact JWT field names
    name?: string;               // JWT 'name' claim
    preferred_username?: string; // JWT 'preferred_username' claim (not camelCase!)
    picture?: string;            // JWT 'picture' claim
    roles?: string[];            // JWT 'roles' claim
    
    // Omitted: iat, exp (validated at auth layer, not needed in queries)
};
```

## Files Modified

### 1. `libs/zrocket-contracts/src/queries/context.ts`
- ✅ Updated `QueryContext` type to match `JwtPayload` structure
- ✅ Added comprehensive JSDoc comments for each field
- ✅ Linked to OIDC and RFC 7519 specifications
- ✅ Cross-referenced with `JwtPayload` type

### 2. `libs/zrocket-contracts/src/queries/context.test.ts`
- ✅ Updated all test cases to use new required `email` field
- ✅ Added tests for new optional fields (`preferredUsername`, `picture`)
- ✅ Updated `roles` tests to use array instead of single enum
- ✅ All 9 tests passing

### 3. `libs/zrocket-contracts/src/queries/README.md`
- ✅ Updated type definition example
- ✅ Updated JWT to Context mapping table with all fields
- ✅ Added Required/Optional column for clarity
- ✅ Cross-referenced `JwtPayload` location

## Verification

✅ All tests passing (9/9)
✅ No TypeScript compilation errors
✅ Documentation updated and accurate

## Impact Assessment

### ✅ Safe Changes
- This is a **type definition update** at the contract level
- No implementation code exists yet that uses this type
- This task (E01_02) is the **foundation** for future work

### 🔄 Dependent Tasks (Not Yet Started)
These tasks will now implement correctly with accurate types:

1. **E01_03** - Authentication Helper
   - Will correctly extract all JWT claims to QueryContext
   - No rework needed since not yet implemented

2. **E02_01-03** - Query Definitions
   - Will have access to correct user context fields
   - Can use `roles` array for RBAC checks
   - Can display user avatars with `picture` field

3. **E03_01-04** - Server Implementation
   - Permission filters can use roles properly
   - Get-queries handler will map JWT correctly

## Benefits of This Fix

1. **Type Safety** - QueryContext now accurately represents JWT data
2. **RBAC Support** - `roles` array enables proper role-based access control
3. **Better UX** - Can display user names, usernames, and avatars
4. **Standards Compliance** - Follows OIDC standard claims
5. **No Rework** - Fixed before any implementation started

## Testing

```bash
cd libs/zrocket-contracts
pnpm test context.test.ts
```

**Result**: ✅ All 9 tests passing

## Related Documentation

- JWT Payload: `libs/zrocket-contracts/src/auth/index.ts`
- OIDC Standard Claims: https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
- RFC 7519 (JWT): https://www.rfc-editor.org/rfc/rfc7519.html

## Next Steps

1. ✅ This fix is complete and tested
2. 🔄 Ready to proceed with E01_03 (Authentication Helper)
3. 🔄 Authentication helper will correctly map JWT → QueryContext
4. 🔄 Query definitions will have accurate user context

---

**Status**: ✅ COMPLETE
**Date**: October 6, 2025
**Epic**: [ZSQ][E01] Synced Query Infrastructure Setup
**Story**: [ZSQ][E01_02] Create Query Context Type Definitions
