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
    - [Scripts Overview](#scripts-overview)
4. [Usage](#usage)
    - [Libraries](#libraries-libs)
    - [Custom Change Sources](#custom-change-sources-apps)
5. [Development](#development)
    - [Running the Project Locally](#running-the-project-locally)
    - [Build Process](#build-process)
    - [Testing](#testing)
6. [Versioning & Releases](#versioning--releases)
7. [Contributing](#contributing)
8. [Roadmap & Future Plans](#roadmap--future-plans)
9. [License](#license)
10. [Acknowledgments](#acknowledgments)

---

## Introduction

This monorepo hosts various **utilities** and **custom change source** implementations designed to integrate with [`@rocicorp/zero`](https://github.com/rocicorp/zero). The primary goal is to provide building blocks and ready-to-use change sources for developers looking to extend or customize Zero’s caching and synchronization features.

### Key Points

- **Tools:** Yarn v4 Workspaces + Turborepo for streamlined development.
- **Tech Stack:** TypeScript code running on Node.js v22+ (Deno + Bun support pending community interest).
- **Framework:** [NestJS] for custom change source implementations in the `apps/` folder.
- **Deployment:** Custom change sources can be containerized via Docker.

> [!NOTE]
> This repo is actively maintained and open to community feedback. If you have questions or requests (e.g., example demos), feel free to open an issue or pull request.

---

## Repository Structure

Here is an overview of the repository layout. We use Yarn Workspaces to manage multiple packages (both **libraries** and **apps**), and Turborepo for caching and running tasks in parallel.

```shell
.
├── apps/
│   ├── source-mongoose/     # zero change source for MongoDB/Mongoose
│   └── ...                  # (TODO) other custom change sources
├── libs/
│   ├── eslint-config/       # shared ESLint config
│   ├── tsconfig/            # shared TSConfig
│   ├── zero/                # re-export of select parts of @rocicorp/zero in CommonJS format
│   └── zero-nest-mongoose/  # utilities to generate zero schemas from @nestjs/mongoose entities
├── LICENSE.md               # license file
├── README.md                # this README file
└── ...                      # other files
```

### Apps Folder (`apps/`)

- Contains **custom change source implementations** for `@rocicorp/zero`.
- Typically built with [NestJS](https://nestjs.com/) unless otherwise noted in the app’s README.
- Meant to be deployable as Docker containers (but may support other deployment strategies in the future).

### Libs Folder (`libs/`)

- Contains **library** code that can be reused across multiple apps.
- Each library is published as a separate npm package.
- All library code is written in TypeScript.

---

## Getting Started

### Prerequisites

1. **Node.js** version **22.x** (or higher)
2. **Yarn** (v4 or later)
3. (Optional) **Docker** if you intend to build Docker images for the custom change sources.

### Installation

1. **Clone** the repo:

    ```bash
    git clone https://github.com/cbnsndwch/zero-sources.git
    cd zero-utilities-monorepo
    ```

2. **Install dependencies** and build the libraries:

    ```bash
    yarn && yarn build
    ```

    This will bootstrap all the workspace packages and install each package’s dependencies.

### Scripts Overview

The following global scripts are available (run from the repo root):

- **`yarn build`**: Builds all apps and libraries in the repo.
- **`yarn build:libs`**": Builds all libraries in the repo.
- **`yarn dev`**: Runs the `deb` script across all apps and libraries that define one.
- **`yarn lint`**: Runs eslint across all packages.
- **`yarn format`**: Runs prettier across all workspaces.

You can also navigate into specific packages and run scripts locally, but using `turbo` allows for caching and parallelization.

---

## Usage

### Libraries (`libs/`)

TDB

> **Note:** Since these libraries are intended to complement `@rocicorp/zero`, check each library’s individual `README.md` for usage details (e.g., required config or environment variables).

### Custom Change Sources (`apps/`)

TDB

## Development

This section describes how to develop in the monorepo.

### Running the Project Locally

TDB

### Build Process

- **Root Build**: Compiles all TypeScript packages, outputting them into each package’s designated `dist` folder.

```shell
yarn && yarn build
```

- **Per Package**: You can also build individual packages:

```bash
yarn && yarn build --filter apps/...
```

OR

```bash
yarn && yarn build --filter libs/...
```

### Testing

TDB

---

## Versioning & Releases

This repository follows **Semantic Versioning** (SemVer). Each package in this monorepo will use the standard versioning scheme **`MAJOR.MINOR.PATCH`**:

1. **MAJOR** – incompatible API changes.
2. **MINOR** – add functionality in a backward-compatible manner.
3. **PATCH** – backward-compatible bug fixes.

> Once we set up an automated release process (e.g., using changesets or a similar tool), we’ll update this section with details on how to bump versions and publish new releases.

---

## Contributing

Contributions are **welcome**! I’d love your help in making this project better.

1. **Fork** the repository
2. **Create** a feature or bugfix branch
3. **Commit** your changes with clear commit messages
4. **Open** a Pull Request (PR)

I’ll review your PR as soon as possible. For major changes, please open an issue or ping `@cbnsndwch` in the Rocicorp Discord server first to discuss the proposed modifications.

If you’re not sure where to start, feel free to check the open issues or suggest new ideas!

---

## Roadmap & Future Plans

Here are some of our future plans and directions:

- **GitHub Actions**: Add workflows for CI (build, test, lint) and maybe automated Docker builds.
- **Examples & Demos**: Provide concrete usage examples or a sample application demonstrating how these libraries integrate with `@rocicorp/zero`. **✅ ZRocket Demo** - A working demonstration of discriminated unions is available in [`apps/zrocket-demo/`](./apps/zrocket-demo/README.md).
- **Docker Support**: Improve Docker image building processes (multi-stage builds, smaller images).
- **Extended Documentation**: Each library and app might get deeper documentation, usage guides, or best practices for integration with Zero.
- **Additional Change Source Implementations**: Based on community feedback or personal needs.

> Don’t see something you need? [Open an issue] or [Join the discussion] to suggest improvements.

---

## License

This project is licensed under the **[MIT License](./LICENSE.md)**. See the license file for more details.

---

## Acknowledgments

- Thanks to [@rocicorp/zero](https://github.com/rocicorp/zero) for providing the base technology this repo extends. If you're new to Zero, check out [Zero's Documentation] for a great introduction.
- [NestJS](https://nestjs.com/) – for powering our server-side apps.
- The **community** – your feedback and contributions help shape this project’s future.

---

_Happy syncing, and welcome to the repo!_

[NestJS]: https://docs.nestjs.com/
[Zero's Documentation]: https://zero.rocicorp.dev/
[Open an issue]: https://github.com/cbnsndwch/zero-source/issues
[Join the discussion]: https://discord.rocicorp.dev/
