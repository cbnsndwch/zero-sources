# Acknowledgments & Attributions

This document acknowledges the projects, individuals, and organizations whose work has inspired, influenced, or been incorporated into `@cbnsndwch/zero-sources`.

---

## Core Dependencies & Inspirations

### Rocicorp Zero

**Project**: [@rocicorp/zero](https://github.com/rocicorp/zero)  
**License**: Apache-2.0  
**Attribution**: This entire project is built to extend and integrate with Rocicorp Zero's reactive caching and synchronization framework. Zero provides the foundational technology that powers our change source implementations.

**Links**:

- [Zero Documentation](https://zero.rocicorp.dev/)
- [Zero GitHub Repository](https://github.com/rocicorp/zero)

---

### NestJS

**Project**: [NestJS](https://nestjs.com/)  
**License**: MIT  
**Attribution**: NestJS provides the robust, scalable framework for our custom change source server implementations. Our applications in `apps/` leverage NestJS's dependency injection, module system, and architectural patterns.

**Links**:

- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS GitHub Repository](https://github.com/nestjs/nest)

---

## Inspirational Sources & Design Influences

### Rocket.Chat

**Project**: [Rocket.Chat](https://rocket.chat/)  
**License**: MIT (Community Edition)  
**Attribution**: The domain model and entity schemas in the `zrocket` application were inspired by Rocket.Chat's messaging platform architecture. While we don't use Rocket.Chat as a dependency, their open-source codebase provided valuable insights into:

- Message entity structure and relationships
- Room/channel architecture
- User and subscription models
- Real-time collaboration patterns

**What we adapted**:

- Entity relationship patterns for messages, rooms, and users
- Schema design for chat-based applications
- Concepts around subscriptions and presence

**Links**:

- [Rocket.Chat GitHub Repository](https://github.com/RocketChat/Rocket.Chat)
- [Rocket.Chat Developer Docs](https://developer.rocket.chat/)

**Note**: No code from Rocket.Chat was directly copied. We studied their domain model and reimplemented concepts independently to fit our Zero-based architecture.

---

## Development Tools & Infrastructure

### Turborepo

**Project**: [Turborepo](https://turbo.build/)  
**License**: MPL-2.0  
**Attribution**: Turborepo powers our monorepo build orchestration, providing efficient caching and parallel execution for our multi-package workspace.

### pnpm

**Project**: [pnpm](https://pnpm.io/)  
**License**: MIT  
**Attribution**: pnpm serves as our package manager, providing efficient disk space usage and fast, reliable dependency management for our workspace.

### Changesets

**Project**: [@changesets/changesets](https://github.com/changesets/changesets)  
**License**: MIT  
**Attribution**: Changesets manages our versioning and release workflow, enabling proper semantic versioning across our monorepo packages.

---

## Database & Data Technologies

### MongoDB

**Technology**: [MongoDB](https://www.mongodb.com/)  
**Driver License**: Apache-2.0  
**Attribution**: MongoDB serves as our primary database for the custom change sources. We utilize MongoDB's change streams for real-time data synchronization.

### MySQL

**Technology**: [MySQL](https://www.mysql.com/)  
**Driver License**: MIT  
**Attribution**: MySQL support is provided through our `zero-source-mysql` library for traditional relational database integration.

### ZQLite (Zero's SQLite Layer)

**Component**: Part of @rocicorp/zero  
**Attribution**: We build upon Zero's ZQLite layer for client-side caching and offline-first functionality.

---

## Language & Runtime

### TypeScript

**Project**: [TypeScript](https://www.typescriptlang.org/)  
**License**: Apache-2.0  
**Attribution**: TypeScript provides type safety and enhanced developer experience across all packages in this monorepo.

### Node.js

**Runtime**: [Node.js](https://nodejs.org/)  
**License**: MIT  
**Attribution**: Node.js serves as our primary JavaScript runtime for both development and production environments.

---

## Testing & Quality Tools

### Vitest

**Project**: [Vitest](https://vitest.dev/)  
**License**: MIT  
**Attribution**: Vitest provides our unit testing framework with excellent TypeScript support and fast execution.

### Playwright

**Project**: [Playwright](https://playwright.dev/)  
**License**: Apache-2.0  
**Attribution**: Playwright powers end-to-end testing for the zrocket application.

### ESLint & Prettier

**Projects**: [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)  
**Licenses**: MIT  
**Attribution**: ESLint and Prettier maintain code quality and consistent formatting across the project.

---

## Libraries & Utilities

This project uses numerous open-source libraries as direct dependencies. For a complete list of runtime dependencies, please refer to the `package.json` files in each package directory.

### Key Dependencies Include:

- **Mongoose**: MongoDB object modeling for Node.js
- **Prisma**: Database ORM and type-safe query builder
- **NATS**: Message broker for watermark synchronization
- **better-sqlite3**: SQLite bindings for Node.js
- **Zod**: TypeScript-first schema validation
- **React & React Router**: UI framework for the zrocket demo application

---

## Documentation & Learning Resources

### Patterns & Best Practices Learned From:

- **[The Twelve-Factor App](https://12factor.net/)**: Principles for building modern, scalable applications
- **[Conventional Commits](https://www.conventionalcommits.org/)**: Commit message conventions
- **[Semantic Versioning](https://semver.org/)**: Versioning specification
- **[Keep a Changelog](https://keepachangelog.com/)**: Changelog format guidelines

---

## Community & Ecosystem

### Rocicorp Community

Special thanks to the Rocicorp community on Discord for:

- Answering questions about Zero's architecture
- Providing feedback on change source implementations
- Sharing use cases and requirements

### Open Source Contributors

We appreciate all the individual developers who have contributed to the dependencies and tools that make this project possible. Your work enables us to build better software.

---

## How to Add Acknowledgments

If you've contributed to this project and borrowed code, patterns, or inspiration from external sources, please:

1. **Update this file** with appropriate attribution
2. **Add inline comments** in code where specific implementations were adapted:
    ```typescript
    // Adapted from: [Project Name] ([URL])
    // Original license: [License Type]
    // Changes: [Description of modifications]
    ```
3. **Reference in commit messages** when appropriate
4. **Follow license requirements** of the source material

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on attribution requirements.

---

## License Compliance

All dependencies used in this project are compatible with our MIT License. We comply with all license requirements including:

- ✅ Preserving copyright notices
- ✅ Including license texts where required
- ✅ Acknowledging Apache-2.0 licensed dependencies
- ✅ Maintaining attribution for BSD-licensed components

For specific license information about dependencies, please refer to:

- `node_modules/[package]/LICENSE` files
- [SPDX License List](https://spdx.org/licenses/)
- Individual package documentation

---

## Contact

If you believe we have:

- Missed an important attribution
- Incorrectly attributed your work
- Violated license terms

Please contact us immediately:

- **Email**: oss@cbnsndwch.io
- **GitHub Issues**: [Create an issue](https://github.com/cbnsndwch/zero-sources/issues)

We take attribution and license compliance seriously and will address concerns promptly.

---

**Last Updated**: October 5, 2025

**Copyright © 2023-present cbnsndwch LLC**

This project is licensed under the [MIT License](./LICENSE.md).
