# Developer Instructions

## Role Overview

As a **Developer** in the zero-sources project, you are responsible for implementing features, maintaining code quality, and ensuring the technical integrity of our TypeScript-based monorepo. You work within our distributed three-container architecture to build scalable, reusable change source implementations, real-time synchronization infrastructure, and demo applications for Zero Sync.

## Core Responsibilities

### 1. Code Implementation

- **Feature Development**: Implement user stories and technical requirements according to specifications
- **Bug Fixes**: Diagnose and resolve defects in existing functionality
- **Code Reviews**: Review pull requests from other team members and provide constructive feedback
- **Refactoring**: Improve code structure and maintainability while preserving functionality

### 2. Technical Design & Architecture

- **Change Source Design**: Design and implement MongoDB-to-Zero change streaming with discriminated unions
- **Schema Configuration**: Create and maintain Zero schema definitions and table mappings
- **WebSocket Streaming**: Implement real-time change propagation via WebSocket protocols
- **UI Components**: Build reusable React components for demo applications showcasing Zero capabilities

### 3. Code Quality & Standards

- **Testing**: Write comprehensive unit, integration, and end-to-end tests using Vitest and Playwright
- **Type Safety**: Leverage TypeScript effectively for type safety across the codebase
- **Documentation**: Document code, APIs, and architectural decisions
- **Performance**: Optimize code for performance and scalability

## Repository Technical Context

### Monorepo Structure

Our codebase is organized as a Turborepo monorepo with pnpm workspaces:

```
├── apps/                   # Custom change source servers and demo applications
├── libs/                   # Shared Zero contracts, utilities, and watermark implementations
├── tools/                  # Development, testing, and monitoring utilities
├── docs/                   # Architecture and project documentation
└── .docker/                # Docker and deployment configurations
```

### Technology Stack

**Change Source Infrastructure:**

- NestJS for change source servers
- MongoDB with Mongoose ODM and change streams
- WebSocket Gateway for real-time streaming
- Discriminated union support for polymorphic collections

**Demo Applications:**

- React Router 7 with SSR and Vite
- TypeScript for type safety
- Rocicorp Zero for client-side caching and sync
- React with modern build tooling

**Development:**

- Turborepo for build caching and task orchestration
- pnpm for package management
- Vitest for testing
- Playwright for E2E testing
- ESLint and Prettier for code quality

### Three-Container Architecture

Follow these patterns when working with our distributed architecture:

1. **Change Source Servers**: Reusable MongoDB-to-Zero change streaming in `apps/source-mongodb-server/`
2. **Demo Applications**: Full-stack applications showcasing Zero capabilities in `apps/zrocket/`
3. **Shared Libraries**: Zero contracts, utilities, and watermark implementations in `libs/` folder
4. **Independent Deployment**: Each container (change source, Zero cache, application) deploys and scales independently
5. **Schema Configuration**: Dynamic schema loading from files, URLs, or APIs enables application-agnostic change sources

### Application Structure Pattern

**CRITICAL**: Applications and libraries MUST follow these architectural patterns:

#### Change Source Server Structure (`apps/source-mongodb-server/`)

```
apps/source-mongodb-server/src/
├── features/
│   ├── change-source/              # Core change streaming functionality
│   │   ├── change-source.service.ts
│   │   ├── change-source.gateway.ts  # WebSocket gateway
│   │   └── change-source.module.ts
│   ├── schema/                     # Dynamic schema configuration
│   │   ├── schema-loader.service.ts
│   │   ├── table-mappings.service.ts
│   │   └── schema.module.ts
│   └── metadata/                   # Metadata and observability
│       ├── metadata.service.ts
│       ├── metadata.controller.ts
│       └── metadata.module.ts
├── config/                         # Configuration files
│   ├── config.yml                  # Schema and mapping configuration
│   └── app.config.ts
└── main.ts                         # Application bootstrap
```

#### Demo Application Structure (`apps/zrocket/`)

```
apps/zrocket/
├── app/                            # React Router 7 application
│   ├── routes/                     # Route components
│   ├── components/                 # React components
│   └── lib/                        # Client utilities
├── src/                            # NestJS backend
│   ├── features/                   # Business logic features
│   │   ├── messages/
│   │   ├── rooms/
│   │   └── users/
│   ├── schema/                     # Zero schema export API
│   └── main.ts
└── build/                          # SSR build output
```

#### Library Structure (`libs/[library-name]/`)

```
libs/[library-name]/
├── src/
│   ├── schemas/                    # Zero schema definitions
│   ├── types/                      # TypeScript type definitions
│   ├── utils/                      # Utility functions
│   └── index.ts                    # Public API exports
├── package.json
├── tsconfig.json
└── README.md
```

