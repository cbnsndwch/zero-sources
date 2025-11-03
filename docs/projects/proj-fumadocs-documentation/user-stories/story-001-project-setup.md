# Story 001: Project Setup and Scaffolding

**Story ID**: FDS-STORY-001
**Epic**: [FDS-EPIC-001 - Initial Setup and Configuration](../epics/epic-001-initial-setup.md)
**Status**: Completed
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

Following Fumadocs best practices, we'll use **React Router** as our framework, which is one of the officially supported React.js frameworks for Fumadocs, alongside Fumadocs MDX as the content source.

## Acceptance Criteria

**Given** the zero-sources monorepo exists with Turborepo and pnpm
**When** I set up the Fumadocs project
**Then** I should have:

- [x] New directory `apps/docs` created with Fumadocs project structure
- [x] `package.json` with all required dependencies
- [x] TypeScript configured with strict type checking
- [x] React Router configured with proper routing structure
- [x] Vite configured as the build tool
- [x] Fumadocs core, UI, and MDX packages installed
- [x] Fumadocs excluded from Vite pre-bundling and added to `noExternal`
- [x] Project added to root `pnpm-workspace.yaml`
- [x] Project added to `turbo.json` with appropriate task configuration
- [x] `pnpm install` runs successfully from monorepo root
- [x] `pnpm dev --filter=docs` starts development server at `localhost:5173`
- [x] Hot module replacement works for content and code changes
- [x] TypeScript compilation succeeds with no errors
- [x] Basic "Hello World" page renders successfully

## Definition of Done

- [x] Fumadocs project created in `apps/docs` directory
- [x] All dependencies installed and versions locked
- [x] Integration with Turborepo verified (build and dev tasks work)
- [x] Integration with pnpm workspace verified
- [x] Local development server runs without errors
- [x] TypeScript compilation passes
- [x] Code review completed
- [x] Documentation for local setup written in `apps/docs/README.md`
- [x] No console errors or warnings in browser
- [x] Initial commit pushed to repository

## Technical Details

### Files to Create

#### `apps/docs/package.json`

```json
{
  "name": "@cbnsndwch/zero-sources-docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "fumadocs-core": "^16.0.0",
    "fumadocs-mdx": "^16.0.0",
    "fumadocs-ui": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/tsconfig": "workspace:*",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^4.0.0",
    "typescript": "~5.9.3",
    "vite": "^6.0.0"
  },
  "engines": {
    "node": ">=20"
  }
}
```

#### `apps/docs/tsconfig.json`

```json
{
  "extends": "@repo/tsconfig/react.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "src",
    "app",
    "content"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### `apps/docs/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactRouter } from '@react-router/dev/vite';

// Fumadocs dependencies that need special handling in Vite
const FumadocsDeps = ['fumadocs-core', 'fumadocs-ui', 'fumadocs-mdx'];

export default defineConfig({
  plugins: [
    reactRouter(),
    react(),
  ],
  resolve: {
    noExternal: FumadocsDeps,
  },
  optimizeDeps: {
    exclude: FumadocsDeps,
  },
});
```

#### `apps/docs/react-router.config.ts`

```typescript
import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'app',
  ssr: true,
} satisfies Config;
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

#### `apps/docs/postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### `apps/docs/app/root.tsx`

```typescript
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <RootProvider>{children}</RootProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
```

#### `apps/docs/app/routes/home.tsx`

```typescript
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'zero-sources Documentation' },
    { name: 'description', content: 'Welcome to the zero-sources documentation site' },
  ];
}

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
  "extends": "@repo/eslint-config/react.js"
}
```

#### `apps/docs/README.md`

```markdown
# zero-sources Documentation Site

This is the documentation website for the zero-sources monorepo, built with [Fumadocs](https://fumadocs.dev//).

## Development

Run the development server:

\`\`\`bash
pnpm dev
\`\`\`

The site will be available at [http://localhost:5173](http://localhost:5173).

## Building

Build the documentation site:

\`\`\`bash
pnpm build
\`\`\`

Preview the production build:

\`\`\`bash
pnpm preview
\`\`\`

## Project Structure

- `app/` - React Router routes and layouts
- `content/` - MDX documentation content
- `components/` - React components
- `public/` - Static assets

## Technology Stack

- **Framework**: React Router v7
- **Build Tool**: Vite
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Important Notes

This project uses Vite with React Router. Due to Vite's pre-bundling behavior, Fumadocs packages are configured to be excluded from pre-bundling and added to `noExternal` in `vite.config.ts`. This prevents React context errors as documented in the Fumadocs FAQ.
```

