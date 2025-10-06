# JWT Payload vs QueryContext Comparison

## Side-by-Side Field Comparison

| JWT Field | Type | Required? | QueryContext Field | Type | Required? | Match? |
|-----------|------|-----------|-------------------|------|-----------|--------|
| `sub` | `string` | ✅ Yes | `userID` | `string` | ✅ Yes | ⚠️ Name differs |
| `email` | `string` | ✅ Yes | `email` | `string` | ✅ Yes | ✅ Exact match |
| `name` | `string` | ⚪ Optional | `name` | `string` | ⚪ Optional | ✅ Exact match |
| `preferred_username` | `string` | ⚪ Optional | `preferredUsername` | `string` | ⚪ Optional | ⚠️ Name differs (camelCase) |
| `picture` | `string` | ⚪ Optional | `picture` | `string` | ⚪ Optional | ✅ Exact match |
| `roles` | `string[]` | ⚪ Optional | `roles` | `string[]` | ⚪ Optional | ✅ Exact match |
| `iat` | `number` | ⚪ Optional | - | - | - | ❌ Not in QueryContext |
| `exp` | `number` | ⚪ Optional | - | - | - | ❌ Not in QueryContext |

## Key Differences

### 1. Field Name Convention
- **JWT uses**: `sub`, `preferred_username` (snake_case for username)
- **QueryContext uses**: `userID`, `preferredUsername` (camelCase)

### 2. Missing JWT Fields
QueryContext intentionally **excludes**:
- `iat` (issued at timestamp) - Not needed for query filtering
- `exp` (expiration timestamp) - Validated at auth layer, not needed in queries

## Two Possible Approaches

### Option A: Exact JWT Mirror (snake_case)
```typescript
export type QueryContext = {
    sub: string;                    // Exact JWT field name
    email: string;
    name?: string;
    preferred_username?: string;    // Exact JWT field name
    picture?: string;
    roles?: string[];
    // Omit iat, exp - not needed for queries
};
```

**Pros:**
- Zero transformation needed
- Direct 1:1 mapping from JWT
- No confusion about field names

**Cons:**
- Non-idiomatic TypeScript (snake_case)
- Less readable in query functions
- `sub` is unclear vs `userID`

### Option B: TypeScript-Friendly (camelCase) - CURRENT
```typescript
export type QueryContext = {
    userID: string;                 // Mapped from JWT 'sub'
    email: string;
    name?: string;
    preferredUsername?: string;     // Mapped from JWT 'preferred_username'
    picture?: string;
    roles?: string[];
};
```

**Pros:**
- Idiomatic TypeScript (camelCase)
- Clear, readable field names
- Better developer experience

**Cons:**
- Requires explicit mapping in auth helper
- Field names don't match JWT exactly

## Recommendation

I believe **Option B (current approach)** is correct because:

1. **Separation of Concerns**: JWT is a wire format; QueryContext is an application interface
2. **TypeScript Conventions**: camelCase is idiomatic
3. **Clarity**: `userID` is clearer than `sub` for developers
4. **Industry Standard**: Most TypeScript apps transform JWT claims to cleaner interfaces

The mapping happens in the **Authentication Helper (E01_03)**:

```typescript
async authenticateRequest(request: Request): Promise<QueryContext | undefined> {
    const token = extractToken(request);
    const jwt: JwtPayload = await this.jwtService.verify(token);
    
    return {
        userID: jwt.sub,                          // Transform here
        email: jwt.email,
        name: jwt.name,
        preferredUsername: jwt.preferred_username, // Transform here
        picture: jwt.picture,
        roles: jwt.roles
    };
}
```

## Question for You

Which approach do you prefer?

1. **Keep current** (TypeScript-friendly camelCase with mapping)
2. **Change to exact JWT mirror** (use `sub` and `preferred_username` directly)

Let me know and I'll update accordingly!
