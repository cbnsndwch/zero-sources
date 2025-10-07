# Issue #77 - Zero Get-Queries Protocol Format Fix

## Problem

After migrating components to use synced query hooks, the application failed to sync room data with the following error:

```
[Zero Cache] closing connection with error: TypeError: Expected array. Got object {}
[Zero Cache] Sending error on WebSocket {"kind":"Internal","message":"TypeError: Expected array. Got object"}
```

## Root Cause

The `zero-queries.controller.ts` endpoint was returning an incorrect response format:

**❌ Incorrect (Object format)**:
```typescript
return {
    queries: {},
    timestamp: Date.now()
};
```

According to the Zero protocol specification (from `.github/instructions/zero-llms.instructions.md`), the endpoint must:

1. Accept request body as an **array**: `[{ id: string, name: string, args: ReadonlyJSONValue[] }]`
2. Return response as an **array**: `[{ id: string, name: string, ast: AST } | { error: ..., id, name, details }]`

## Solution

Updated the controller to follow the Zero protocol specification:

### Changes to Controller (`zero-queries.controller.ts`)

1. **Changed return type** from `Promise<object>` to `Promise<object[]>`

2. **Parse request body** as an array of query requests:
   ```typescript
   const queryRequests = (request.body as any[]) || [];
   ```

3. **Return array response** with AST for each query:
   ```typescript
   return queryRequests.map((queryReq) => ({
       id: queryReq.id,
       name: queryReq.name,
       ast: {
           table: 'room',
           where: [{
               type: 'simple',
               op: '=',
               left: { type: 'column', name: '_id' },
               right: { type: 'literal', value: 'never-matches' }
           }]
       }
   }));
   ```

4. **Added logging** for received query requests to aid debugging

### Changes to Tests (`zero-queries.controller.test.ts`)

1. **Changed mock request format** from Fetch API `Request` to Express `Request`:
   ```typescript
   // Before: new Request('http://...', { method: 'POST', headers: {...} })
   // After: { headers: {...}, body: [...] } as Request
   ```

2. **Updated test expectations** to check for array responses:
   ```typescript
   // Before: expect(result).toEqual({ queries: {}, timestamp: expect.any(Number) })
   // After: expect(result).toEqual([]) or expect(Array.isArray(result)).toBe(true)
   ```

3. **Added test cases** for:
   - Empty query requests (should return empty array)
   - Multiple query requests (should return array with multiple responses)
   - Missing body handling (should return empty array)
   - AST structure validation

## Technical Details

### Zero Protocol Format

**Request Body**:
```typescript
type TransformRequestBody = {
    id: string;        // Query request ID
    name: string;      // Query name (e.g., 'myChats', 'publicChannels')
    args: readonly ReadonlyJSONValue[];  // Query arguments
}[]
```

**Response Body**:
```typescript
type TransformResponseBody = ({
    id: string;        // Matches request ID
    name: string;      // Matches request name
    ast: AST;          // Abstract Syntax Tree for the query
} | {
    error: "app" | "zero" | "http";
    id: string;
    name: string;
    details: ReadonlyJSONValue;
})[]
```

### AST (Abstract Syntax Tree)

The AST represents a query in Zero's internal format. For now, we return a minimal "empty result" AST:

```typescript
{
    table: 'room',  // Table name
    where: [{       // WHERE clause
        type: 'simple',
        op: '=',
        left: { type: 'column', name: '_id' },
        right: { type: 'literal', value: 'never-matches' }
    }]
}
```

This AST represents: `SELECT * FROM room WHERE _id = 'never-matches'`

Since no records will match this condition, it returns an empty result set without crashing the protocol.

## Testing

All tests passing:

```
✓ ZeroQueriesController > handleQueries (7 tests)
  ✓ should be defined
  ✓ should return empty array when no queries requested (authenticated user)
  ✓ should return array with query responses when queries requested
  ✓ should handle anonymous requests (no auth header)
  ✓ should propagate authentication errors
  ✓ should handle missing body gracefully
  ✓ should include correct AST structure in response

Test Files  1 passed (1)
     Tests  7 passed (7)
```

Full test suite: **120 passed, 75 skipped** ✅

## Impact

### ✅ Fixed

- Zero cache protocol errors no longer occur
- WebSocket connections remain stable
- Application no longer crashes with "Expected array. Got object" error

### ⚠️ Current Limitation

The endpoint returns **empty result sets** for all queries. This is a placeholder implementation until the full `GetQueriesHandler` service is implemented in issue #70.

**What this means:**
- Rooms/channels/chats will NOT sync to the UI yet
- No protocol errors occur
- The application remains functional for testing component structure

### 🔜 Next Steps

**Issue #70: [ZSQ][E02_01] Create GetQueriesHandler Service**

This issue will implement:
1. Query resolution using imported query definitions
2. Authentication context passing
3. Permission filtering
4. Actual AST generation from query functions
5. Full query execution and results

Once #70 is complete, the synced queries will return real data and rooms will appear in the UI.

## Files Changed

- `apps/zrocket/src/features/zero-queries/zero-queries.controller.ts` (controller implementation)
- `apps/zrocket/src/features/zero-queries/zero-queries.controller.test.ts` (test updates)

## Commit

```
[ZSQ][E02_08] Fix Zero get-queries protocol format

- Changed response from object to array format per Zero protocol
- Response now: [{ id, name, ast }] instead of { queries: {}, timestamp }
- Parse request body array and return response for each query
- Return minimal AST (empty result set) until full handler implemented
- Updated all controller tests to use Express Request format
- All 120 tests passing

Related to #77 - fixes room sync protocol error
```

## Related Issues

- **Issue #77**: [ZSQ][E02_08] Update Components Using Direct Queries (current)
- **Issue #70**: [ZSQ][E02_01] Create GetQueriesHandler Service (next)
- **Epic #62**: [ZSQ][E02] Query Definitions and Client Integration

## References

- [Zero Protocol Documentation](.github/instructions/zero-llms.instructions.md#custom-server-implementation)
- [Zero Synced Queries](https://rocicorp.dev/docs/zero/synced-queries)
- [ZRocket Synced Queries PRD](docs/projects/zrocket-synced-queries/PRD.md)

---

**Status**: ✅ Complete  
**Date**: 2025-10-07  
**Author**: GitHub Copilot
