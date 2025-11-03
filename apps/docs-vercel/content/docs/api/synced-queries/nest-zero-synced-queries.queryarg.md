---
title: 'QueryArg() function'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [QueryArg](./nest-zero-synced-queries.queryarg.md)

## QueryArg() function

Parameter decorator to inject a query argument by index.

Use this decorator to explicitly map query arguments to method parameters.

**Signature:**

```typescript
export declare function QueryArg(index: number): ParameterDecorator;
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

index

</td><td>

number

</td><td>

The index of the argument in the query args array

</td></tr>
</tbody></table>

**Returns:**

ParameterDecorator

## Remarks

- Useful when mixing authenticated and query parameters - Makes parameter mapping explicit - Can skip parameters if not needed

## Example

```typescript
@SyncedQuery('search', z.tuple([z.string(), z.number()]))
async search(
  @CurrentUser() user: JwtPayload,
  @QueryArg(0) query: string,
  @QueryArg(1) limit: number
) {
  // query = args[0], limit = args[1]
}
```