### Files to Modify

#### Update `pnpm-workspace.yaml` (root)

No changes needed if already includes `apps/*`

#### Update `turbo.json` (root)

Add docs-specific configuration for Vite build outputs:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        "dist/**",
        "lib/**",
        ".next/**",
        "!.next/cache/**",
        "build/**"
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
│   ├── root.tsx
│   ├── globals.css
│   └── routes/
│       └── home.tsx
├── content/
│   └── (initially empty)
├── components/
│   └── (initially empty)
├── public/
│   └── (initially empty)
├── .eslintrc.json
├── package.json
├── postcss.config.js
├── react-router.config.ts
├── README.md
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Testing Requirements

### Manual Testing

1. **Installation Test**:

   ```bash
   # From monorepo root
   pnpm install
   ```

   Expected: No errors, all dependencies installed

1. **Build Test**:

   ```bash
   pnpm build --filter=docs
   ```

   Expected: Build completes successfully, no TypeScript errors

1. **Development Server Test**:

   ```bash
   pnpm dev --filter=docs
   ```

   Expected: Server starts at `http://localhost:5173`, page loads showing "zero-sources Documentation"

1. **Hot Reload Test**:

   - Start dev server
   - Edit `apps/docs/app/routes/home.tsx`
   - Save file

   Expected: Page updates without full reload

1. **Type Checking Test**:

   ```bash
   cd apps/docs
   pnpm type-check
   ```

   Expected: No TypeScript errors

1. **Linting Test**:

   ```bash
   cd apps/docs
   pnpm lint
   ```

   Expected: No linting errors

### Verification Checklist

- [x] `pnpm install` completes without errors
- [x] `pnpm build --filter=docs` succeeds
- [x] `pnpm dev --filter=docs` starts server at port 5173
- [x] Home page loads with correct title
- [x] No console errors in browser
- [x] Hot module replacement works (Vite HMR)
- [x] TypeScript compilation passes
- [x] ESLint passes
- [x] All required files created
- [x] README.md documentation complete
- [x] Vite configuration properly excludes Fumadocs from pre-bundling

## Notes

- Use exact versions that are known to be compatible
- Fumadocs works with React Router v7 and React 19
- **Important**: Fumadocs packages must be excluded from Vite pre-bundling and added to `noExternal` to prevent React context errors (see [Fumadocs FAQ](https://fumadocs.dev//docs/ui#vite-context-error))
- React Router v7 uses file-based routing in the `app/routes` directory
- Keep Tailwind CSS configuration minimal initially
- Ensure consistent TypeScript configuration with rest of monorepo
- Test thoroughly before moving to next story
- Default Vite dev server runs on port 5173 (not 3000 like Next.js)

## Dependencies

### Blocks

- None (this is the first story)

### Blocked By

- None

## Related Documentation

- [Fumadocs Getting Started Guide](https://fumadocs.dev//docs/ui)
- [Fumadocs Manual Installation](https://fumadocs.dev//docs/ui/manual-installation)
- [Fumadocs with React Router](https://fumadocs.dev//docs/ui#automatic-installation)
- [React Router v7 Documentation](https://reactrouter.com/en/main)
- [Vite Configuration Guide](https://vitejs.dev/config/)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)

## Implementation Steps

1. Create `apps/docs` directory
1. Initialize `package.json` with React Router and Vite dependencies
1. Create TypeScript configuration for Vite/React
1. Create Vite configuration with Fumadocs exclusions
1. Create React Router configuration
1. Create Tailwind CSS configuration
1. Create React Router structure (`app/root.tsx`, `app/routes/home.tsx`)
1. Create global CSS file
1. Create ESLint configuration
1. Create README.md with React Router specific instructions
1. Update Turborepo configuration if needed
1. Run `pnpm install` from root
1. Test development server (port 5173)
1. Test build process
1. Verify hot reload (Vite HMR)
1. Run type checking and linting
1. Commit and push

---

**Created**: November 1, 2025
**Last Updated**: November 1, 2025
**Story Owner**: Developer
