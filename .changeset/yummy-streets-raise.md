---
'@cbnsndwch/zero-watermark-nats-kv': minor
'@cbnsndwch/zero-source-mongodb-server': minor
'@cbnsndwch/zero-watermark-zqlite': minor
'@cbnsndwch/zero-source-mongodb': minor
'@cbnsndwch/zero-nest-mongoose': minor
'@cbnsndwch/zrocket-contracts': minor
'@cbnsndwch/nest-zero-synced-queries': minor
'@cbnsndwch/zero-contracts': minor
'@repo/eslint-config': minor
'@cbnsndwch/zero-sources-docs-vercel': minor
'@cbnsndwch/zrocket': minor
'@cbnsndwch/zero-sources-docs': minor
---

### Dependency Updates

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
