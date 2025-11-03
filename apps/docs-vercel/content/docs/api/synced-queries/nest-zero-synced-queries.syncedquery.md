---
title: 'SyncedQuery() function'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQuery](./nest-zero-synced-queries.syncedquery.md)

## SyncedQuery() function

Decorator for Zero synced query handlers.

Use this decorator to mark a method as a synced query handler. Works on both controllers and providers.

**Signature:**

```typescript
export declare function SyncedQuery(
    queryName: string,
    inputSchema: z.ZodTypeAny
): MethodDecorator;
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

queryName

</td><td>

string

</td><td>

The name of the query as registered with Zero

</td></tr>
<tr><td>

inputSchema

</td><td>

z.ZodTypeAny

</td><td>

Zod schema for validating input arguments

</td></tr>
</tbody></table>

**Returns:**

MethodDecorator

## Remarks

The method signature can use any NestJS parameter decorators you want. Use @<!-- -->QueryArg(index) to explicitly map query arguments by position.

## Example

```typescript
// Public query (no authentication)
@SyncedQuery('publicChannels', z.tuple([]))
async publicChannels() {
  return builder.channels.where('isPublic', '=', true);
}

// Authenticated query (use your own guards and decorators)
@UseGuards(JwtAuthGuard)
@SyncedQuery('myChats', z.tuple([]))
async myChats(@CurrentUser() user: JwtPayload) {
  return builder.chats.where('userId', '=', user.sub);
}

// Query with arguments
@SyncedQuery('channelById', z.tuple([z.string()]))
async channelById(@QueryArg(0) channelId: string) {
  return builder.channels.where('_id', '=', channelId);
}
```
