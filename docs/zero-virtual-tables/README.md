# RFC: Dynamic Zero tables from Upstream Projections

### Problem Statement

Currently, Zero sync requires a 1:1 mapping between Zero schema tables and upstream data entities (MongoDB collections, SQL tables, API endpoints). This creates limitations when:

1. **Multiple logical tables share an entity**: A single upstream entity contains records that represent different entity types (discriminated by a field like `type` or `kind`)
2. **Filtered views are needed**: You want to expose only a subset of records from an upstream entity as a Zero table
3. **Data transformation is required**: The upstream data structure needs to be projected/transformed before being exposed to the Zero Sync server
4. **Complex business logic**: Different filtering and projection rules need to be applied based on record characteristics

### Proposed Solution

Introduce a **discriminated union system** that allows:

1. **Entity Mapping**: Map multiple Zero schema tables to the same upstream data entity
2. **Optional Filtering**: Apply source-specific filter queries to determine which records belong to which Zero table
3. **Optional Projection**: Transform record structure before streaming to the Zero Sync server
4. **Change Intelligence**: The change source monitors upstream changes and routes them to appropriate Zero tables based on the configuration

### Configuration Schema

```typescript
interface UpstreamTableMapping {
  source: string;              // Upstream entity identifier (collection, table, endpoint)
  filter?: object;             // Optional source-specific filter query
  projection?: object;         // Optional source-specific projection
}

interface ZeroSchemaConfig {
  tables: {
    [zeroTableName: string]: UpstreamTableMapping;
  };
}
```

### Example Use Cases

#### Use Case 1: MongoDB - Discriminated Union by Document Type
```typescript
// Single 'entities' collection contains users, organizations, and projects
const mongoConfig = {
  tables: {
    users: {
      source: 'entities',
      filter: { entityType: 'user', isActive: true },
      projection: { _id: 1, name: 1, email: 1, createdAt: 1 }
    },
    organizations: {
      source: 'entities', 
      filter: { entityType: 'organization', isDeleted: { $ne: true } },
      projection: { _id: 1, name: 1, domain: 1, memberCount: 1 }
    },
    projects: {
      source: 'entities',
      filter: { entityType: 'project', status: { $in: ['active', 'paused'] } },
      projection: { _id: 1, name: 1, organizationId: 1, status: 1 }
    }
  }
};
```

#### Use Case 2: SQL Database - Table Views with Conditions
```typescript
// Single 'orders' table with different time-based views
const sqlConfig = {
  tables: {
    recentOrders: {
      source: 'orders',
      filter: { 
        created_at: { $gte: '30 days ago' },
        status: { $not: 'cancelled' }
      },
      projection: { id: 1, user_id: 1, total: 1, status: 1, created_at: 1 }
    },
    archivedOrders: {
      source: 'orders',
      filter: { 
        created_at: { $lt: '1 year ago' }
      },
      projection: { id: 1, user_id: 1, total: 1, archived_at: 1 }
    }
  }
};
```

#### Use Case 3: API Endpoint - Role-Based Data Access
```typescript
// External API with role-based filtering
const apiConfig = {
  tables: {
    publicUserProfiles: {
      source: '/api/users',
      filter: { isPublic: true, isActive: true },
      projection: { id: 1, displayName: 1, avatar: 1, bio: 1 }
    },
    adminUserData: {
      source: '/api/users',
      filter: { isActive: true },
      projection: { 
        id: 1, email: 1, displayName: 1, isActive: 1, 
        lastLoginAt: 1, createdAt: 1, permissions: 1 
      }
    }
  }
};
```

### Technical Implementation Considerations

#### Change Processing
1. **Single Change Stream**: Monitor one change stream per upstream entity, not per Zero table
2. **Record Routing**: For each change event, determine which Zero tables are affected by applying filters
3. **Projection Application**: Apply table-specific projections before sending to Zero
4. **Efficient Filtering**: Use source-specific optimization (e.g., MongoDB aggregation pipeline, SQL indexes)

#### Performance Implications
1. **Filter Efficiency**: Complex filters might impact change processing performance
2. **Projection Benefits**: Projections reduce network payload and client memory usage
3. **Index Requirements**: Filters should be backed by appropriate indexes in the upstream source
4. **Change Volume**: Multiple Zero tables from one upstream entity increases change event volume

#### Error Handling
1. **Filter Validation**: Validate filter syntax at configuration time
2. **Projection Validation**: Ensure projections don't break Zero schema expectations
3. **Graceful Degradation**: Handle cases where filters or projections fail

### Benefits

1. **Flexibility**: Support complex upstream data structures in Zero across multiple source types
2. **Performance**: Reduce data transfer through projections and filtering at the source
3. **Security**: Apply data access controls at the change source level
4. **Maintainability**: Keep upstream schemas flexible while providing clean Zero interfaces
5. **Scalability**: Handle large datasets by filtering at the source before streaming to Zero

### Risks and Mitigation

#### Risk 1: Complex Configuration
- **Mitigation**: Provide clear examples, validation, and potentially a configuration UI

#### Risk 2: Performance Impact
- **Mitigation**: Profile change processing performance across different source types, provide guidance on filter optimization

#### Risk 3: Data Consistency
- **Mitigation**: Ensure atomic operations and proper error handling during filtering/projection across all source types

#### Risk 4: Debugging Complexity
- **Mitigation**: Comprehensive logging and debugging tools for tracing document flow

### Questions for Validation

1. **Use Cases**: Are there other important use cases this doesn't cover?
2. **Configuration**: Is the proposed configuration schema intuitive and flexible enough?
3. **Performance**: What are the expected performance characteristics with complex filters across different source types?
4. **Migration**: How would existing Zero setups migrate to this approach?
5. **Testing**: What testing strategies ensure correctness of filter/projection logic across multiple source types?
6. **Observability**: What metrics and logging are needed for production debugging across different sources?

### Next Steps

1. **Prototype Implementation**: Build a minimal working version with basic filter/projection support
2. **Performance Testing**: Benchmark change processing performance with various filter complexities across source types
3. **API Design**: Finalize the configuration schema and validation logic
4. **Documentation**: Create comprehensive guides and examples for MongoDB, SQL, and API sources
5. **Migration Path**: Design upgrade path for existing change sources

