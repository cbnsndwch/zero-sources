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
    - [Architecture Overview](#architecture-overview)
    - [Quick Start](#quick-start)
    - [Available Endpoints](#available-endpoints)
    - [Testing the Implementation](#testing-the-implementation)
    - [Development Scripts](#development-scripts)
    - [Troubleshooting](#troubleshooting)
    - [Monitoring Changes](#monitoring-changes)
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

This monorepo hosts various **utilities** and **custom change source** implementations designed to integrate with [`@rocicorp/zero`](https://github.com/rocicorp/zero). The primary goal is to provide building blocks and ready-to-use change sources for developers looking to extend or customize Zero's caching and synchronization features.

### Key Points

- **Tools:** pnpm Workspaces + Turborepo for streamlined development.
- **Tech Stack:** TypeScript code running on Node.js v22+ (Deno + Bun support pending community interest).
- **Framework:** [NestJS] for custom change source implementations in the `apps/` folder.
- **Deployment:** Custom change sources can be containerized via Docker.

> [!NOTE]
> This repo is actively maintained and open to community feedback. If you have questions or requests (e.g., example demos), feel free to open an issue or pull request.

---

## Repository Structure

Here is an overview of the repository layout. We use pnpm Workspaces to manage multiple packages (both **libraries** and **apps**), and Turborepo for caching and running tasks in parallel.

```shell
.
├── apps/
│   ├── source-mongodb-server/     # zero change source for MongoDB
│   ├── zchat-api/                 # ZRocket demo API (discriminated unions)
│   ├── zchat/                     # ZRocket demo frontend
│   └── todo-example/              # example Todo app with Zero + MongoDB
├── libs/
│   ├── eslint-config/             # shared ESLint config
│   ├── tsconfig/                  # shared TSConfig
│   ├── zero/                      # re-export of select parts of @rocicorp/zero in CommonJS format
│   ├── zero-contracts/            # TypeScript contracts and utilities for Zero
│   ├── zchat-contracts/           # Zero schemas for ZRocket demo
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
- **`@cbnsndwch/zchat-contracts`**: Zero schemas for the ZRocket demo (both traditional and discriminated)
- **`@cbnsndwch/zero-source-mongodb`**: MongoDB change source implementation with discriminated union support
- **`@cbnsndwch/zero-watermark-zqlite`**: Utilities for Zero watermarks with ZQLite

Each library is published as a separate npm package and can be used independently in other Zero projects.

> **Note:** Since these libraries are intended to complement `@rocicorp/zero`, check each library's individual `README.md` for usage details (e.g., required config or environment variables).

### Custom Change Sources (`apps/`)

The **apps** contain complete Zero custom change source implementations:

- **`apps/zchat-api`**: ZRocket demo API showcasing discriminated union tables with MongoDB
- **`apps/zchat`**: React frontend for the ZRocket demo
- **`apps/source-mongodb-server`**: General-purpose MongoDB change source server
- **`apps/todo-example`**: Example Todo application using Zero with MongoDB

Each app can be deployed as a Docker container and provides a complete working example of Zero integration patterns.

---

## Running the ZRocket Demo Locally

The **ZRocket demo** showcases discriminated union tables in Zero using MongoDB as the source. Multiple Zero tables are created from single MongoDB collections using filter-based discrimination.

### 🏗️ Architecture Overview

Instead of traditional 1:1 mapping between MongoDB collections and Zero tables, discriminated unions allow multiple Zero tables to be derived from a single MongoDB collection based on document characteristics:

- `rooms` collection → `chats`, `groups`, `channels` (filtered by `t` field)
- `messages` collection → `textMessages`, `imageMessages`, `systemMessages` (filtered by `t` field) 
- `users` collection → `users` (traditional 1:1 mapping)

### 🚀 Quick Start

#### 1. Prerequisites Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally (macOS with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d --name mongodb -p 27017:27017 mongo:7
```

**Option B: MongoDB Atlas**
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

**Terminal 1: Start Zero Cache with Discriminated Schema**
```bash
cd apps/zchat-api
pnpm run dev:zrocket:zero
```

Wait for Zero Cache to start (you'll see "Zero cache server listening on :4848")

**Terminal 2: Start ZRocket API Server**
```bash
cd apps/zchat-api
pnpm run dev:zrocket
```

Wait for the API server to start (you'll see "Application is running on: http://[::1]:8012")

**Terminal 3: Start Frontend (Optional)**
```bash
cd apps/zchat
VITE_API_URL=http://localhost:8012 pnpm run dev
```

#### 5. Seed Sample Data

```bash
curl -X POST http://localhost:8012/zrocket/seed-data
```

This creates sample data including:
- 4 users (alice, bob, charlie, diana)
- 6 rooms (2 direct messages, 2 private groups, 2 public channels)
- 4 messages (2 text, 1 image, 1 system)

#### 6. Explore the Demo

**View Demo Information:**
```bash
curl http://localhost:8012/zrocket/demo-info | jq
```

**Access API Documentation:**
Open http://localhost:8012/api-docs in your browser

**Access Frontend Demo:**
Open http://localhost:5173 in your browser (if you started the frontend)

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

### 🛠️ Development Scripts

From the repository root:

- **`pnpm build:all`**: Build all packages
- **`pnpm build:libs`**: Build only library packages  
- **`pnpm dev`**: Start all development servers
- **`pnpm lint`**: Lint all packages
- **`pnpm test`**: Run all tests

From `apps/zchat-api`:

- **`pnpm run dev:zrocket`**: Start ZRocket API in development mode
- **`pnpm run dev:zrocket:zero`**: Start Zero Cache with discriminated schema
- **`pnpm run start:zrocket`**: Start ZRocket API in production mode
- **`pnpm run build`**: Build the API server

From `apps/zchat`:

- **`pnpm run dev`**: Start frontend development server
- **`pnpm run build`**: Build frontend for production

### 🚨 Troubleshooting

**MongoDB Connection Issues:**
- Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check connection string format for Atlas
- Ensure IP whitelist includes your IP (Atlas)

**Zero Cache Not Starting:**
- Ensure port 4848 is available
- Check that discriminated schema builds: `pnpm build:libs`
- Verify schema file exists: `libs/zchat-contracts/dist/discriminated-schema.js`

**API Server Issues:**
- Ensure MongoDB connection is working
- Check that libraries are built: `pnpm build:libs`
- Verify port 8012 is available

**Frontend Issues:**
- Set `VITE_API_URL` environment variable
- Ensure API server is running on the specified URL
- Check browser console for CORS or network errors

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

Contributions are **welcome**! I'd love your help in making this project better.

1. **Fork** the repository
2. **Create** a feature or bugfix branch
3. **Commit** your changes with clear commit messages
4. **Open** a Pull Request (PR)

I'll review your PR as soon as possible. For major changes, please open an issue or ping `@cbnsndwch` in the Rocicorp Discord server first to discuss the proposed modifications.

If you're not sure where to start, feel free to check the open issues or suggest new ideas!

---

## Roadmap & Future Plans

Here are some of our future plans and directions:

- **GitHub Actions**: Add workflows for CI (build, test, lint) and maybe automated Docker builds.
- **Examples & Demos**: Provide concrete usage examples or a sample application demonstrating how these libraries integrate with `@rocicorp/zero`.
- **Docker Support**: Improve Docker image building processes (multi-stage builds, smaller images).
- **Extended Documentation**: Each library and app might get deeper documentation, usage guides, or best practices for integration with Zero.
- **Additional Change Source Implementations**: Based on community feedback or personal needs.

> Don't see something you need? [Open an issue] or [Join the discussion] to suggest improvements.

---

## License

This project is licensed under the **[MIT License](./LICENSE.md)**. See the license file for more details.

---

## Acknowledgments

- Thanks to [@rocicorp/zero](https://github.com/rocicorp/zero) for providing the base technology this repo extends. If you're new to Zero, check out [Zero's Documentation] for a great introduction.
- [NestJS](https://nestjs.com/) – for powering our server-side apps.
- The **community** – your feedback and contributions help shape this project's future.

---

_Happy syncing, and welcome to the repo!_

[NestJS]: https://docs.nestjs.com/
[Zero's Documentation]: https://zero.rocicorp.dev/
[Open an issue]: https://github.com/cbnsndwch/zero-source/issues
[Join the discussion]: https://discord.rocicorp.dev/