#### Key Architectural Principles

1. **Schema-First Design**: Define Zero schemas using TableSchema

    ```typescript
    // libs/zrocket-contracts/src/schema/message.schema.ts
    import { createTableSchema } from '@rocicorp/zero';

    export const messageSchema = createTableSchema({
      tableName: 'message',
      columns: {
        id: { type: 'string' },
        roomId: { type: 'string' },
        content: { type: 'string' },
        createdAt: { type: 'number' },
      },
      primaryKey: ['id'],
      relationships: {
        room: {
          sourceField: ['roomId'],
          destSchema: () => roomSchema,
          destField: ['id'],
        },
      },
    });
    ```

2. **Change Source Services**: Stream MongoDB changes to Zero protocol

    ```typescript
    @Injectable()
    export class ChangeSourceService {
        constructor(
            @InjectModel('Message') private messageModel: Model<MessageDocument>
        ) {}

        async streamChanges(sink: ChangeStreamSink): Promise<void> {
            const changeStream = this.messageModel.watch();
            
            for await (const change of changeStream) {
                await sink.pushChange(this.convertToZeroChange(change));
            }
        }
    }
    ```

3. **WebSocket Gateway**: Expose change streams via WebSocket

    ```typescript
    @WebSocketGateway()
    export class ChangeSourceGateway {
        @SubscribeMessage('changes/v0/stream')
        handleChangeStream(client: Socket, payload: StreamRequest) {
            return this.changeSourceService.streamChanges(
                new WebSocketSink(client)
            );
        }
    }
    ```

4. **Discriminated Unions**: Handle polymorphic collections

    ```typescript
    // Table mapping for discriminated union
    const tableMappings = {
      'content:announcement': {
        collection: 'content',
        filter: { type: 'announcement' },
        fields: { id: '_id', title: 'title', body: 'body' }
      },
      'content:event': {
        collection: 'content',
        filter: { type: 'event' },
        fields: { id: '_id', title: 'title', eventDate: 'eventDate' }
      }
    };
    ```

4. **Clean Imports**: Folder-based imports for organization

    ```typescript
    // ✅ Good - organized by concern
    import { User } from '../entities/user.entity.js';
    import { UserService } from '../services/user.service.js';
    import { CreateUserDto } from '../dto/user.dto.js';

    // ❌ Bad - everything from root
    import { User, UserService, CreateUserDto } from '../index.js';
    ```

5. **Export Structure**: Logical grouping in index files

    ```typescript
    // entities/index.ts
    export { User, UserSchema, type UserDocument } from './user.entity.js';

    // services/index.ts
    export * from './user.service.js';

    // Main index.ts
    export * from './entities/index.js';
    export * from './services/index.js';
    export { UserModule } from './user.module.js';
    ```

## Development Workflows

### Getting Started

1. **Environment Setup**:

    ```bash
    # Install dependencies
    pnpm install

    # Set up environment variables
    cp .env.example .env
    # Edit .env file with your configuration

    # Start development
    pnpm dev
    ```

2. **Development Commands**:

    ```bash
    # Build everything
    pnpm build

    # Testing
    pnpm test               # Run all tests
    pnpm lint               # Lint code
    pnpm format             # Format code
    ```

### Feature Development Process

1. **Branch Creation**: Create feature branches from `main`
2. **Implementation**: Follow feature-based architecture principles
3. **Testing**: Write tests before or alongside implementation
4. **Code Review**: Submit PR for team review
5. **Integration**: Ensure CI/CD pipeline passes
6. **Deployment**: Coordinate with DevOps for deployment

### Testing Strategy

**Unit Tests:**

- Test individual functions and classes
- Mock external dependencies
- Aim for high code coverage on business logic

**Integration Tests:**

- Test component interactions
- Test database operations
- Test API endpoints

**End-to-End Tests:**

- Test complete user workflows
- Use Playwright for browser automation
- Focus on critical user paths

### Feature Implementation Checklist

When creating or modifying a feature domain, ensure you follow this checklist:

#### ✅ Entities Layer

- [ ] Create consolidated entity classes with `@Schema`, `@ObjectType`, and validation decorators
- [ ] Implement domain contracts (e.g., `implements IUser`)
- [ ] Add domain methods (`fromData()`, `toData()`, helper methods)
- [ ] Export entities, schemas, and types from `entities/index.ts`
- [ ] Add appropriate MongoDB indexes in schema definition

#### ✅ Services Layer

- [ ] Implement business logic in `@Injectable` services
- [ ] Use dependency injection for repositories and utilities
- [ ] Keep services focused on single responsibility
- [ ] Write unit tests for all service methods
- [ ] Export services from `services/index.ts`

