# Contributing to @cbnsndwch/zero-sources

Thank you for your interest in contributing to `@cbnsndwch/zero-sources`! We welcome contributions from the community and appreciate your help in making this project better.

Before contributing, please read this guide carefully to understand our processes and requirements.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
4. [Development Setup](#development-setup)
5. [How to Contribute](#how-to-contribute)
6. [Coding Standards](#coding-standards)
7. [Testing Guidelines](#testing-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Commit Message Guidelines](#commit-message-guidelines)
10. [Questions and Support](#questions-and-support)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. By participating in this project, you agree to:

- Be respectful and considerate in your interactions
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community and the project

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v22 or higher
- **pnpm** v8 or higher (our package manager of choice)
- **Git** for version control
- A **GitHub account**

### Familiarize Yourself with the Project

1. Read the main [README.md](./README.md) to understand the project structure and goals
2. Browse the [existing issues](https://github.com/cbnsndwch/zero-sources/issues) to see what needs attention
3. Check the [discussions](https://github.com/cbnsndwch/zero-sources/discussions) for ongoing conversations
4. Join the [Rocicorp Discord server](https://discord.gg/rocicorp) and mention `@cbnsndwch` if you have questions

---

## Contributor License Agreement (CLA)

### Important Legal Requirements

**⚠️ ALL CONTRIBUTORS MUST AGREE TO THE CONTRIBUTOR LICENSE AGREEMENT BEFORE WE CAN ACCEPT ANY CONTRIBUTIONS.**

By submitting code, documentation, or any other materials to this project, you agree to grant **cbnsndwch LLC** an MIT license to your contributions. This protects both you and the project by:

1. **Ensuring Legal Clarity**: Your contributions can be freely used, modified, and distributed under the MIT License
2. **Protecting the Project**: cbnsndwch LLC can defend the project against legal claims
3. **Protecting You**: You retain copyright ownership of your contributions while granting necessary rights to the project

### CLA Terms

By submitting a contribution to this project, you certify that:

1. **Original Work**: The contribution is your original work, or you have the right to submit it under the MIT License
2. **Grant of License**: You grant cbnsndwch LLC and recipients of software distributed by cbnsndwch LLC a perpetual, worldwide, non-exclusive, no-charge, royalty-free, irrevocable license to:
    - Use, reproduce, prepare derivative works of, publicly display, publicly perform, sublicense, and distribute your contributions and such derivative works under the MIT License
3. **No Conflicting Obligations**: You are legally entitled to grant the above license and are not violating any employer agreements or other obligations
4. **No Warranties**: Your contributions are provided "as is" without warranties or conditions of any kind

### How to Sign the CLA

**For your first contribution:**

1. Add a comment to your Pull Request with the following text:

```
I have read and agree to the Contributor License Agreement as outlined in CONTRIBUTING.md.
I certify that my contributions are my original work and I have the right to submit them under the MIT License.
I grant cbnsndwch LLC the rights specified in the CLA.

Full Name: [Your Full Legal Name]
GitHub Username: @[your-username]
Date: [YYYY-MM-DD]
```

2. A maintainer will verify and acknowledge your CLA agreement
3. Once acknowledged, your CLA remains in effect for all future contributions to this project

**Corporate Contributors:**

If you are contributing on behalf of your employer or a company, you must:

1. Have written permission from your employer to contribute
2. Submit a Corporate CLA where an authorized representative of your company signs on behalf of all employees who will contribute

Please contact legal@cbnsndwch.com for the Corporate CLA form.

---

## Development Setup

### 1. Fork and Clone the Repository

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/zero-sources.git
cd zero-sources

# Add the upstream repository
git remote add upstream https://github.com/cbnsndwch/zero-sources.git
```

### 2. Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install
```

### 3. Build the Project

```bash
# Build all libraries
pnpm build:libs

# Or build everything including apps
pnpm build
```

### 4. Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (if available)
pnpm test:watch
```

### 5. Start Development

```bash
# Start development mode for all packages
pnpm dev
```

---

## How to Contribute

### Types of Contributions We Welcome

1. **Bug Fixes**: Fix issues reported in the issue tracker
2. **New Features**: Add new functionality (please discuss in an issue first)
3. **Documentation**: Improve README files, add examples, fix typos
4. **Tests**: Add or improve test coverage
5. **Performance**: Optimize existing code
6. **Change Sources**: Implement new custom change sources for different data sources

### Before You Start

1. **Check Existing Issues**: See if someone is already working on it
2. **Open an Issue**: For major changes, open an issue to discuss your proposal first
3. **Small PRs**: Break large changes into smaller, focused pull requests
4. **Stay in Scope**: Ensure your contribution aligns with the project's goals

---

## Coding Standards

### General Guidelines

- **Language**: TypeScript for all code
- **Formatting**: We use Prettier for code formatting
    ```bash
    pnpm format
    ```
- **Linting**: All code must pass ESLint checks
    ```bash
    pnpm lint
    ```

### Code Style

- Use **meaningful variable and function names**
- Add **JSDoc comments** for public APIs
- Follow **functional programming principles** where appropriate
- Keep functions **small and focused** (single responsibility)
- Use **async/await** instead of raw promises where possible

### TypeScript Best Practices

- Enable strict mode in `tsconfig.json`
- Use **explicit types** for function parameters and return values
- Avoid `any` type; use `unknown` if the type is truly unknown
- Use type guards for type narrowing
- Leverage TypeScript utility types (`Partial`, `Pick`, `Omit`, etc.)

### File Structure

- Place library code in `libs/[package-name]/src/`
- Place application code in `apps/[app-name]/src/`
- Keep tests alongside the code they test (`.spec.ts` or `.test.ts`)
- Use barrel exports (`index.ts`) to expose public APIs

---

## Testing Guidelines

### Testing Requirements

- **All new code must include tests**
- Aim for at least **80% code coverage** for new features
- Tests should be **clear, focused, and maintainable**

### Types of Tests

1. **Unit Tests**: Test individual functions and classes in isolation
2. **Integration Tests**: Test how components work together
3. **End-to-End Tests**: Test complete workflows (for applications)

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @cbnsndwch/zero-source-mongodb test

# Run tests with coverage
pnpm test -- --coverage
```

### Writing Good Tests

- Use descriptive test names that explain what is being tested
- Follow the **Arrange-Act-Assert** pattern
- Mock external dependencies appropriately
- Test both success and error cases
- Keep tests independent (no shared state)

---

## Attribution and Licensing Requirements

### Using External Code or Inspiration

If your contribution includes or is inspired by code from other sources:

#### 1. **Direct Code Adaptation**

If you adapt or copy code from another project:

```typescript
/**
 * Adapted from: [Project Name] ([GitHub URL or source URL])
 * Original Author: [Author Name]
 * Original License: [License Type - e.g., MIT, Apache-2.0]
 * Changes made: [Brief description of your modifications]
 */
export function adaptedFunction() {
    // Your implementation
}
```

#### 2. **Inspired By / Design Patterns**

If you're implementing a design pattern or concept from another project:

```typescript
/**
 * Implementation inspired by [Project Name]'s approach to [specific feature]
 * See: [URL to relevant documentation or code]
 *
 * This is an independent implementation adapted for our use case.
 */
export class InspiredComponent {
    // Your implementation
}
```

#### 3. **Update ACKNOWLEDGMENTS.md**

For significant inspirations or borrowed patterns, add an entry to [ACKNOWLEDGMENTS.md](./ACKNOWLEDGMENTS.md):

- What you borrowed or were inspired by
- The source project and its license
- How you adapted it for this project
- Link to the original source

#### 4. **License Compatibility**

Ensure any external code you reference is:

- ✅ Licensed under **permissive licenses**: MIT, Apache-2.0, BSD, ISC
- ✅ Compatible with this project's MIT License
- ⚠️ **Requires approval**: GPL, LGPL, AGPL, MPL (copyleft licenses)
- ❌ **NOT ACCEPTABLE**:
    - SSPL (Server Side Public License)
    - FSL (Functional Source License) / BSL (Business Source License)
    - Fair Source / Fair Code licenses
    - Elastic License / Commons Clause
    - CC BY-NC (Non-Commercial) or any license with commercial restrictions
    - Time-delayed licenses that restrict commercial use
    - Proprietary licenses without explicit permission

#### 5. **When in Doubt**

If you're unsure about attribution requirements:

1. Open a discussion before submitting your PR
2. Contact the maintainers via Discord or email
3. Err on the side of over-attribution rather than under-attribution

### Why This Matters

Proper attribution:

- **Respects** the original authors' work
- **Protects** the project from legal issues
- **Maintains** trust in the open-source community
- **Ensures** license compliance

---

## Pull Request Process

### 1. Create a Feature Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the coding standards
- Add or update tests
- Update documentation if needed

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Message Guidelines](#commit-message-guidelines) below.

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

1. Go to the [zero-sources repository](https://github.com/cbnsndwch/zero-sources)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template with:
    - **Description**: What changes you made and why
    - **Related Issues**: Link to any related issues
    - **Testing**: How you tested the changes
    - **CLA Agreement**: Include your CLA statement (first-time contributors)

### PR Requirements

Before your PR can be merged:

- ✅ All tests must pass
- ✅ Code must pass linting and formatting checks
- ✅ CLA must be signed (for first-time contributors)
- ✅ At least one maintainer approval
- ✅ All conversations resolved
- ✅ Branch is up-to-date with `main`

### Code Review Process

- A maintainer will review your PR within **3-5 business days**
- Be responsive to feedback and questions
- Make requested changes in new commits (don't force-push)
- Once approved, a maintainer will merge your PR

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates, etc.
- `ci`: Changes to CI/CD configuration

### Examples

```bash
feat(zero-source-mongodb): add support for change streams
fix(watermark): correct race condition in ZQLite storage
docs(readme): update installation instructions
test(contracts): add unit tests for schema validation
```

### Scope

The scope should be the name of the package or app affected:

- `zero-source-mongodb`
- `zero-watermark-zqlite`
- `zrocket-contracts`
- `source-mongodb-server`
- etc.

---

## Versioning and Releases

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

### Adding a Changeset

If your PR includes changes that should be released:

```bash
pnpm changeset
```

Follow the prompts to:

1. Select which packages are affected
2. Choose the type of change (major, minor, patch)
3. Write a description of the changes

Commit the generated changeset file with your PR.

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backwards compatible
- **Patch (0.0.1)**: Bug fixes, backwards compatible

---

## Questions and Support

### Where to Get Help

1. **Documentation**: Check the [README.md](./README.md) and package-specific READMEs
2. **Existing Issues**: Search [GitHub Issues](https://github.com/cbnsndwch/zero-sources/issues)
3. **Discussions**: Start a [GitHub Discussion](https://github.com/cbnsndwch/zero-sources/discussions)
4. **Discord**: Join the [Rocicorp Discord](https://discord.gg/rocicorp) and mention `@cbnsndwch`
5. **Email**: For legal or security concerns: legal@cbnsndwch.com

### Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Node version, OS, package versions
6. **Logs**: Relevant error messages or logs
7. **Code Sample**: Minimal code example that demonstrates the issue

### Requesting Features

For feature requests:

1. **Search First**: Check if it's already been requested
2. **Use Case**: Explain why this feature would be valuable
3. **Proposed Solution**: Describe how you envision it working
4. **Alternatives**: Mention any alternative solutions you've considered

---

## Thank You! 🎉

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Last Updated**: October 5, 2025

**Copyright © 2023-present cbnsndwch LLC**

This project is licensed under the [MIT License](./LICENSE.md).
