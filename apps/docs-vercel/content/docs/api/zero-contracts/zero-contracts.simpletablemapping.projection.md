---
title: 'SimpleTableMapping.projection property'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [SimpleTableMapping](./zero-contracts.simpletablemapping.md) &gt; [projection](./zero-contracts.simpletablemapping.projection.md)

## SimpleTableMapping.projection property

MongoDB-like projection to apply. Both include/exclude (`1 | 0`<!-- -->) and simple renaming (`$sourceField`<!-- -->) syntaxes are supported.

Supports: - Include/exclude: `{ field: 1 }` or `{ field: 0 }` - Field reference: `{ field: '$otherField' }` - Projection operators: `{ field: { $concat: ['$a', '$b'] } }`

**Signature:**

```typescript
projection?: Projection<TTable>;
```