#### ✅ Controllers Layer

- [ ] Create thin controllers that delegate to services
- [ ] Use proper HTTP status codes and response formats
- [ ] Apply appropriate guards and decorators
- [ ] Validate inputs with DTOs
- [ ] Export controllers from `controllers/index.ts`

#### ✅ DTOs Layer

- [ ] Create input DTOs using `@InputType` for GraphQL
- [ ] Extend or pick from entities using `PickType`, `OmitType`
- [ ] Add appropriate validation decorators
- [ ] Export DTOs from `dto/index.ts`

#### ✅ Module Configuration

- [ ] Configure `@Module` with proper imports, providers, exports
- [ ] Register Mongoose schemas in `MongooseModule.forFeature()`
- [ ] Export module from main feature index
- [ ] Ensure proper dependency injection setup

#### ✅ GraphQL Integration (if applicable)

- [ ] Create resolvers using `@Resolver`, `@Query`, `@Mutation`
- [ ] Use entity classes directly as GraphQL types
- [ ] Implement proper error handling
- [ ] Export resolvers from `resolvers/index.ts`

### Quick Start: Creating a New Feature Domain

```bash
# 1. Create feature structure
mkdir -p features/[feature-name]/domain/src/{entities,services,controllers,dto,guards,strategies,decorators,resolvers}

# 2. Create index files
touch features/[feature-name]/domain/src/{entities,services,controllers,dto,guards,strategies,decorators,resolvers}/index.ts

# 3. Copy and adapt from features/auth/domain/src/ structure (GOLD STANDARD)
```

#### At a Glance - Key Patterns

**Consolidated Entity**: `@Schema() @ObjectType() export class User { @Prop() @Field() @IsEmail() email!: string; }`
**Service**: `@Injectable() export class UserService { async create(dto) { /* business logic */ } }`  
**Controller**: `@Controller() export class UserController { constructor(private service: UserService) {} }`
**Imports**: `import { User } from '../entities/user.entity.js'` (folder-based)
**Exports**: `entities/index.ts` exports entities, `services/index.ts` exports services, etc.

### Common Patterns

#### Entity Pattern (Consolidated Model)

```typescript
// entities/example.entity.ts
@Schema({ timestamps: true })
@ObjectType('Example')
export class Example implements IExample {
    @Prop({ unique: true }) @Field() @IsEmail()  // unique: true creates index
    email!: string;

    @Prop() @Field() @IsString()
    name!: string;

    @Prop() // Internal only - no @Field
    internalData!: string;

    static fromData(data: IExample): Example { ... }
    toData(): IExample { ... }
}

export const ExampleSchema = SchemaFactory.createForClass(Example);

// Add additional indexes (avoid duplicating @Prop indexes)
// Note: Don't add .index() for fields that already have unique: true or index: true
ExampleSchema.index({ createdAt: -1 }); // Additional indexes only
```

**⚠️ Important**: Avoid duplicate indexes! If you use `unique: true` or `index: true` in `@Prop()`, don't add the same index with `schema.index()`.

#### Service Pattern (Business Logic)

```typescript
// services/example.service.ts
@Injectable()
export class ExampleService {
    constructor(
        @InjectModel(Example.name) private model: Model<ExampleDocument>
    ) {}

    async create(dto: CreateExampleDto): Promise<Example> { ... }
}
```

#### Controller Pattern (HTTP Layer)

```typescript
// controllers/example.controller.ts
@Controller('examples')
export class ExampleController {
    constructor(private service: ExampleService) {}

    @Post()
    create(@Body() dto: CreateExampleDto) {
        return this.service.create(dto);
    }
}
```

## Code Standards & Best Practices

### UI Component Standards

**shadcn/ui Component Library**: The workspace uses a standardized component library based on shadcn/ui. This ensures consistency, better performance, and alignment with our Tailwind CSS design system.

### TypeScript Guidelines

1. **Strict Type Safety**: Use strict TypeScript configuration
2. **Interface Segregation**: Create focused, cohesive interfaces
3. **Generic Types**: Leverage generics for reusable components
4. **Utility Types**: Use TypeScript utility types effectively

```typescript
// Good: Strict typing with clear interfaces
interface UserRepository {
    findById(id: string): Promise<User | null>;
    create(userData: CreateUserDto): Promise<User>;
    update(id: string, updates: Partial<User>): Promise<User>;
}

// Good: Generic types for reusability
interface ApiResponse<T> {
    data: T;
    meta: {
        total: number;
        page: number;
    };
}
```

### React/Frontend Guidelines

1. **Component Structure**: Use functional components with hooks
2. **State Management**: Use React Router 7 loaders/actions for data
3. **Real-time Updates**: Integrate Rocicorp Zero for live data
4. **Error Boundaries**: Implement proper error handling

