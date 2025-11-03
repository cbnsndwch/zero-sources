---
title: 'ProjectStage interface'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [ProjectStage](./zero-contracts.projectstage.md)

## ProjectStage interface

Represents a MongoDB $project aggregation stage.

The $project stage reshapes documents by: - Including/excluding fields - Adding computed fields - Renaming fields - Creating new fields from expressions

Unlike SimpleTableMapping projection which applies only to the final output, $project stages can be used at any point in the pipeline to transform documents before subsequent stages.

T - The document type (for type hints only, not enforced at runtime)

**Signature:**

```typescript
interface ProjectStage<T = Dict>
```

## Example

```typescript
// Include specific fields
const stage: ProjectStage = {
    $project: {
        _id: 1,
        name: 1,
        email: 1
    }
};

// Exclude fields
const excludeStage: ProjectStage = {
    $project: {
        password: 0,
        internalNotes: 0
    }
};

// Rename and compute fields
const computedStage: ProjectStage = {
    $project: {
        _id: 1,
        userId: '$_id',
        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
        isActive: { $eq: ['$status', 'active'] }
    }
};

// Complex transformations
const complexStage: ProjectStage = {
    $project: {
        compositeId: { $concat: ['$accountId', '_', '$userId'] },
        accountRef: '$accountId',
        userRef: { $toObjectId: '$userId' },
        metadata: {
            createdAt: '$createdAt',
            updatedAt: '$updatedAt'
        }
    }
};
```

## Properties

<table><thead><tr><th>

Property

</th><th>

Modifiers

</th><th>

Type

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[$project](./zero-contracts.projectstage._project.md)

</td><td>

</td><td>

[Projection](./zero-contracts.projection.md)<!-- -->&lt;T&gt;

</td><td>

MongoDB projection specification.

Can contain: - Inclusion: `{ field: 1 }` - include this field - Exclusion: `{ field: 0 }` - exclude this field - Field reference: `{ newField: '$existingField' }` - rename/reference field - Operators: `{ field: { $concat: [...] } }` - computed values

Note: Cannot mix inclusion and exclusion (except for \_id which can always be explicitly excluded)

</td></tr>
</tbody></table>
