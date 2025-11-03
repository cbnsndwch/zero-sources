---
title: 'ZeroTableSchema.createForClass() method'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-nest-mongoose](./zero-nest-mongoose.md) &gt; [ZeroTableSchema](./zero-nest-mongoose.zerotableschema.md) &gt; [createForClass](./zero-nest-mongoose.zerotableschema.createforclass.md)

## ZeroTableSchema.createForClass() method

Creates a zero table schema from a given Mongoose entity class.

TEntity - The type of the entity class. MUST extend `mongoose.Document`<!-- -->.

**Signature:**

```typescript
static createForClass<TEntity extends Document<string, unknown, TEntity>>(target: Type<TEntity>): {
        name: string;
        primaryKey: readonly ["_id"];
        columns: ColumnsFromEntity<TEntity>;
    };
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

target

</td><td>

Type&lt;TEntity&gt;

</td><td>

The entity class to generate the schema from.

</td></tr>
</tbody></table>

**Returns:**

{ name: string; primaryKey: readonly \["\_id"\]; columns: ColumnsFromEntity&lt;TEntity&gt;; }

The generated zero table schema.

## Exceptions

Will throw an error if the collection name is missing in the entity's `@Schema` decorator.
