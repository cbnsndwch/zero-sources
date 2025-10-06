# QueryContext = JwtPayload: Zero Transformations Approach

## Decision

`QueryContext` is now simply a type alias for `JwtPayload`. No separate type definition, no field mapping, no transformations.

```typescript
export type QueryContext = JwtPayload;
```

## Rationale

### Why Use JwtPayload Directly?

1. **No Magic Translations** - Field names match JWT exactly (`sub`, `preferred_username`)
2. **Single Source of Truth** - All field definitions live in `JwtPayload`
3. **Zero Duplication** - No need to maintain two identical type definitions
4. **Simpler Auth Helper** - Just verify JWT and pass it through
5. **All Claims Available** - Even `iat` and `exp` are accessible if needed

### Previous Approach (Rejected)

We initially tried to create a separate `QueryContext` type that mirrored JWT fields:

```typescript
// ❌ Unnecessary duplication
export type QueryContext = {
    sub: string;
    email: string;
    name?: string;
    preferred_username?: string;
    picture?: string;
    roles?: string[];
};
```

**Problems:**
- Duplicates the entire `JwtPayload` definition
- Requires keeping two types in sync
- No added value since fields are identical

### Current Approach (Simple!)

```typescript
// ✅ Just use JwtPayload directly
import type { JwtPayload } from '../auth/index.js';

export type QueryContext = JwtPayload;
```

**Benefits:**
- One line instead of dozens
- Impossible to get out of sync
- Clear that context IS the JWT payload

## Implementation Impact

### Authentication Helper (E01_03)

**Before** (with separate type):
```typescript
async authenticateRequest(request: Request): Promise<QueryContext | undefined> {
    const token = extractToken(request);
    const jwt: JwtPayload = await this.jwtService.verify(token);
    
    // Map fields from JWT to QueryContext
    return {
        sub: jwt.sub,
        email: jwt.email,
        name: jwt.name,
        preferred_username: jwt.preferred_username,
        picture: jwt.picture,
        roles: jwt.roles
    };
}
```

**After** (with alias):
```typescript
async authenticateRequest(request: Request): Promise<QueryContext | undefined> {
    const token = extractToken(request);
    return await this.jwtService.verify(token); // That's it!
}
```

### Query Definitions (E02_01-03)

No change needed - queries still use `QueryContext` type:

```typescript
export const myChats = syncedQueryWithContext<Schema, QueryContext>(
    'myChats',
    z.tuple([]),
    (builder, ctx) => {
        if (!isAuthenticated(ctx)) {
            return builder.chats.where('_id', '=', 'never-matches');
        }
        
        return builder.chats
            .where('ownerId', '=', ctx.sub)  // Use JWT field name
            .orderBy('lastMessageAt', 'desc');
    }
);
```

## Type Safety Maintained

Even though it's an alias, we still get full type safety:

```typescript
function myQuery(ctx: QueryContext | undefined) {
    if (isAuthenticated(ctx)) {
        // TypeScript knows ctx is defined and has all JwtPayload fields
        const userId: string = ctx.sub;
        const email: string = ctx.email;
        const roles: string[] | undefined = ctx.roles;
    }
}
```

## Files Modified

1. `libs/zrocket-contracts/src/queries/context.ts`
   - Changed from duplicate type to simple alias
   - Added import for `JwtPayload`
   - Updated documentation

2. `libs/zrocket-contracts/src/queries/context.test.ts`
   - All tests still pass (9/9 ✅)
   - No test changes needed

3. `libs/zrocket-contracts/src/queries/README.md`
   - Updated documentation to explain alias approach
   - Removed "mapping table" (no mapping needed!)

## Future Work

This simplification makes E01_03 (Authentication Helper) even simpler:

```typescript
@Injectable()
export class ZeroQueryAuth {
    constructor(private jwtService: JwtService) {}

    async authenticateRequest(request: Request): Promise<QueryContext | undefined> {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return undefined;
        
        const token = authHeader.replace('Bearer ', '');
        return await this.jwtService.verify(token); // Just return the JWT!
    }
}
```

## Conclusion

**QueryContext = JwtPayload** is the simplest, clearest approach:
- ✅ No duplication
- ✅ No transformations
- ✅ No mapping confusion
- ✅ Single source of truth
- ✅ Easier to maintain

This embodies the principle: **"The best code is no code."**

---

**Status**: ✅ IMPLEMENTED
**Date**: October 6, 2025
**Epic**: [ZSQ][E01] Synced Query Infrastructure Setup
**Story**: [ZSQ][E01_02] Create Query Context Type Definitions
