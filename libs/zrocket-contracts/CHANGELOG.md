# @cbnsndwch/zrocket-contracts

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

### Patch Changes

- Updated dependencies [[`db0043b`](https://github.com/cbnsndwch/zero-sources/commit/db0043b07893ab8e44fa7d11351f9584c899c16b)]:
    - @cbnsndwch/zero-contracts@0.2.0

## 0.1.0

### Minor Changes

- [`603241b`](https://github.com/cbnsndwch/zero-sources/commit/603241b66c3dc6e496a43f1b48c2eafad5b0a738) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - implement send message mutation

### Patch Changes

- Updated dependencies [[`603241b`](https://github.com/cbnsndwch/zero-sources/commit/603241b66c3dc6e496a43f1b48c2eafad5b0a738)]:
    - @cbnsndwch/zero-contracts@0.1.0

## 0.0.3

### Patch Changes

- [`4fd6292`](https://github.com/cbnsndwch/zero-sources/commit/4fd62923899cf3107266ce2228311e32ae029be7) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - Enhanced package documentation with comprehensive descriptions and README files
    - Updated package.json descriptions to be more detailed and informative
    - Added comprehensive README files for all library packages
    - Improved discoverability and understanding of package purposes
    - Added usage examples and feature highlights in documentation

- Updated dependencies [[`4fd6292`](https://github.com/cbnsndwch/zero-sources/commit/4fd62923899cf3107266ce2228311e32ae029be7)]:
    - @cbnsndwch/zero-contracts@0.0.3

## 0.0.2

### Patch Changes

- [`fea1fc1`](https://github.com/cbnsndwch/zero-sources/commit/fea1fc1dedaeaf87f9e528a7b0aa41b7dd4e0a1b) Thanks [@cbnsndwch](https://github.com/cbnsndwch)! - Setup Changesets for release management
    - Add @changesets/cli and @changesets/changelog-github
    - Configure Changesets with GitHub integration
    - Add GitHub Actions for automated releases
    - Remove individual changelogen scripts from packages
    - Add Changesets scripts to root package.json

- Updated dependencies [[`fea1fc1`](https://github.com/cbnsndwch/zero-sources/commit/fea1fc1dedaeaf87f9e528a7b0aa41b7dd4e0a1b)]:
    - @cbnsndwch/zero-contracts@0.0.2
