# Story 001: Project Setup and Scaffolding

**Story ID**: FDS-STORY-001
**Epic**: [FDS-EPIC-001 - Initial Setup and Configuration](../epics/epic-001-initial-setup.md)
**Status**: Not Started
**Priority**: Critical
**Estimated Effort**: 1 day
**Sprint**: 1

---

## User Story

**As a** developer on the zero-sources team
**I want** a properly scaffolded Fumadocs project integrated with the monorepo
**So that** I can start developing and previewing documentation content locally

## Background/Context

The zero-sources monorepo currently lacks a centralized documentation site. We need to create a new Fumadocs-based documentation application in the `apps/docs` directory that integrates seamlessly with the existing Turborepo and pnpm workspace setup. This foundation will enable all subsequent documentation work.

## Acceptance Criteria

**Given** the zero-sources monorepo exists with Turborepo and pnpm
**When** I set up the Fumadocs project
**Then** I should have:

- [ ] New directory `apps/docs` created with Fumadocs project structure
- [ ] `package.json` with all required dependencies
- [ ] TypeScript configured with strict type checking
- [ ] Next.js 16 configured with App Router
- [ ] Fumadocs 16 core, UI, and MDX packages installed
- [ ] Project added to root `pnpm-workspace.yaml`
- [ ] Project added to `turbo.json` with appropriate task configuration
- [ ] `pnpm install` runs successfully from monorepo root
- [ ] `pnpm dev --filter=docs` starts development server at `localhost:3000`
- [ ] Hot module replacement works for content and code changes
- [ ] TypeScript compilation succeeds with no errors
- [ ] Basic "Hello World" page renders successfully

## Definition of Done

- [ ] Fumadocs project created in `apps/docs` directory
- [ ] All dependencies installed and versions locked
- [ ] Integration with Turborepo verified (build and dev tasks work)
- [ ] Integration with pnpm workspace verified
- [ ] Local development server runs without errors
- [ ] TypeScript compilation passes
- [ ] Code review completed
- [ ] Documentation for local setup written in `apps/docs/README.md`
- [ ] No console errors or warnings in browser
- [ ] Initial commit pushed to repository

## Technical Details

### Files to Create

#### `apps/docs/package.json`

```json
{
  "name": "@cbnsndwch/docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "fumadocs-core": "^16.0.0",
    "fumadocs-mdx": "^16.0.0",
    "fumadocs-ui": "^16.0.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.9.3"
  },
  "engines": {
    "node": ">=22"
  }
}
```

#### `apps/docs/tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/nextjs.json",
  "compilerOptions": {
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

#### `apps/docs/next.config.mjs`

```javascript
import createMDX from 'fumadocs-mdx/config';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withMDX(config);
```

#### `apps/docs/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';
import { createPreset } from 'fumadocs-ui/tailwind-plugin';

const config: Config = {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    './node_modules/fumadocs-ui/dist/**/*.js',
  ],
  presets: [createPreset()],
};

export default config;
```

#### `apps/docs/app/layout.tsx`

```typescript
import './globals.css';
import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

#### `apps/docs/app/page.tsx`

```typescript
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">zero-sources Documentation</h1>
      <p className="mt-4 text-lg">
        Welcome to the documentation site for zero-sources
      </p>
    </main>
  );
}
```

#### `apps/docs/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### `apps/docs/.eslintrc.json`

```json
{
  "extends": "@repo/eslint-config/next.js"
}
```

#### `apps/docs/README.md`

```markdown
# zero-sources Documentation Site

This is the documentation website for the zero-sources monorepo, built with [Fumadocs](https://fumadocs.vercel.app/).

## Development

Run the development server:

```bash
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

## Building

Build the documentation site:

```bash
pnpm build
```

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `content/` - MDX documentation content
- `components/` - React components
- `public/` - Static assets
- `styles/` - Global styles

## Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS
- **Language**: TypeScript
```

### Files to Modify

#### Update `pnpm-workspace.yaml` (root)

No changes needed if already includes `apps/*`

#### Update `turbo.json` (root)

Add docs-specific configuration:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        "lib/**",
        ".next/**",
        "!.next/cache/**"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Directory Structure to Create

```text
apps/docs/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── content/
│   └── (initially empty)
├── components/
│   └── (initially empty)
├── public/
│   └── (initially empty)
├── .eslintrc.json
├── next.config.mjs
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Testing Requirements

### Manual Testing

1. **Installation Test**:

```bash
# From monorepo root
pnpm install
```

Expected: No errors, all dependencies installed

2. **Build Test**:

```bash
pnpm build --filter=docs
```

Expected: Build completes successfully, no TypeScript errors

3. **Development Server Test**:

```bash
pnpm dev --filter=docs
```

Expected: Server starts at `http://localhost:3000`, page loads showing "zero-sources Documentation"

4. **Hot Reload Test**:
   - Start dev server
   - Edit `apps/docs/app/page.tsx`
   - Save file

Expected: Page updates without full reload

5. **Type Checking Test**:

```bash
cd apps/docs
pnpm type-check
```

Expected: No TypeScript errors

6. **Linting Test**:

```bash
cd apps/docs
pnpm lint
```

Expected: No linting errors

### Verification Checklist

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build --filter=docs` succeeds
- [ ] `pnpm dev --filter=docs` starts server at port 3000
- [ ] Home page loads with correct title
- [ ] No console errors in browser
- [ ] Hot module replacement works
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] All required files created
- [ ] README.md documentation complete

## Notes

- Use exact versions that are known to be compatible
- Fumadocs 16 requires Next.js 16 and React 19
- Keep Tailwind CSS configuration minimal initially
- Ensure consistent TypeScript configuration with rest of monorepo
- Test thoroughly before moving to next story

## Dependencies

### Blocks

- None (this is the first story)

### Blocked By

- None

## Related Documentation

- [Fumadocs Installation Guide](https://fumadocs.vercel.app/docs/getting-started/installation)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)

## Implementation Steps

1. Create `apps/docs` directory
2. Initialize `package.json` with dependencies
3. Create TypeScript configuration
4. Create Next.js configuration
5. Create Tailwind CSS configuration
6. Create basic App Router structure (`app/layout.tsx`, `app/page.tsx`)
7. Create global CSS file
8. Create ESLint configuration
9. Create README.md
10. Update Turborepo configuration if needed
11. Run `pnpm install` from root
12. Test development server
13. Test build process
14. Verify hot reload
15. Run type checking and linting
16. Commit and push

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
**Story Owner**: Developer
