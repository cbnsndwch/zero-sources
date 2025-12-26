# @cbnsndwch/zero-contracts

## 0.9.0

### Minor Changes

- [`7dafbcd`](https://github.com/cbnsndwch/zero-sources/commit/7dafbcd9fa158a09c85d8011ca92abd659405074) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - update dependencies

## 0.8.0

### Minor Changes

- [#188](https://github.com/cbnsndwch/zero-sources/pull/188) [`b201ad7`](https://github.com/cbnsndwch/zero-sources/commit/b201ad7ff81715c3189bec416d320df69303ac5e) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - ### Dependency Updates

    Updated all packages to their latest versions:
    - **@rocicorp/zero**: `0.24.2025101500` → `0.24.3000000000`
    - **React ecosystem**: `react` and `react-dom` to `^19.2.0`, `react-router` to `^7.10.0`
    - **NestJS**: All `@nestjs/*` packages updated to `^11.1.9`, `@nestjs/swagger` to `^11.2.3`, `@nestjs/cli` to `^11.0.14`
    - **Build tools**: `vite` to `^7.2.6`, `esbuild` to `^0.27.0`, `tailwindcss` to `^4.1.17`, `vitest` to `^4.0.15`
    - **TypeScript tooling**: `@typescript-eslint/*` to `^8.48.1`, `@swc/core` to `^1.15.3`
    - **Other dependencies**: Various Radix UI components, `eslint` to `^9.39.1`, `prettier` to `^3.7.3`

    ### Code Quality Improvements
    - Fixed ESLint import order issues across multiple files in `apps/docs-vercel` and `apps/docs`
    - Improved TypeScript interface formatting for better readability
    - Fixed trailing comma consistency in configuration files
    - Added missing `await` keyword in `FeedbackController.submitFeedback()`
    - Added `reflect-metadata` import to vitest setup for proper decorator support
    - Simplified test files by removing unnecessary NestJS TestingModule boilerplate

    ### Repository Cleanup
    - Removed `.github/instructions/` directory containing outdated instruction files

## 0.7.0

### Minor Changes

- [`25fc632`](https://github.com/cbnsndwch/zero-sources/commit/25fc632442ae40b275ea4e8e7f41d484bbe54df4) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - # Pipeline-Based Table Mappings with Array Unwinding

    This release introduces a major new feature: **pipeline-based table mappings** that enable MongoDB-style array unwinding and transformations in Zero's change source system. This allows developers to declaratively map documents with nested arrays to flat Zero tables without custom change stream handling code.

    ## 🎯 Key Features

    ### Discriminated Union Architecture
    - Type-safe separation between simple and pipeline-based mappings
    - Compile-time prevention of mixing legacy `filter` and modern `pipeline` approaches
    - Full backward compatibility with existing simple table mappings

    ### Array Unwinding Support
    - `$unwind` pipeline stage for deconstructing arrays into separate rows
    - Support for `includeArrayIndex` to add array position tracking
    - Option to `preserveNullAndEmptyArrays` for flexible handling
    - Handles nested paths and complex array structures

    ### Pipeline Stages
    - **`$match`**: Filter documents with MongoDB query operators
    - **`$unwind`**: Deconstruct arrays into individual documents
    - **`$addFields`**: Add computed fields with expression support
    - **`$project`**: Reshape documents by selecting/transforming fields

    ### Array Diff Optimization
    - **Identity-based matching**: Match array elements by unique ID field (~200x performance improvement)
    - **Index-based fallback**: Position-based comparison when no identity field exists
    - Smart diffing generates minimal change events (UPDATE instead of DELETE+INSERT)
    - Deep equality checking for detecting actual content changes

    ### Helper Utilities
    - Stage builders: `match()`, `unwind()`, `addFields()`, `project()`
    - Fluent builder API via `PipelineMappingBuilder` for chainable construction
    - Migration helper: `toPipelineMapping()` to convert simple mappings
    - Type guards: `isPipelineMapping()`, `isSimpleMapping()`

    ## 📊 Performance Improvements

    **Array Updates**:
    - Without identity field: Updating 1 element in 100-element array = 200 events (100 DELETE + 100 INSERT)
    - With identity field: Updating 1 element in 100-element array = 1 event (1 UPDATE)
    - **~200x reduction in change events** for typical array update scenarios

    ## 🔧 Technical Implementation

    ### New Services

    #### PipelineExecutorService (`@cbnsndwch/zero-source-mongodb`)
    - Client-side pipeline execution with sequential stage processing
    - Expression evaluator supporting 10+ MongoDB operators ($concat, $eq, $add, etc.)
    - Path resolution utilities for nested field access

    #### ArrayDiffService (`@cbnsndwch/zero-source-mongodb`)
    - Computes differences between array versions
    - Supports both identity-based and index-based strategies
    - Null-safe handling with comprehensive edge case coverage

    ### Integration Points

    #### ChangeMakerV0 Updates
    - All CRUD operations (INSERT, UPDATE, REPLACE, DELETE) now support pipeline mappings
    - Runtime discrimination using type guards
    - Composite key extraction for pipeline-generated IDs
    - Optimized UPDATE operations using array diffing

    ## 📚 Documentation

    This release includes 3,700+ lines of comprehensive documentation:
    - **API Reference**: Complete type definitions and pipeline stages
    - **Usage Guide**: Real-world scenarios and best practices
    - **Migration Guide**: Step-by-step transition from simple to pipeline mappings
    - **Performance Guide**: Optimization strategies and benchmarks
    - **Implementation Plan**: 7-phase rollout with detailed technical specs

    ## 🧪 Testing

    Complete test coverage added:
    - **ArrayDiffService**: 21 tests covering identity/index-based matching and edge cases
    - **PipelineExecutorService**: 29 tests covering all 4 pipeline stages and composition
    - All tests passing (1 skipped due to known nested array path limitation)

    ## 🔄 Dependency Updates

    Updated multiple dependencies to latest stable versions:
    - **TypeScript & ESLint**: Latest compiler and linting tools
    - **NestJS**: Framework packages updated
    - **React Router**: v7.9.3 → v7.9.5
    - **Testing**: Playwright, Vitest, and related packages
    - **Build Tools**: SWC, Turbo, and toolchain updates
    - **UI/Styling**: Tailwind CSS, Framer Motion, Lucide icons
    - **Utilities**: Mongoose, lint-staged, dotenv, and more

    All builds and tests passing (132 passed | 77 skipped)

    ## 📖 Example Usage

    ```typescript
    import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

    // Unwind account members array into flat table
    const accountMembersMapping = pipelineBuilder<AccountMember>('accounts')
        .match({ bundle: 'ENTERPRISE' }) // Pre-filter for performance
        .unwind('$members') // Unwind members array
        .addFields({
            // Add computed fields
            accountId: '$_id',
            userId: '$members.id'
        })
        .project({
            // Shape final output
            _id: { $concat: ['$accountId', '_', '$userId'] },
            accountId: 1,
            userId: 1,
            role: '$members.role',
            name: '$members.name'
        })
        .build();
    ```

    ## 🔗 Breaking Changes

    None! This release maintains full backward compatibility. Existing simple table mappings continue to work without any changes required.

    ## 🎁 Benefits
    1. **Declarative Configuration**: Table mappings as pure configuration instead of imperative code
    2. **Type Safety**: Compile-time discrimination prevents configuration errors
    3. **Consistency**: Standard pattern across all table mappings
    4. **Reduced Complexity**: No custom change stream handling needed
    5. **Performance**: Intelligent array diffing minimizes change events
    6. **Extensibility**: New pipeline stages can be added without breaking existing code
    7. **Familiarity**: Pipeline stages match MongoDB aggregation operators developers already know
    8. **Maintainability**: Easier to understand, debug, and extend

    ## 📝 Migration Path

    Existing applications require no changes. To adopt pipeline features:
    1. Keep simple mappings for straightforward cases
    2. Use pipeline approach for array unwinding scenarios
    3. Leverage fluent builder API for readable configuration
    4. Add identity fields to array elements for optimal performance
    5. Refer to migration guide for step-by-step examples

## 0.6.1

### Patch Changes

- Updated dependencies across all packages:
    - **Build Tools**: Updated pnpm (10.18.0→10.20.0), rimraf, npm-check-updates, esbuild, vite
    - **NestJS Framework**: Updated all @nestjs/\* packages (^11.1.6→^11.1.8)
    - **TypeScript/ESLint**: Updated eslint (^9.37.0→^9.39.0), typescript-eslint (^8.45.0→^8.46.2), @types/node
    - **SWC Compiler**: Updated @swc/core (^1.13.5→^1.14.0)
    - **React Router & Types**: Updated React Router packages (^7.9.3→^7.9.5), React types (^19.2.0→^19.2.2)
    - **UI & Testing**: Updated mongoose, Tailwind CSS, Playwright, and various UI libraries
    - **Utilities**: Updated lint-staged (^16.2.3→^16.2.6), jsdom, dotenv, and other dev tools

    Protected zod from v4 upgrade by adding to reject list and ensuring all packages use ^3.x peerDependencies.

    All builds and tests passing (132 passed | 77 skipped).

## 0.6.0

### Minor Changes

- [`e90efab`](https://github.com/cbnsndwch/zero-sources/commit/e90efabecc15cb580bee297430c7419495d8aadd) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - update @rocicorp/zero to v0.24.2025101500

## 0.5.0

### Minor Changes

- [`169fd6e`](https://github.com/cbnsndwch/zero-sources/commit/169fd6ef3024d0cf46ff5fba6133f14b81104346) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - enhance DocumentPath and ProjectionOperator types with detailed descriptions and examples; implement resolveValue function for document path resolution

## 0.4.0

### Minor Changes

- [`4b7eecd`](https://github.com/cbnsndwch/zero-sources/commit/4b7eecd98bddc3e6623a98c5be2e235e05758ecb) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - enhance table mapping types with DocumentPath and ProjectionOperator

## 0.3.0

### Minor Changes

- [`2990951`](https://github.com/cbnsndwch/zero-sources/commit/29909512e6be5b1f2926e88576a04de8f637f456) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - allow zod ^3.21.4 as peer dependency

## 0.2.1

### Patch Changes

- [`479bb17`](https://github.com/cbnsndwch/zero-sources/commit/479bb171c858f05dc9ffce8943a51ba918097663) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - update synced-queries docs

## 0.2.0

### Minor Changes

- [`db0043b`](https://github.com/cbnsndwch/zero-sources/commit/db0043b07893ab8e44fa7d11351f9584c899c16b) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - # Synced Queries Architecture & Full NestJS Decorator Support

    This release implements a comprehensive synced-queries architecture with full NestJS parameter decorator support, major library refactoring, and enhanced application integration.

    ## 🏗️ Architecture Improvements

    ### @cbnsndwch/nest-zero-synced-queries

    **Breaking Changes:**
    - Complete package restructure with organized exports (`decorators/`, `services/`, `utils/`)
    - Renamed module files: `synced-queries.module.ts` → `module.ts`, `synced-queries.controller.ts` → `query.controller.ts`
    - Request bridge pattern: Controllers now pass full Express request objects instead of just user data

    **New Features:**
    - Full NestJS custom parameter decorator support (`@CurrentUser()`, `@Headers()`, etc.)
    - Parameter decorator execution utility for custom decorators created with `createParamDecorator()`
    - Enhanced query registry with decorator metadata extraction
    - Improved type safety and error handling throughout
    - New contracts.ts for shared types and interfaces

    **Improvements:**
    - Query transform service now accepts full request objects for better context
    - Registry service executes NestJS decorators properly with ExecutionContext
    - Better separation of concerns with organized exports

    ### @cbnsndwch/zero-contracts

    **Breaking Changes:**
    - Migrated all `.mts` files to `.ts` extensions
    - Updated package exports to use `.ts` extensions

    **Improvements:**
    - Consistent TypeScript configuration across the package
    - Updated tsup config for `.ts` extension support
    - Better package structure and maintainability

    ### @cbnsndwch/zero-nest-mongoose

    **Breaking Changes:**
    - Migrated all `.mts` files to `.ts` extensions
    - Updated package exports to use `.ts` extensions

    **Improvements:**
    - Consistent with other packages in the monorepo
    - Updated tsup configuration
    - Enhanced README documentation

    ### @cbnsndwch/zero-watermark-nats-kv

    **Breaking Changes:**
    - Migrated all `.mts` files to `.ts` extensions
    - Updated package exports to use `.ts` extensions

    **Improvements:**
    - All service and test files now use `.ts` extension
    - Updated tsup configuration
    - Consistent module exports

    ### @cbnsndwch/zero-watermark-zqlite

    **Breaking Changes:**
    - Migrated all `.mts` files to `.ts` extensions
    - Updated package exports to use `.ts` extensions

    **Improvements:**
    - All service and test files now use `.ts` extension
    - Updated tsup configuration
    - Better module structure

    ### @cbnsndwch/zero-source-mongodb

    **New Features:**
    - Integrated with `@cbnsndwch/nest-zero-synced-queries`
    - Enhanced change-maker with improved filtering capabilities
    - Better table mapping service for synced queries

    **Improvements:**
    - Updated protocol contracts with consistent types
    - Enhanced zero-pusher-auth guard
    - Improved type safety throughout the library
    - Better error handling and validation

    ### @cbnsndwch/zero-source-mongodb-server

    **New Features:**
    - Full integration with `@cbnsndwch/nest-zero-synced-queries` module
    - Synced queries added to feature exports
    - Enhanced OpenAPI schema integration

    **Improvements:**
    - Updated global modules configuration
    - Enhanced TypeScript configuration
    - Better service organization

    ### @cbnsndwch/zrocket (Application)

    **New Features:**
    - Full integration with new synced-queries architecture
    - Implemented query handlers: `myChats`, `myGroups`, `channelById`
    - Dev login shortcuts in user menu (development mode only)
    - Cookie-based authentication in dev login controller

    **Improvements:**
    - Refactored layout components for synced queries
    - Enhanced room preference utilities
    - Simplified empty chat and room list components
    - Better room management throughout the app
    - Updated controllers to use `@SyncedQuery` decorator

    ### @cbnsndwch/zrocket-contracts

    **New Features:**
    - Added `channelById` query context
    - Enhanced user schema with subscription fields

    **Breaking Changes:**
    - Room type enum now uses `RoomType` prefix for consistency

    **Improvements:**
    - Updated permissions for new query handlers
    - Better type definitions throughout

    ### @repo/eslint-config

    **Improvements:**
    - Updated configuration to allow TS/JS mixing for decorator metadata
    - Better support for NestJS decorator patterns

    ## 📚 Documentation
    - Added parameter decorator implementation summary
    - Added request bridge refactor documentation
    - Added overall architecture refactor summary
    - Migration guides and examples provided
    - Benefits and usage patterns documented

    ## 🔄 Migration Guide

    ### For Library Consumers
    1. **Update imports from `.mts` to `.ts`:**

        ```typescript
        // Before
        import { something } from '@cbnsndwch/zero-contracts/index.mts';

        // After
        import { something } from '@cbnsndwch/zero-contracts';
        ```

    2. **Update synced-queries imports:**

        ```typescript
        // Before
        import { SyncedQueriesModule } from '@cbnsndwch/nest-zero-synced-queries';

        // After
        import { SyncedQueriesModule } from '@cbnsndwch/nest-zero-synced-queries';
        // Module name unchanged, but internal structure improved
        ```

    3. **Update decorator usage:**
        ```typescript
        // Controllers now automatically support NestJS parameter decorators
        @SyncedQuery('myQuery', z.tuple([]))
        async myQuery(@CurrentUser() user: JwtPayload): Promise<AST> {
          // user is now properly populated via @CurrentUser decorator
          return /* your query AST */;
        }
        ```

    ### For Application Developers
    1. **Room type enum prefix:**

        ```typescript
        // Before
        import { RoomType } from '@cbnsndwch/zrocket-contracts';
        const type = RoomType.PublicChannel;

        // After (unchanged in usage, but internally improved)
        import { RoomType } from '@cbnsndwch/zrocket-contracts';
        const type = RoomType.PublicChannel;
        ```

    ## ✅ Testing
    - All builds pass successfully
    - All linters pass without errors
    - All tests pass (104 passed, 75 skipped)
    - Code formatting verified with Prettier

    ## 🔗 Related
    - Implements full NestJS decorator support for synced queries
    - Closes #80
    - PR #116

## 0.1.0

### Minor Changes

- [`603241b`](https://github.com/cbnsndwch/zero-sources/commit/603241b66c3dc6e496a43f1b48c2eafad5b0a738) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - implement send message mutation

## 0.0.3

### Patch Changes

- [`4fd6292`](https://github.com/cbnsndwch/zero-sources/commit/4fd62923899cf3107266ce2228311e32ae029be7) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - Enhanced package documentation with comprehensive descriptions and README files
    - Updated package.json descriptions to be more detailed and informative
    - Added comprehensive README files for all library packages
    - Improved discoverability and understanding of package purposes
    - Added usage examples and feature highlights in documentation

## 0.0.2

### Patch Changes

- [`fea1fc1`](https://github.com/cbnsndwch/zero-sources/commit/fea1fc1dedaeaf87f9e528a7b0aa41b7dd4e0a1b) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - Setup Changesets for release management
    - Add @changesets/cli and @changesets/changelog-github
    - Configure Changesets with GitHub integration
    - Add GitHub Actions for automated releases
    - Remove individual changelogen scripts from packages
    - Add Changesets scripts to root package.json
