# @repo/eslint-config

> Shared ESLint configuration for the zero-sources monorepo

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/cbnsndwch/zero-sources/blob/main/LICENSE.md)

## Overview

This package provides shared ESLint configurations for all packages and applications in the zero-sources monorepo. It includes configurations for TypeScript, React, and Node.js projects with best practices and consistent code style enforcement.

## Features

- 🔧 **TypeScript Support**: Full ESLint configuration for TypeScript projects
- ⚛️ **React Configuration**: React-specific linting rules for frontend applications
- 🟢 **Node.js Configuration**: Server-side linting rules for NestJS and Node.js apps
- 📦 **Monorepo Optimized**: Designed for use across multiple packages
- ✅ **Best Practices**: Enforces industry best practices and code quality
- 🎨 **Prettier Integration**: Works seamlessly with Prettier for code formatting

## Installation

This package is intended for internal use within the zero-sources monorepo. It's automatically available to all workspace packages.

```bash
pnpm add -D @repo/eslint-config
```

## Available Configurations

### Base Configuration

For general TypeScript projects:

```javascript
// eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default baseConfig;
```

### React Configuration

For React applications (like ZRocket frontend):

```javascript
// eslint.config.js
import reactConfig from '@repo/eslint-config/react-internal';

export default reactConfig;
```

### Library Configuration

For library packages:

```javascript
// eslint.config.js
import libraryConfig from '@repo/eslint-config/library';

export default libraryConfig;
```

## Usage in Workspace Packages

### TypeScript Library

```javascript
// libs/zero-contracts/eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default [
    ...baseConfig,
    {
        // Package-specific overrides
        rules: {
            // Custom rules for this package
        }
    }
];
```

### NestJS Application

```javascript
// apps/source-mongodb-server/eslint.config.js
import baseConfig from '@repo/eslint-config/base';

export default [
    ...baseConfig,
    {
        files: ['**/*.ts'],
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off'
        }
    }
];
```

### React Application

```javascript
// apps/zrocket/eslint.config.cjs
const reactConfig = require('@repo/eslint-config/react-internal');

module.exports = {
    ...reactConfig
    // App-specific overrides
};
```

## Included Rules

### TypeScript Rules

- Strict type checking enabled
- No unused variables
- Consistent naming conventions
- Import sorting and organization

### React Rules

- React Hooks rules
- JSX best practices
- Accessibility (a11y) rules
- React refresh compatibility

### General Rules

- No console logs in production code
- Consistent code style
- Import order enforcement
- Consistent file naming

## Integration with package.json

```json
{
    "scripts": {
        "lint": "eslint . --fix",
        "lint:check": "eslint ."
    },
    "devDependencies": {
        "@repo/eslint-config": "workspace:*",
        "eslint": "^9.37.0"
    }
}
```

## Customization

### Extending Configuration

```javascript
import baseConfig from '@repo/eslint-config/base';

export default [
    ...baseConfig,
    {
        rules: {
            // Override specific rules
            'no-console': 'warn',
            '@typescript-eslint/no-explicit-any': 'error'
        }
    }
];
```

### Ignoring Files

```javascript
export default [
    ...baseConfig,
    {
        ignores: ['dist/**', 'build/**', 'coverage/**', '**/*.config.js']
    }
];
```

## VS Code Integration

For optimal development experience, add this to your `.vscode/settings.json`:

```json
{
    "eslint.enable": true,
    "eslint.format.enable": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

## Contributing

When updating ESLint rules:

1. Update the relevant configuration file
2. Test across multiple packages
3. Document breaking changes
4. Update this README with new rules

## License

MIT © [cbnsndwch LLC](https://cbnsndwch.io)
