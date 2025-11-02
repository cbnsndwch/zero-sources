---
title: 'unwind() function'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [unwind](./zero-contracts.unwind_1.md)

## unwind() function

Creates an $unwind pipeline stage with advanced options.

**Signature:**

```typescript
declare function unwind(options: UnwindOptions): UnwindStage;
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

options

</td><td>

[UnwindOptions](./zero-contracts.unwindoptions.md)

</td><td>

Unwinding options including path, preserve behavior, and index inclusion

</td></tr>
</tbody></table>

**Returns:**

[UnwindStage](./zero-contracts.unwindstage.md)

An $unwind stage with full options

## Example

```typescript
const stage = unwind({
    path: '$members',
    preserveNullAndEmptyArrays: false,
    includeArrayIndex: 'memberIndex'
});
// { $unwind: { path: '$members', preserveNullAndEmptyArrays: false, includeArrayIndex: 'memberIndex' } }
```
