# API Documentation Generation Guide

This document explains how to generate and maintain API documentation for the zero-sources monorepo using Microsoft API Extractor and API Documenter.

## Overview

We use **Microsoft API Extractor** and **API Documenter** instead of TypeDoc because:
- Better support for TypeScript monorepos
- More reliable with pnpm workspaces
- Generates markdown compatible with Fumadocs
- Separates extraction from documentation generation

## Architecture

The API documentation generation follows a two-step process:

1. **API Extractor**: Analyzes compiled `.d.ts` files and generates `.api.json` model files
2. **API Documenter**: Converts `.api.json` files into markdown documentation

```
Source Code (src/*.ts)
    ↓ [build]
Type Definitions (dist/*.d.ts)
    ↓ [api-extractor]
API Model (temp/*.api.json)
    ↓ [api-documenter]
Markdown Docs (apps/docs/content/api/**/*.md)
```

## Setup

### Dependencies

The following packages are installed at the workspace root:

```json
{
  "devDependencies": {
    "@microsoft/api-extractor": "^7.53.3",
    "@microsoft/api-documenter": "^7.27.3"
  }
}
```

### Configuration Files

Each library has an `api-extractor.json` configuration file:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json",
  "mainEntryPointFilePath": "<projectFolder>/dist/index.d.ts",
  "docModel": {
    "enabled": true
  },
  "dtsRollup": {
    "enabled": true
  },
  "messages": {
    "extractorMessageReporting": {
      "default": {
        "logLevel": "warning"
      },
      "ae-wrong-input-file-type": {
        "logLevel": "warning",
        "addToApiReportFile": false
      },
      "ae-missing-release-tag": {
        "logLevel": "none"
      }
    },
    "tsdocMessageReporting": {
      "default": {
        "logLevel": "none"
      }
    }
  }
}
```

## Usage

### Generate Documentation for a Single Library

```bash
# Navigate to library directory
cd libs/zero-contracts

# Build the library first (generates .d.ts files)
pnpm build

# Generate API documentation
pnpm build:api-docs
```

This runs:
1. `api-extractor run --local --verbose` - Extracts API model
2. `api-documenter markdown --input-folder ./temp --output-folder ../../apps/docs/content/api/zero-contracts` - Generates markdown

### Generate Documentation for All Libraries

From the workspace root:

```bash
# Build all libraries
pnpm build:libs

# Generate all API docs
pnpm build:api-docs
```

This uses Turborepo to run `build:api-docs` for all libraries in parallel.

## Output Structure

Generated documentation follows this structure:

```
apps/docs/content/api/
├── zero-contracts/
│   ├── index.md                    # Package overview
│   ├── zero-contracts.md           # Main API reference
│   ├── zero-contracts.*.md         # Individual API items
│   └── ...
├── zero-source-mongodb/
│   └── ...
└── ...
```

Each library gets its own directory with individual markdown files for:
- Classes
- Interfaces
- Type aliases
- Functions
- Constants
- Enums

## Known Issues

### TypeScript Version Warning

You may see this warning:

```
*** The target project appears to use TypeScript 5.9.3 which is newer than the bundled compiler engine; consider upgrading API Extractor.
```

This is non-blocking. API Extractor 7.53.3 uses TypeScript 5.8.2 internally but can still analyze TypeScript 5.9.x projects.

### Wrong Input File Type Warning

You may see:

```
Warning: src/utils/extract-mutator-keys.ts:1:1 - (ae-wrong-input-file-type)
```

This occurs when TypeScript's compiler creates internal references to source files. It's configured as a warning (not an error) and doesn't prevent documentation generation.

### Unsupported TSDoc Tags

API Documenter may warn about unsupported tags like `@template`, `@default`, etc. These are standard TypeScript JSDoc tags that aren't part of the TSDoc standard. Consider using TSDoc-compliant alternatives:

- `@template` → `@typeParam`
- `@default` → `@defaultValue`

## Adding a New Library

When adding a new library to the monorepo:

1. **Initialize API Extractor config:**
   ```bash
   cd libs/new-library
   pnpm exec api-extractor init
   ```

2. **Update `api-extractor.json`:**
   - Set `mainEntryPointFilePath` to `<projectFolder>/dist/index.d.ts`
   - Configure message reporting as shown above
   - Enable `docModel` and `dtsRollup`

3. **Add build script to `package.json`:**
   ```json
   {
     "scripts": {
       "build:api-docs": "api-extractor run --local --verbose && api-documenter markdown --input-folder ./temp --output-folder ../../apps/docs/content/api/new-library"
     }
   }
   ```

4. **Create `etc/` and `temp/` directories:**
   ```bash
   mkdir etc temp
   ```

5. **Test generation:**
   ```bash
   pnpm build
   pnpm build:api-docs
   ```

## Integration with Fumadocs

The generated markdown files are automatically discovered by Fumadocs through the content structure. To add API documentation to the navigation:

1. Create or update `apps/docs/content/api/meta.json`:
   ```json
   {
     "title": "API Reference",
     "pages": ["zero-contracts", "zero-source-mongodb", ...]
   }
   ```

2. Create library-specific `meta.json` files if needed for custom ordering

## Troubleshooting

### Documentation not generating

1. Ensure library is built first: `pnpm build`
2. Check that `dist/index.d.ts` exists
3. Verify `api-extractor.json` has correct `mainEntryPointFilePath`

### Errors during extraction

1. Check TypeScript compilation: `pnpm build --force`
2. Review `api-extractor.json` message configuration
3. Run with `--verbose` flag for detailed output

### Missing API items

1. Ensure items are exported from `src/index.ts`
2. Check that they're not marked `@internal`
3. Verify TypeScript generates declarations for them

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Build libraries
  run: pnpm build:libs

- name: Generate API documentation
  run: pnpm build:api-docs

- name: Check for uncommitted changes
  run: git diff --exit-code apps/docs/content/api/
```

This ensures API documentation stays in sync with code changes.

## Resources

- [API Extractor Documentation](https://api-extractor.com/)
- [API Documenter Documentation](https://api-extractor.com/pages/setup/generating_docs/)
- [TSDoc Specification](https://tsdoc.org/)
- [Microsoft Rush Stack](https://rushstack.io/)
