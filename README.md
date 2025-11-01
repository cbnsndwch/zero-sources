# @cbnsndwch/zero-sources

**A collection of utilities and custom change source implementations for `@rocicorp/zero`**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Repository Structure](#repository-structure)
3. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Global Scripts Overview](#global-scripts-overview)
4. [Usage](#usage)
    - [Libraries](#libraries-libs)
    - [Custom Change Sources](#custom-change-sources-apps)
5. [Running the ZRocket Demo Locally](#running-the-zrocket-demo-locally)
    - [Architecture Overview](#️-architecture-overview)
    - [Quick Start](#-quick-start)
    - [Available Endpoints](#-available-endpoints)
    - [Testing the Implementation](#-testing-the-implementation)
    - [Development Scripts](#️-development-scripts)
    - [Troubleshooting](#-troubleshooting)
    - [Monitoring Changes](#-monitoring-changes)
6. [Development](#development)
    - [Running the Project Locally](#running-the-project-locally)
    - [Build Process](#build-process)
    - [Testing](#testing)
    - [Code Quality](#code-quality)
7. [Versioning & Releases](#versioning--releases)
8. [Contributing](#contributing)
9. [Roadmap & Future Plans](#roadmap--future-plans)
10. [License](#license)
11. [Acknowledgments](#acknowledgments)

---

## Introduction

This monorepo hosts various **utilities** and **custom change source** implementations designed to integrate with [`@rocicorp/zero`](https://github.com/rocicorp/mono). The primary goal is to provide building blocks and ready-to-use change sources for developers looking to extend or customize Zero's caching and synchronization features.

### Key Points

- **Tools:** pnpm Workspaces + Turborepo for streamlined development.
- **Tech Stack:** TypeScript code running on Node.js v22+ (Deno + Bun support pending community interest).
- **Framework:** [NestJS] for custom change source implementations in the `apps/` folder.
- **Deployment:** Custom change sources can be containerized via Docker.

---

## Repository Structure

Here is an overview of the repository layout. We use pnpm Workspaces to manage multiple packages (both **libraries** and **apps**), and Turborepo for caching and running tasks in parallel.

```shell
.
├── apps/
│   ├── source-mongodb-server/     # zero change source for MongoDB
│   └── zrocket/                   # unified ZRocket demo (NestJS + React Router 7)
├── libs/
│   ├── eslint-config/             # shared ESLint config
│   ├── tsconfig/                  # shared TSConfig
│   ├── zero-contracts/            # TypeScript contracts and utilities for Zero
│   ├── zrocket-contracts/           # Zero schemas for ZRocket demo
│   ├── zero-source-mongodb/       # MongoDB change source with discriminated unions
│   └── zero-watermark-zqlite/     # utilities for Zero watermarks with ZQLite
├── LICENSE.md                     # license file
├── README.md                      # this README file
└── ...                            # other files
```

### Apps Folder (`apps/`)

- Contains **custom change source implementations** for `@rocicorp/zero`.
- Typically built with [NestJS](https://nestjs.com/) unless otherwise noted in the app's README.
- Meant to be deployable as Docker containers (but may support other deployment strategies in the future).

### Libs Folder (`libs/`)

- Contains **library** code that can be reused across multiple apps.
- Each library is published as a separate npm package.
- All library code is written in TypeScript.

---

## Getting Started

### Prerequisites

1. **Node.js** version **22.x** (or higher)
2. **pnpm** (v10.x or later) - installed automatically via packageManager
3. **MongoDB** - either local instance or MongoDB Atlas account
4. (Optional) **Docker** if you intend to build Docker images for deployment

### Installation

1. **Clone** the repo:

    ```bash
    git clone https://github.com/cbnsndwch/zero-sources.git
    cd zero-sources
    ```

2. **Install dependencies** and build the libraries:

    ```bash
    pnpm install
    pnpm build:libs
    ```

    This will bootstrap all the workspace packages and install each package's dependencies.

### Global Scripts Overview

The following global scripts are available (run from the repo root):

- **`pnpm build:all`**: Builds all apps and libraries in the repo
- **`pnpm build:libs`**: Builds all libraries in the repo
- **`pnpm dev`**: Runs the `dev` script across all apps and libraries that define one
- **`pnpm lint`**: Runs eslint across all packages
- **`pnpm test`**: Runs tests across all packages
- **`pnpm format`**: Runs prettier across all workspaces

You can also navigate into specific packages and run scripts locally, but using `turbo` allows for caching and parallelization.

---

## Usage

### Libraries (`libs/`)

The **libraries** in this monorepo provide reusable utilities for Zero applications:

- **`@cbnsndwch/zero-contracts`**: TypeScript contracts and utilities for Zero
- **`@cbnsndwch/zrocket-contracts`**: Zero schemas for the ZRocket demo (both direct and discriminated)
- **`@cbnsndwch/zero-source-mongodb`**: MongoDB change source implementation with discriminated union support
- **`@cbnsndwch/zero-watermark-zqlite`**: Utilities for Zero watermarks with ZQLite

Each library is published as a separate npm package and can be used independently in other Zero projects.

> **Note:** Since these libraries are intended to complement `@rocicorp/zero`, check each library's individual `README.md` for usage details (e.g., required config or environment variables).

### Custom Change Sources (`apps/`)

The **apps** contain complete Zero custom change source implementations:

- **`apps/zrocket`**: Unified ZRocket demo showcasing discriminated union tables with MongoDB, built with NestJS + React Router 7
- **`apps/source-mongodb-server`**: General-purpose MongoDB change source server

Each app can be deployed as a Docker container and provides a complete working example of Zero integration patterns.

---

## 🚀 Featured: MongoDB Array Unwinding in Table Mappings

The **MongoDB change source** now supports **array unwinding** in table mappings, enabling you to normalize MongoDB documents with embedded arrays into separate Zero table rows using aggregation pipeline stages.

### Key Features

- **~200x Performance Improvement**: Identity-based array diffing generates minimal change events (1 UPDATE vs 200 DELETE+INSERT)
- **Discriminated Union Architecture**: Type-safe pipeline vs simple mappings with compile-time checking
- **Fluent Builder API**: Readable, chainable pipeline construction
- **Backward Compatible**: All existing simple mappings continue to work unchanged

### Quick Example

```typescript
import { pipelineBuilder } from '@cbnsndwch/zero-contracts';

// Unwind account members into separate table rows
const mapping = pipelineBuilder<Member>('accounts')
  .match({ bundle: 'ENTERPRISE' })      // Pre-filter for performance
  .unwind('$members')                   // Unwind array
  .addFields({                          // Add computed fields
    accountId: '$_id',
    userId: '$members.id',
    role: '$members.role'
  })
  .build();

// Table spec with identity field for optimal array diffing
{
  tableName: 'account_members',
  spec: {
    primaryKey: ['accountId', 'userId'],
    identityField: 'userId'  // Critical for ~200x performance improvement
  },
  config: mapping
}
```

### 📚 Complete Documentation

- **[API Reference](./docs/projects/mongo-array-unwind-in-mapping/API_REFERENCE.md)** - Type definitions, pipeline stages, expression operators
- **[Usage Guide](./docs/projects/mongo-array-unwind-in-mapping/USAGE_GUIDE.md)** - Real-world examples and best practices
- **[Migration Guide](./docs/projects/mongo-array-unwind-in-mapping/MIGRATION_GUIDE.md)** - Migrate from simple to pipeline mappings
- **[Performance Guide](./docs/projects/mongo-array-unwind-in-mapping/PERFORMANCE_GUIDE.md)** - Optimization strategies and benchmarks
- **[Project Overview](./docs/projects/mongo-array-unwind-in-mapping/README.md)** - Complete feature documentation

**Status**: ✅ Production Ready (Phases 1-6 Complete)

---

## Running the ZRocket Demo Locally

The **ZRocket demo** showcases discriminated union tables in Zero using MongoDB as the source. Multiple Zero tables are created from single MongoDB collections using filter-based discrimination.

### 🏗️ Architecture Overview

Instead of direct 1:1 mapping between MongoDB collections and Zero tables, discriminated unions allow multiple Zero tables to be derived from a single MongoDB collection based on document characteristics:

**Room Tables** (all from `rooms` collection):

- `chatsTable` → `rooms` collection with filter `{ t: 'd' }` (direct messages)
- `channelsTable` → `rooms` collection with filter `{ t: 'c' }` (public channels)
- `groupsTable` → `rooms` collection with filter `{ t: 'p' }` (private groups)

**Message Tables** (all from `messages` collection):

- `messages` → `messages` collection with filter `{ t: { $exists: false } }` (user messages)
- `systemMessages` → `messages` collection with filter `{ t: { $exists: true } }` (system messages)

**User Tables** (direct 1:1 mapping):

- `users` collection → `users` (no discrimination)

### 🚀 Quick Start

#### 1. Prerequisites Setup

##### Option A: Local MongoDB

```bash
# Install MongoDB locally (macOS with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d --name mongodb -p 27017:27017 mongo:7
```

##### Option B: MongoDB Atlas

1. Create a free MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### 2. Environment Setup

Create environment variables for the ZRocket API:

```bash
# For local MongoDB
export MONGODB_URI="mongodb://localhost:27017/zrocket"

# For MongoDB Atlas
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/zrocket"

# Optional: JWT secret for API authentication
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

#### 3. Install Dependencies and Build

```bash
# Install all dependencies
pnpm install

# Build the libraries (required before running apps)
pnpm build:libs
```

#### 4. Start the Services

##### Terminal 1: Start Zero Cache with Discriminated Schema

```bash
cd apps/zrocket
pnpm run dev:zero
```

Wait for Zero Cache to start (you'll see "Zero cache server listening on :4848")

##### Terminal 2: Start ZRocket Unified App

```bash
cd apps/zrocket
pnpm run dev
```

This starts both the NestJS API server and React Router 7 frontend in development mode.

Wait for both servers to start:

- API server: "Application is running on: <http://localhost:8011>"
- Frontend dev server: "Local: <http://localhost:3000>"

#### 5. Seed Sample Data

```bash
curl -X POST http://localhost:8011/zrocket/seed-data
```

This creates sample data including:

- 4 users (alice, bob, charlie, diana)
- 6 rooms (2 direct messages, 2 private groups, 2 public channels)
- 4 messages (2 text, 1 image, 1 system)

#### 6. Explore the Demo

**View Demo Information:**

```bash
curl http://localhost:8011/zrocket/demo-info | jq
```

**Access API Documentation:**
Open <http://localhost:8011/api-docs> in your browser

**Access Frontend Demo:**
Open <http://localhost:3000> in your browser

**Access API directly:**
Open <http://localhost:8011> in your browser

### 🔍 Available Endpoints

- `GET /zrocket/demo-info` - Demo architecture information
- `POST /zrocket/seed-data` - Seeds sample MongoDB data
- `POST /zrocket/seed-data` (with body) - Seeds custom data
- `GET /zrocket/tables` - List discriminated Zero tables with metadata
- `GET /api-docs` - Swagger API documentation

### 🧪 Testing the Implementation

Run the discriminated union utility tests:

```bash
cd libs/zero-source-mongodb
pnpm test
```

Run all tests across the monorepo:

```bash
pnpm test
```

### ⚙️ Zero Get-Queries Configuration

ZRocket uses Zero's **Synced Queries** feature for server-side permission enforcement. This requires configuring Zero Cache to forward query requests to the NestJS API.

**Configuration Steps:**

1. Ensure `ZERO_GET_QUERIES_URL` is set in both `.env` files:
   - `apps/source-mongodb-server/.env` (Zero Cache)
   - `apps/zrocket/.env` (ZRocket API - for documentation)

2. Verify the configuration:

   ```bash
   # Run verification script
   .\tools\verify-get-queries-config.ps1
   ```

3. Test the endpoint once services are running:

   ```bash
   # Test get-queries endpoint
   .\tools\test-get-queries-endpoint.ps1
   ```

**For detailed setup and troubleshooting**, see:

- 📖 [Zero Get-Queries Setup Guide](./docs/projects/zrocket-synced-queries/ZERO_GET_QUERIES_SETUP.md)

**Key environment variables:**

```bash
# In apps/source-mongodb-server/.env
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'

# In apps/zrocket/.env
ZERO_GET_QUERIES_URL='http://localhost:8011/api/zero/get-queries'
PORT=8011  # Must match the port in ZERO_GET_QUERIES_URL
```

### 🛠️ Development Scripts

From the repository root:

- **`pnpm build:all`**: Build all packages
- **`pnpm build:libs`**: Build only library packages
- **`pnpm dev`**: Start all development servers
- **`pnpm lint`**: Lint all packages
- **`pnpm test`**: Run all tests

From `apps/zrocket`:

- **`pnpm run dev`**: Start unified development mode (API + Frontend)
- **`pnpm run dev:api`**: Start only the NestJS API server
- **`pnpm run dev:zero`**: Start Zero Cache with discriminated schema
- **`pnpm run build`**: Build both API and frontend for production
- **`pnpm run start`**: Start production server

From `tools/`:

- **`.\verify-get-queries-config.ps1`**: Verify Zero get-queries configuration
- **`.\test-get-queries-endpoint.ps1`**: Test the get-queries endpoint

### 🚨 Troubleshooting

**MongoDB Connection Issues:**

- Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check connection string format for Atlas
- Ensure IP whitelist includes your IP (Atlas)

**Zero Cache Not Starting:**

- Ensure port 4848 is available
- Check that discriminated schema builds: `pnpm build:libs`
- Verify schema file exists: `libs/zrocket-contracts/dist/schema/index.js`

**API Server Issues:**

- Ensure MongoDB connection is working
- Check that libraries are built: `pnpm build:libs`
- Verify port 8011 is available

**Frontend Issues:**

- Ensure API server is running on port 8011
- Check browser console for CORS or network errors
- Frontend runs on port 3000 in development mode

### 📊 Monitoring Changes

Once running, you can monitor real-time changes by:

1. **Adding new documents** via API endpoints
2. **Watching Zero tables** update automatically
3. **Observing discriminated routing** in action

The discriminated union system will automatically route documents to appropriate Zero tables based on their filter criteria, demonstrating the power of this approach for clean client APIs with complex backend data structures.

---

## Development

This section describes general development practices in the monorepo.

### Running the Project Locally

See the comprehensive **"Running the ZRocket Demo Locally"** section above for detailed local development instructions.

### Build Process

- **Root Build**: Compiles all TypeScript packages, outputting them into each package's designated `dist` folder:

```bash
pnpm install
pnpm build:all
```

- **Per Package**: You can also build individual packages:

```bash
pnpm build:libs  # Build only libraries
```

Or use Turbo's filtering:

```bash
pnpm build --filter "./apps/*"   # Build only apps
pnpm build --filter "./libs/*"   # Build only libraries
```

### Testing

Run tests across all packages:

```bash
pnpm test
```

Run tests with coverage:

```bash
cd libs/zero-source-mongodb
pnpm test:coverage
```

### Code Quality

Format code across all packages:

```bash
pnpm format
```

Lint code across all packages:

```bash
pnpm lint
```

---

## Versioning & Releases

This repository follows **Semantic Versioning** (SemVer). Each package in this monorepo will use the standard versioning scheme **`MAJOR.MINOR.PATCH`**:

1. **MAJOR** – incompatible API changes.
2. **MINOR** – add functionality in a backward-compatible manner.
3. **PATCH** – backward-compatible bug fixes.

> Once we set up an automated release process (e.g., using changesets or a similar tool), we'll update this section with details on how to bump versions and publish new releases.

---

## Contributing

Contributions are **welcome**! We'd love your help in making this project better.

### Quick Start

1. **Fork** the repository
2. **Create** a feature or bugfix branch
3. **Commit** your changes with clear commit messages
4. **Open** a Pull Request (PR)

### Important: Contributor License Agreement

⚠️ **All contributors must agree to our [Contributor License Agreement (CLA)](./CONTRIBUTING.md#contributor-license-agreement-cla)** before we can accept contributions. This protects both you and the project.

### Full Guidelines

Please read our **[Contributing Guide](./CONTRIBUTING.md)** for:

- Detailed setup instructions
- Coding standards and best practices
- Testing requirements
- Attribution guidelines for external code
- Pull request process

For major changes, please open an issue or ping `@cbnsndwch` in the Rocicorp Discord server first to discuss your proposed modifications.

If you're not sure where to start, check the [open issues](https://github.com/cbnsndwch/zero-sources/issues) or suggest new ideas!

---

## Roadmap & Future Plans

Here are some of our future plans and directions:

### Planned Custom Change Sources

- **Stripe Integration**: API-based initial sync with webhook support for real-time updates
- **GoHighLevel Integration**: Webhook-based change source using their comprehensive API ([API Documentation](https://highlevel.stoplight.io/docs/integrations/0443d7d1a4bd0-overview))

### Infrastructure & Tooling

- **GitHub Actions**: Add workflows for CI (build, test, lint) and maybe automated Docker builds.
- **Examples & Demos**: Provide concrete usage examples or a sample application demonstrating how these libraries integrate with `@rocicorp/zero`.
- **Docker Support**: Improve Docker image building processes (multi-stage builds, smaller images).
- **Extended Documentation**: Each library and app might get deeper documentation, usage guides, or best practices for integration with Zero.

### Community & Ecosystem

- **Additional Change Source Implementations**: Based on community feedback or personal needs.

> Don't see something you need? [Open an issue] or [Join the discussion] to suggest improvements.

---

## License

This project is licensed under the **[MIT License](./LICENSE.md)**. See the license file for more details.

---

## Acknowledgments

This project builds upon the work of many incredible open-source projects and communities:

- **[@rocicorp/zero](https://github.com/rocicorp/zero)** – The foundational reactive caching and synchronization framework that powers everything in this repository. Check out [Zero's Documentation] for more information.
- **[NestJS](https://nestjs.com/)** – The robust Node.js framework powering our custom change source implementations.
- **[Rocket.Chat](https://rocket.chat/)** – Inspiration for the domain model and entity schemas in our zrocket demo application.
- **Open Source Community** – The countless developers who maintain the libraries, tools, and frameworks we depend on.
- **Contributors** – Everyone who has contributed code, documentation, bug reports, and feedback to make this project better.

For a comprehensive list of attributions, inspirations, and license information, see [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md).

---

_Happy syncing, and welcome to the repo!_

[NestJS]: https://docs.nestjs.com/
[Zero's Documentation]: https://zero.rocicorp.dev/
[Open an issue]: https://github.com/cbnsndwch/zero-source/issues
[Join the discussion]: https://discord.rocicorp.dev/
