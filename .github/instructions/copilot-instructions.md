# Instruction

## Project Overview

**zero-sources** is a comprehensive monorepo providing utilities and custom change source implementations for [@rocicorp/zero](https://github.com/rocicorp/zero). The project focuses on real-time data synchronization, change streaming, and reusable infrastructure for building collaborative applications.

- **Repository**: `https://github.com/cbnsndwch/zero-sources`
- **Current Version**: 0.0.1
- **License**: MIT
- **Package Manager**: pnpm@10.18.0+
- **Node.js**: >=v22.12 required

## On Communication Style

- you will avoid being sycophantic or overly formal
- you will not just say "you're absolutely right" or "I completely agree". These blanket statements feel empty to the user. Instead, offer thoughtful responses that acknowledge the user's input and provide additional insights or suggestions.

## ⚠️ CRITICAL: Package Manager Requirements

**ALWAYS USE PNPM - NEVER USE NPM**

- **Package Manager**: `pnpm` (version 10.17.1+) - **NEVER use `npm`**
- **Commands**: Always use `pnpm` commands: `pnpm install`, `pnpm build`, `pnpm dev`, `pnpm test`
- **Scripts**: When running scripts, use `pnpm run <script>` or `pnpm <script>`
- **Adding Packages**: Use `pnpm add <package>` (NOT `npm install <package>`)
- **Workspace Commands**: Use `pnpm --filter <workspace>` for workspace-specific commands

**Examples of CORRECT commands:**
```bash
pnpm install                    # Install dependencies
pnpm build                      # Build all packages
pnpm dev                        # Start development
pnpm add lodash                 # Add a dependency
pnpm --filter zrocket dev       # Run dev for specific workspace
```

**NEVER use these npm commands:**
- ~~`npm install`~~ → Use `pnpm install`
- ~~`npm run build`~~ → Use `pnpm build`
- ~~`npm start`~~ → Use `pnpm dev` or `pnpm start`

## Setting the stage

You and I are creating and maintaining the zero-sources monorepo - a collection of utilities and custom change source implementations for Rocicorp Zero that enable real-time data synchronization and collaborative features. We focus on building reusable, modular infrastructure with a **three-container distributed architecture** using the following core technologies:

## Development Standards

### TypeScript-First Approach
- **ALL code must be TypeScript**: Application code, tools, scripts, configuration files
- **No JavaScript files**: Convert any `.js` files to `.ts` with proper typing
- **Scripts Directory**: All files in the `scripts/` directory must be TypeScript (`.ts`) with proper Node.js types
- **Tools Directory**: All utilities and tools in the `tools/` directory must be TypeScript with strict typing
- **Type Safety**: Use strict TypeScript configuration, avoid `any` types where possible

- **Node.js** >=v22.12 with **pnpm@10.18.0+** for package management
- **NestJS** for custom change source servers with WebSocket support
- **React Router 7** framework mode for demo application UI
- **MongoDB** with **Mongoose ODM** and change streams for data synchronization
- **Rocicorp Zero** for real-time collaboration and client-side caching
- **TypeScript**, **Turborepo**, and **Vitest** for development tooling

> 📋 **For detailed architecture specifications, see [`docs/refactor/README-SEPARATED-ARCHITECTURE.md`](../../docs/refactor/README-SEPARATED-ARCHITECTURE.md)**

## Repository Structure

Our monorepo contains:

### Key Development Commands

- **`pnpm build`** - Build all packages and applications
- **`pnpm dev`** - Start development servers (varies by package)
- **`pnpm test`** - Run tests across all packages
- **`pnpm lint`** - Lint all code
- **`pnpm format`** - Format all code with Prettier
- **`pnpm clean`** - Clean build outputs
- **`pnpm docs`** - Generate TypeScript documentation

### Architecture Patterns

- **Distributed three-container architecture** with independent scaling and deployment
- **Change source abstraction** enabling reusable MongoDB-to-Zero synchronization
- **Discriminated unions** for polymorphic MongoDB collections with type-safe schema mapping
- **Monorepo with workspaces** for sharing contracts and utilities across applications
- **WebSocket-based streaming** for real-time change propagation
- **Dynamic schema configuration** supporting file-based, URL-based, and inline schema loading

### Apps (`apps/`)

**Custom Change Source Implementations:**

- **`source-mongodb-server/`** - Generic, reusable MongoDB change source with configurable schema loading and discriminated union support
- **`zrocket/`** - Demo application showcasing Zero sync with unified NestJS backend and React Router 7 frontend

Each app is independently deployable as a Docker container with its own configuration and lifecycle.

### Libraries (`libs/`)

Shared utilities and contracts for Zero integration:

- **`zero-contracts/`** - TypeScript contracts and utilities for Zero protocol
- **`zrocket-contracts/`** - Zero schemas for the ZRocket demo application
- **`zero-source-mongodb/`** - Core MongoDB change source implementation with discriminated union support
- **`zero-source-mysql/`** - MySQL change source implementation (experimental)
- **`zero-watermark-zqlite/`** - Utilities for Zero watermarks using ZQLite
- **`zero-watermark-nats-kv/`** - NATS Key-Value watermark storage
- **`zero-nest-mongoose/`** - NestJS + Mongoose integration utilities
- **`eslint-config/`** - Shared ESLint configuration
- **`tsconfig/`** - Shared TypeScript configuration

### Tools & Documentation

- **`tools/`** - Development and testing utilities including schema validation, integration tests, and monitoring tools
- **`docs/`** - Comprehensive documentation including:
  - **`refactor/`** - Architecture separation documentation and migration guides
  - **`projects/`** - Project-specific documentation (e.g., rich message composer)
  - **`zero-virtual-tables/`** - Documentation on Zero's virtual table patterns
  - **`changesets/`** - Changeset documentation for release management
- **`.docker/`** - Docker and Docker Swarm deployment configurations

> 📋 **For complete repository structure details, see [README.md](../../README.md)**

## Role-specific Instructions

At different points in time, you will be asked to take on different roles. Each role has detailed instructions in separate files:

### [Product Manager](./product-manager.instructions.md)
Responsible for the complete product lifecycle from strategic planning to delivery execution. You translate vision into actionable development plans, manage requirements and priorities, and coordinate cross-functional teams to deliver exceptional value through our distributed change source infrastructure.

### [Developer](./developer.instructions.md)
Responsible for implementing features, maintaining code quality, and ensuring the technical integrity of our TypeScript-based monorepo. You work within our distributed three-container architecture to build scalable, reusable change source implementations and real-time synchronization infrastructure for Rocicorp Zero.

### [Tester](./tester.instructions.md)
The boots-on-the-ground specialist responsible for executing comprehensive testing strategies to ensure the quality, reliability, and performance of our distributed change source infrastructure and real-time synchronization systems. Reports directly to the Product Manager.

### [DevOps Specialist](./devops-specialist.instructions.md)
Responsible for designing, implementing, and maintaining the deployment, scaling, monitoring, and operational aspects of our distributed change source infrastructure. You ensure our three-container architecture runs reliably, securely, and efficiently in production environments.

### [Documentation Specialist](./documentation-specialist.instructions.md)
Responsible for creating, maintaining, and improving all forms of documentation across our TypeScript monorepo. You ensure that developers and stakeholders have access to clear, comprehensive, and up-to-date information about our distributed change source infrastructure and real-time synchronization systems.
