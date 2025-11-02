---
title: 'SyncedQueryTransformService class'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQueryTransformService](./nest-zero-synced-queries.syncedquerytransformservice.md)

## SyncedQueryTransformService class

Service for transforming Zero query requests into AST responses.

This service coordinates: 1. Looking up query handlers in the registry 2. Executing handlers with user context and arguments 3. Converting query builders to AST format 4. Handling errors per Zero protocol

**Signature:**

```typescript
export declare class SyncedQueryTransformService
```

## Remarks

This is internal plumbing - users don't interact with this directly. The `SyncedQueriesController` uses this service to process requests.

\#\# Architecture

The service processes queries in parallel for performance: - Each query is executed independently - Errors are isolated to individual query responses - Handler lookup is O(1) via Map - Target overhead: &lt; 100ms for multiple queries

\#\# Error Handling

Errors are caught and returned as error responses per Zero protocol: - Unknown query names return 'app' errors - Query execution failures return 'app' errors with details - Missing toAST() methods return 'app' errors

## Example

```typescript
// Request from Zero cache:
POST /api/zero/get-queries
[
  { "id": "q1", "name": "myChats", "args": [] },
  { "id": "q2", "name": "chatById", "args": ["chat-123"] }
]

// Response:
[
  { "id": "q1", "name": "myChats", "ast": { ... } },
  { "id": "q2", "name": "chatById", "ast": { ... } }
]
```

## Constructors

<table><thead><tr><th>

Constructor

</th><th>

Modifiers

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[(constructor)(registry)](./nest-zero-synced-queries.syncedquerytransformservice._constructor_.md)

</td><td>

</td><td>

Constructs a new instance of the `SyncedQueryTransformService` class

</td></tr>
</tbody></table>

## Methods

<table><thead><tr><th>

Method

</th><th>

Modifiers

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[transformQueries(request, input)](./nest-zero-synced-queries.syncedquerytransformservice.transformqueries.md)

</td><td>

</td><td>

Transform multiple query requests in parallel.

</td></tr>
</tbody></table>
