# @repo/tsconfig

> Shared TypeScript configuration for the zero-sources monorepo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)

## Overview

This package provides shared TypeScript configurations for all packages and applications in the zero-sources monorepo. It includes base configurations optimized for different project types: Node.js libraries, NestJS applications, React applications, and more.

## Features

- 📦 **Multiple Configurations**: Specialized configs for different project types
- 🎯 **Strict Mode**: Strict TypeScript settings for maximum type safety
- 🔧 **Path Mapping**: Support for workspace aliases and path mappings
- ⚡ **Optimized**: Build and compile-time optimizations
- 🏗️ **Monorepo Ready**: Designed for multi-package workspaces
- ✅ **Best Practices**: Follows TypeScript and Node.js best practices

## Available Configurations

### `base.json`
Base configuration for all TypeScript projects.

### `node22.json`
Configuration for Node.js 22+ projects (libraries and backend services).

### `nestjs.json`
Optimized for NestJS applications.

### `react.json`
Configuration for React applications.

### `library.json`
Optimized for library packages that will be published to npm.

## Installation

This package is intended for internal use within the zero-sources monorepo. It's automatically available to all workspace packages.

```bash
pnpm add -D @repo/tsconfig
```

## Usage

### For Node.js Libraries

```json
{
    "extends": "@repo/tsconfig/node22.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### For NestJS Applications

```json
{
    "extends": "@repo/tsconfig/nestjs.json",
    "compilerOptions": {
        "outDir": "./dist",
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"]
        }
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "test"]
}
```

### For React Applications

```json
{
    "extends": "@repo/tsconfig/react.json",
    "compilerOptions": {
        "outDir": "./build",
        "baseUrl": "./",
        "paths": {
            "~/*": ["./app/*"]
        }
    },
    "include": ["app/**/*", "src/**/*"]
}
```

### For Published Libraries

```json
{
    "extends": "@repo/tsconfig/library.json",
    "compilerOptions": {
        "outDir": "./dist",
        "declarationDir": "./dist/types"
    },
    "include": ["src/**/*"],
    "exclude": ["**/*.test.ts", "**/*.spec.ts"]
}
```

## Configuration Details

### Base Configuration (`base.json`)

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022"],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    }
}
```

### Node.js 22 Configuration (`node22.json`)

Extends `base.json` with Node.js-specific settings:

```json
{
    "extends": "./base.json",
    "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022"],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "types": ["node"]
    }
}
```

### NestJS Configuration (`nestjs.json`)

Optimized for NestJS with decorators and metadata:

```json
{
    "extends": "./node22.json",
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "allowSyntheticDefaultImports": true,
        "incremental": true
    }
}
```

### React Configuration (`react.json`)

For React applications with JSX support:

```json
{
    "extends": "./base.json",
    "compilerOptions": {
        "jsx": "react-jsx",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "types": ["vite/client", "node"]
    }
}
```

### Library Configuration (`library.json`)

For packages that will be published to npm:

```json
{
    "extends": "./base.json",
    "compilerOptions": {
        "declaration": true,
        "declarationMap": true,
        "composite": false,
        "noEmit": false
    }
}
```

## Workspace Examples

### Library Package (zero-contracts)

```json
{
    "extends": "@repo/tsconfig/library.json",
    "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*.mts", "src/**/*.ts"],
    "exclude": ["node_modules", "dist"]
}
```

### Change Source Server (source-mongodb-server)

```json
{
    "extends": "@repo/tsconfig/nestjs.json",
    "compilerOptions": {
        "outDir": "./dist",
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"]
        }
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

### React Application (zrocket)

```json
{
    "extends": "@repo/tsconfig/react.json",
    "compilerOptions": {
        "outDir": "./build",
        "baseUrl": "./",
        "paths": {
            "~/*": ["./app/*"]
        },
        "types": ["vite/client", "@react-router/node"]
    },
    "include": ["app/**/*", "src/**/*", "*.config.ts"]
}
```

## Strict Mode Settings

All configurations enable strict mode by default:

- `strict: true` - Enable all strict type checking options
- `noImplicitAny: true` - Error on expressions with implied `any` type
- `strictNullChecks: true` - Strict null checking
- `strictFunctionTypes: true` - Strict function types
- `strictBindCallApply: true` - Strict `bind`, `call`, and `apply` methods
- `noImplicitThis: true` - Error on `this` expressions with implied `any` type

## Path Mapping

Configure path aliases in your tsconfig.json:

```json
{
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"],
            "@contracts/*": ["../zero-contracts/src/*"],
            "~/*": ["app/*"]
        }
    }
}
```

## Build Output

### For Libraries

```json
{
    "compilerOptions": {
        "outDir": "./dist",
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true
    }
}
```

### For Applications

```json
{
    "compilerOptions": {
        "outDir": "./dist",
        "noEmit": false,
        "incremental": true
    }
}
```

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors:

1. Ensure `moduleResolution` is set to `"Bundler"` for modern projects
2. Check that `baseUrl` is properly configured
3. Verify path mappings are correct

### Declaration Files

For libraries, ensure:

```json
{
    "compilerOptions": {
        "declaration": true,
        "declarationDir": "./dist/types"
    }
}
```

### Import Errors

If imports aren't resolving:

1. Check `include` and `exclude` patterns
2. Verify file extensions are correct (`.ts`, `.mts`)
3. Ensure `skipLibCheck` is enabled if needed

## VS Code Integration

For optimal development experience, add this to your `.vscode/settings.json`:

```json
{
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true,
    "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Contributing

When updating TypeScript configurations:

1. Update the relevant configuration file
2. Test across multiple packages
3. Document breaking changes
4. Update this README

## Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [Node.js TypeScript Best Practices](https://nodejs.org/en/learn/typescript)

## License

MIT © [Sergio Leon](https://cbnsndwch.io)
