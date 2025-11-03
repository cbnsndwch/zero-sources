---
title: 'ProjectStage.$project property'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [ProjectStage](./zero-contracts.projectstage.md) &gt; [$project](./zero-contracts.projectstage._project.md)

## ProjectStage.$project property

MongoDB projection specification.

Can contain: - Inclusion: `{ field: 1 }` - include this field - Exclusion: `{ field: 0 }` - exclude this field - Field reference: `{ newField: '$existingField' }` - rename/reference field - Operators: `{ field: { $concat: [...] } }` - computed values

Note: Cannot mix inclusion and exclusion (except for \_id which can always be explicitly excluded)

**Signature:**

```typescript
$project: Projection<T>;
```
