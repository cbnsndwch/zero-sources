# @repo/eslint-config

## 0.4.0

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

## 0.3.1

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
