---
title: 'SyncedQueriesModule class'
---

[Home](./index.md) &gt; [@cbnsndwch/nest-zero-synced-queries](./nest-zero-synced-queries.md) &gt; [SyncedQueriesModule](./nest-zero-synced-queries.syncedqueriesmodule.md)

## SyncedQueriesModule class

Dynamic module for Zero Synced Queries infrastructure.

This module provides all the plumbing needed for Zero synced queries: - Automatic discovery of `@SyncedQuery` methods in controllers and providers - HTTP endpoint for query transformation requests from Zero cache - Query execution and AST conversion service - Error handling per Zero protocol

\#\# Usage

Import this module in your app module using `forRoot()` to configure:

**Signature:**

```typescript
export declare class SyncedQueriesModule
```

## Example

```typescript
@Module({
    imports: [
        SyncedQueriesModule.forRoot({
            path: 'api/zero/get-queries'
        }),
        ChatModule // Has @SyncedQuery methods in controllers
    ]
})
export class AppModule {}
```

\#\# What You Get

After importing this module: 1. \*\*Automatic Discovery\*\*: All `@SyncedQuery` decorated methods are found 2. \*\*HTTP Endpoint\*\*: POST endpoint at your configured path 3. \*\*Transform Service\*\*: Executes queries and converts to AST 4. \*\*No Boilerplate\*\*: Just decorate your methods, everything else is handled

\#\# Architecture

The module uses NestJS's DiscoveryModule to scan for decorated methods: - At startup, scans all controllers and providers - Registers handlers in a Map for O(1) lookup - Handles authentication, execution, and error responses

## Methods

<table><thead><tr><th>

Method

</th><th>

Modifiers

</th><th>

Description

</th></tr></thead>
<tbody><tr><td>

[forRoot(options)](./nest-zero-synced-queries.syncedqueriesmodule.forroot.md)

</td><td>

`static`

</td><td>

Configure the synced queries module with options.

</td></tr>
</tbody></table>