```typescript
// Good: Functional component with proper typing
interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const user = useZero(queries.user.byId(userId));

  if (!user) return <LoadingSpinner />;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### UI Component Guidelines

**Available shadcn/ui Components in support-ui:**

### Backend/NestJS Guidelines

1. **Module Organization**: Organize code into focused modules
2. **Dependency Injection**: Use NestJS DI container effectively
3. **GraphQL Federation**: Structure subgraphs appropriately
4. **Database Patterns**: Use repository pattern with Mongoose

```typescript
// Good: NestJS service with proper DI
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private readonly logger: Logger
    ) {}

    async findById(id: string): Promise<User | null> {
        try {
            return await this.userModel.findById(id).exec();
        } catch (error) {
            this.logger.error(`Failed to find user ${id}`, error);
            throw new NotFoundException('User not found');
        }
    }
}
```

### Database Guidelines

1. **Schema Design**: Design flexible, scalable MongoDB schemas
2. **Indexing**: Create appropriate indexes for query performance
3. **Validation**: Use Mongoose schema validation
4. **Migrations**: Handle schema changes gracefully

```typescript
// Good: Well-structured Mongoose schema
@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' })
    organizationId: mongoose.Types.ObjectId;

    @Prop({ type: Map, of: mongoose.Schema.Types.Mixed })
    settings: Map<string, any>;
}
```

## Security Considerations

### Authentication & Authorization

1. **JWT Tokens**: Implement secure token handling
2. **Role-Based Access**: Use CASL for permissions
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement appropriate rate limits

### Data Protection

1. **Sensitive Data**: Never log sensitive information
2. **Environment Variables**: Use .env files for environment-specific configuration (never commit .env files)
3. **HTTPS**: Ensure all communications are encrypted
4. **Database Security**: Use MongoDB security best practices

## Performance Guidelines

### Frontend Performance

1. **Code Splitting**: Use dynamic imports for large components
2. **Lazy Loading**: Load data and components as needed
3. **Caching**: Leverage Rocicorp Zero's caching capabilities
4. **Bundle Size**: Monitor and optimize bundle sizes

### Backend Performance

1. **Database Queries**: Optimize MongoDB queries and aggregations
2. **Caching**: Implement appropriate caching strategies
3. **GraphQL**: Use DataLoader for N+1 query prevention
4. **Background Jobs**: Use queues for heavy processing

## Error Handling & Monitoring

### Error Handling

1. **Graceful Degradation**: Handle errors without breaking user experience
2. **Error Boundaries**: Implement React error boundaries
3. **API Errors**: Return consistent error responses
4. **Logging**: Log errors with appropriate context

### Monitoring & Observability

1. **Telemetry**: Use our telemetry API for metrics collection
2. **Performance Monitoring**: Track key performance metrics
3. **Error Tracking**: Monitor and alert on application errors
4. **Health Checks**: Implement service health endpoints

## Deployment & DevOps Integration

### CI/CD Pipeline

1. **Build Process**: Ensure builds pass in CI
2. **Test Automation**: All tests must pass before merge
3. **Code Quality**: Meet linting and formatting standards
4. **Security Scanning**: Pass security vulnerability scans

### Environment Management

1. **Environment Parity**: Maintain consistency across environments
2. **Configuration**: Use environment variables for environment-specific config
3. **Database Migrations**: Handle data migrations safely
4. **Feature Flags**: Implement feature flags as needed

## Communication & Collaboration

### Code Reviews

1. **Constructive Feedback**: Provide helpful, specific feedback
2. **Knowledge Sharing**: Share learnings and best practices
3. **Security Focus**: Review for security vulnerabilities
4. **Performance Impact**: Consider performance implications

### Documentation

1. **Code Comments**: Comment complex business logic
2. **API Documentation**: Keep GraphQL schema documentation current
3. **Architecture Decisions**: Document significant technical decisions
4. **Changelog**: Update changelogs for significant changes

## Success Metrics

Your effectiveness as a Developer will be measured by:

1. **Code Quality**: Maintainable, well-tested, secure code
2. **Feature Delivery**: Timely delivery of working features
3. **Bug Resolution**: Quick resolution of defects
4. **Team Collaboration**: Effective code reviews and knowledge sharing
5. **Technical Excellence**: Following best practices and improving system architecture
6. **User Impact**: Features that provide real value to end users

## Continuous Learning

Stay current with:

- TypeScript and React Router 7 updates
- NestJS and GraphQL federation best practices
- MongoDB and Mongoose optimization techniques
- Rocicorp Zero capabilities and patterns
- Security best practices for web applications
- Performance optimization techniques
