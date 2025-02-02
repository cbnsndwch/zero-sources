# Custom Backends

## Goals

- Support replication from upstream datastores other than Postgres

## Non-Goals

- ~~Support mutations to non-postgres datastores~~ (custom mutators will be the write path for these upstream)

## Background

There are three PG-specific components in `zero-cache`

1. [**Mutagen**](https://github.com/rocicorp/mono/blob/main/packages/zero-cache/src/services/mutagen/mutagen.ts) is used to push CRUD mutations to the upstream postgres. The plan is to replace this with custom mutators.
2. [**Initial sync**](https://github.com/rocicorp/mono/blob/main/packages/zero-cache/src/services/change-streamer/pg/initial-sync.ts) copies an initial snapshot of upstream data (tables / rows) into the SQLite replica
3. [**PostgresChangeSource**](https://github.com/rocicorp/mono/blob/main/packages/zero-cache/src/services/change-streamer/pg/change-source.ts) is the Postgres implementation of a [ChangeSource](https://github.com/rocicorp/mono/blob/9b537e7605e77539999014706ad9781d35a90494/packages/zero-cache/src/services/change-streamer/change-streamer-service.ts#L104), which subscribes to the Postgres replication stream and produces a [**ChangeStream**](https://github.com/rocicorp/mono/blob/9b537e7605e77539999014706ad9781d35a90494/packages/zero-cache/src/services/change-streamer/change-streamer-service.ts#L90) that comprises the data changes necessary to incrementally sync the replicated data

From there, the ChangeStreamerService handles the forward-store-ack logic for fanning out changes to multiple view-syncer nodes, and within those nodes, replicators apply those changes to their local SQLite replicas. These components are intended to be upstream agnostic.

## Design (Sketch)

- Custom backends will fronted by an external websocket server/endpoint that adapts upstream data to (a websocket version of) the ChangeSource-ChangeStreamer protocol.
- In order to obviate the need for any direct backend calls from `zero-cache`, this endpoint will also encapsulate the logic of initial sync and stream the initial table data through the ChangeStream.

### Selecting the Custom Endpoint

- There will be a new (initially hidden) option called `ZERO_UPSTREAM_TYPE` that defaults to `pg` but can be set to `custom`.
- When the type is `custom`, the `ZERO_UPSTREAM_DB` option will be interpreted as the URI of the endpoint from which the ChangeStream is to be queried, e.g.

```json
ZERO_UPSTREAM_TYPE = "custom"
ZERO_UPSTREAM_DB = "wss://my-server/changes/v0/stream?apiKey=super-duper-ultra-secret-key"
```

- URI constraints:
    - Any hostname
    - Any set of query parameters that do not conflict with those listed below (i.e. `shardID`, `lastWatermark`). This can be used to ferry an api key, for example.
    - URL path must be `/changes/v0/stream` or whatever `v#` is required by the server. See [Protocol changes / versioning](https://www.notion.so/Custom-Backends-1753bed8954580959aace8d68ef7a9fb?pvs=21) for when this changes.

### Connecting to the Endpoint

The CustomChangeSource implementation will connect to the `ZERO_UPSTREAM_DB` URI and add the following query parameters:

- `shardID` for supporting multiple subscriptions with potentially different views of the upstream data
- `lastWatermark` is the watermark of the last committed / acked watermark. When specified, the endpoint should start streaming changes after the `lastWatermark`. When unspecified, the endpoint should perform an “initial sync” by streaming a snapshot of the data to be replicated (as one transaction), and incremental changes henceforth.

### Change Stream protocol

#### Downstream

- The downstream protocol from the endpoint to the `zero-cache` is mainly a stream of [ChangeStreamMessages](https://github.com/rocicorp/mono/blob/9b537e7605e77539999014706ad9781d35a90494/packages/zero-cache/src/services/change-streamer/change-streamer-service.ts#L76).
- An additional `{tag: "ack-requested", latestUpstreamWatermark?: string}` message will be added to allow implementations to signal the change-streamer to advance its watermark without associating it with any particular data change (i.e. equivalent to the Postgres [`keepalive`](https://www.postgresql.org/docs/current/protocol-replication.html#PROTOCOL-REPLICATION-PRIMARY-KEEPALIVE-MESSAGE) message).

#### Upstream

- The upstream protocol from `zero-cache` to the endpoint is a stream of `["ack", {watermark: string}]` messages. These signal to the endpoint that the `zero-cache` has consumed the stream up to that point, allowing the endpoint to clean up corresponding log entries.
- When the `zero-cache` connects to the endpoint the next time, its `lastWatermark` will be the last `ack` that it sent.

#### Protocol changes / versioning

- The initial protocol is `v0` and reflected in the URL path, which the zero-cache enforces at startup.
- If the protocol is updated with a breaking change, that protocol will be given a new version (e.g. `v2`), and the zero-cache running that code will then require the URL path to be, e.g. `/changes/v2/stream`.
- For a seamless migration, the endpoint must support either version during the transition from the zero-cache that speaks `v0` to the zero-cache that speaks `v1`.
