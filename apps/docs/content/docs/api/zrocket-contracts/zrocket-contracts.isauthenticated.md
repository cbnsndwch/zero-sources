---
title: 'isAuthenticated() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zrocket-contracts](./zrocket-contracts.md) &gt; [isAuthenticated](./zrocket-contracts.isauthenticated.md)

## isAuthenticated() function

Type guard to check if the query context contains required authentication information.

**Signature:**

```typescript
declare function isAuthenticated(
    ctx: QueryContext | undefined
): ctx is QueryContext;
```

## Parameters

<table><thead><tr><th>

Parameter

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

ctx

</td><td>

[QueryContext](./zrocket-contracts.querycontext.md) \| undefined

</td><td>

The query context to check, which may be undefined for anonymous requests

</td></tr>
</tbody></table>

**Returns:**

ctx is [QueryContext](./zrocket-contracts.querycontext.md)

`true` if the context is defined and contains a valid sub (user ID), `false` otherwise

## Remarks

This type guard can be used to narrow the type of the context from `QueryContext | undefined` to `QueryContext`<!-- -->, enabling TypeScript to provide proper type checking for authenticated-only code paths.

## Example

```typescript
function myQuery(builder, ctx) {
    if (!isAuthenticated(ctx)) {
        // Handle anonymous user case
        return builder.publicChannels.all();
    }

    // ctx is now typed as QueryContext (not undefined)
    return builder.rooms.where('ownerId', '=', ctx.sub).all();
}
```
