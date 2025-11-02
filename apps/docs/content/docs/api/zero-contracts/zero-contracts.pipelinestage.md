---
title: 'PipelineStage type'
---

[Home](./index.md) &gt; [@cbnsndwch/zero-contracts](./zero-contracts.md) &gt; [PipelineStage](./zero-contracts.pipelinestage.md)

## PipelineStage type

Supported pipeline stages (extensible via union type).

New stage types can be added to this union without breaking existing code, following the Open-Closed Principle.

**Signature:**

```typescript
type PipelineStage<T = Dict> =
    | MatchStage<T>
    | UnwindStage
    | SetStage
    | ProjectStage<T>;
```

**References:** [Dict](./zero-contracts.dict.md)<!-- -->, [MatchStage](./zero-contracts.matchstage.md)<!-- -->, [UnwindStage](./zero-contracts.unwindstage.md)<!-- -->, [SetStage](./zero-contracts.setstage.md)<!-- -->, [ProjectStage](./zero-contracts.projectstage.md)
