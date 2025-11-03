---
title: 'IChangeMaker type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-source-mongodb](./zero-source-mongodb.md) &gt; [IChangeMaker](./zero-source-mongodb.ichangemaker.md)

## IChangeMaker type

**Signature:**

```typescript
export type IChangeMaker<TChangeData> = {
    makeInsertChanges(
        watermark: string,
        doc: Pick<ChangeStreamInsertDocument, '_id' | 'fullDocument' | 'ns'>,
        withTransaction?: boolean
    ): TChangeData[];
    makeUpdateChanges(
        watermark: string,
        doc: ChangeStreamUpdateDocument,
        withTransaction?: boolean
    ): TChangeData[];
    makeReplaceChanges(
        watermark: string,
        doc: ChangeStreamReplaceDocument,
        withTransaction?: boolean
    ): TChangeData[];
    makeDeleteChanges(
        watermark: string,
        doc: ChangeStreamDeleteDocument,
        withTransaction?: boolean
    ): TChangeData[];
    makeDropCollectionChanges(
        watermark: string,
        doc: ChangeStreamDropDocument
    ): TChangeData[];
    makeCreateTableChanges(table: TableSpec): TChangeData[];
    makeZeroRequiredUpstreamTablesChanges(
        appId: string,
        shardId: string
    ): TChangeData[];
    makeBeginChanges(watermark?: string): TChangeData[];
    makeCommitChanges(watermark: string): TChangeData[];
    makeRollbackChanges(): TChangeData[];
};
```

**References:** [TableSpec](./zero-source-mongodb.tablespec.md)
