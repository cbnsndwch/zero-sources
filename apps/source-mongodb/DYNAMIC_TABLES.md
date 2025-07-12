# Dynamic Zero Tables from Upstream Projections

This feature allows you to map multiple Zero schema tables to the same upstream MongoDB collection with optional filtering and projection. This enables advanced use cases like discriminated unions, filtered views, and data transformation.

## Configuration

### New Table Mapping Format

Instead of the simple `publish` array, you can now use the `tables` configuration:

```yaml
db:
  uri: "mongodb://localhost:27017/mydb"
  tables:
    # Map Zero table name to upstream collection with optional filter/projection
    users:
      source: "entities"
      filter: { entityType: "user", isActive: true }
      projection: { _id: 1, name: 1, email: 1, createdAt: 1 }
    
    organizations:
      source: "entities" 
      filter: { entityType: "organization", isDeleted: { $ne: true } }
      projection: { _id: 1, name: 1, domain: 1, memberCount: 1 }
```

### Backward Compatibility

The legacy `publish` format continues to work:

```yaml
db:
  uri: "mongodb://localhost:27017/mydb"
  publish:
    - "users"
    - "messages" 
    - "orders"
```

## Use Cases

### 1. Discriminated Union - Multiple Entity Types in One Collection

A single `entities` collection contains different entity types distinguished by a field:

```yaml
tables:
  users:
    source: "entities"
    filter: { entityType: "user", isActive: true }
    projection: { _id: 1, name: 1, email: 1, createdAt: 1 }
  
  organizations:
    source: "entities"
    filter: { entityType: "organization", isDeleted: { $ne: true } }
    projection: { _id: 1, name: 1, domain: 1, memberCount: 1 }
  
  projects:
    source: "entities"
    filter: { entityType: "project", status: { $in: ["active", "paused"] } }
    projection: { _id: 1, name: 1, organizationId: 1, status: 1 }
```

### 2. Filtered Views - Time-based or Status-based Subsets

Different views of the same collection based on conditions:

```yaml
tables:
  recentOrders:
    source: "orders"
    filter: 
      created_at: { $gte: "2024-01-01T00:00:00Z" }
      status: { $ne: "cancelled" }
    projection: { id: 1, user_id: 1, total: 1, status: 1, created_at: 1 }
  
  archivedOrders:
    source: "orders"
    filter: 
      created_at: { $lt: "2023-01-01T00:00:00Z" }
    projection: { id: 1, user_id: 1, total: 1, archived_at: 1 }
```

### 3. Full Collection Mapping

Map entire collections without filtering or projection:

```yaml
tables:
  messages:
    source: "messages"
    # No filter or projection - streams entire collection
```

## Configuration Options

### `source` (required)
The upstream MongoDB collection name.

### `filter` (optional)
A MongoDB query filter to determine which documents belong to this Zero table. Supports:

- **Basic equality**: `{ status: "active" }`
- **Comparison operators**: `{ age: { $gte: 18 } }`
- **Array operators**: `{ tags: { $in: ["urgent", "important"] } }`
- **Logical operators**: `{ $and: [{ isActive: true }, { role: "admin" }] }`
- **Negation**: `{ isDeleted: { $ne: true } }`
- **Existence**: `{ email: { $exists: true } }`

### `projection` (optional)
A MongoDB projection to select and transform fields. Supports:

- **Inclusion**: `{ _id: 1, name: 1, email: 1 }` (only include specified fields)
- **Exclusion**: `{ secret: 0, internal: 0 }` (exclude specified fields)
- **Mixed**: `{ _id: 0, name: 1, email: 1 }` (exclude _id, include others)

## How It Works

### Change Stream Processing
1. **Single Change Stream**: Monitors one change stream per upstream collection
2. **Document Routing**: Each change event is evaluated against all table filters
3. **Projection Application**: Documents are transformed before sending to Zero
4. **Multiple Deliveries**: One upstream change can generate multiple Zero table changes

### Initial Sync
1. **Dynamic Schema**: Table schemas are generated automatically for each configured table
2. **Filtered Snapshot**: Only documents matching filters are included in initial sync
3. **Projected Data**: Documents are transformed during snapshot loading

### Performance Considerations
- **Filter Efficiency**: Use indexed fields in filters for better performance
- **Projection Benefits**: Reduce network overhead and memory usage
- **Change Volume**: Multiple tables from one collection increases change events

## Limitations

- **Delete Operations**: Since deleted documents don't include the full document, delete events are sent to all tables from the same collection
- **Filter Complexity**: Complex filters with many operators may impact performance  
- **Schema Evolution**: Zero handles dynamic field addition, but initial schemas are minimal

## Migration from Legacy Format

To migrate from the legacy `publish` format:

**Before:**
```yaml
db:
  publish: ["users", "orders", "messages"]
```

**After:**
```yaml
db:
  tables:
    users:
      source: "users"
    orders:
      source: "orders"  
    messages:
      source: "messages"
```

## Error Handling

- **Invalid Filters**: Configuration validation happens at startup
- **Filter Evaluation Errors**: Logged as warnings, documents are excluded from matching tables
- **Projection Errors**: Logged as warnings, original document is used
- **Type Mismatches**: Zero handles dynamic schema evolution for type changes

## Examples

See the example configuration files:
- `config.example.yml` - Advanced table mappings with filters and projections
- `config.legacy.yml` - Legacy format for backward compatibility