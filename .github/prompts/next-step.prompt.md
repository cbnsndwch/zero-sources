# Fumadocs Documentation Project - Ready for Story 002

## Context

We are implementing a Fumadocs-based documentation site for the zero-sources monorepo. Story 001 (Project Setup) is **COMPLETE** and merged to main.

## Story 001 Summary (COMPLETED)

Successfully scaffolded the Fumadocs documentation project in apps/docs/ with the following stack:

### Technology Stack
- Framework: React Router v7 (file-based routing with SSR)
- Build Tool: Vite 6
- Documentation: Fumadocs v16 (core, UI, MDX)
- Styling: Tailwind CSS v4 (using @import syntax, no config file)
- Language: TypeScript 5.9

### Key Implementation Details

1. Package Configuration (apps/docs/package.json)
   - Dependencies: @react-router/node, fumadocs-core, fumadocs-mdx, fumadocs-ui, react, react-router
   - DevDependencies: @react-router/dev, @tailwindcss/vite, vite
   - Scripts: dev, build, preview, format, lint, type-check, types

2. Vite Configuration (vite.config.ts)
   - Plugins: tailwindcss(), reactRouter()
   - CRITICAL: Fumadocs packages in noExternal and optimizeDeps.exclude to prevent React context errors

3. TypeScript Configuration (tsconfig.json)
   - Follows React Router v7 framework mode recommendations
   - Key settings: rootDirs includes .react-router/types, paths for ~/* alias, verbatimModuleSyntax

4. React Router Setup
   - app/routes.ts: Route configuration
   - app/root.tsx: Root layout with RootProvider from fumadocs-ui/provider/react-router
   - app/routes/home.tsx: Basic home page

5. Tailwind CSS v4
   - app/globals.css: Uses @import directives
   - NO tailwind.config.ts or postcss.config.js needed

### Verification Status
- Dev server runs successfully
- TypeScript compilation passes
- Hot reload works
- All dependencies installed
- Integration with monorepo verified

## Next: Story 002 - Theme Configuration

Story ID: FDS-STORY-002
Epic: FDS-EPIC-001 - Initial Setup and Configuration
File: docs/projects/proj-fumadocs-documentation/user-stories/story-002-theme-configuration.md

### What Story 002 Entails
- Theme customization (colors, typography, layout)
- Documentation layout component (DocsLayout from Fumadocs UI)
- Navigation structure (sidebar, header)
- Dark/light mode toggle
- Responsive design

### Key Files to Work With
- app/root.tsx - Update RootProvider configuration
- app/layout.tsx or similar - Create docs layout
- app/globals.css - Add theme customizations using CSS variables

### Important Considerations
- Use Fumadocs UI React Router-specific components
- Follow Tailwind v4 CSS variable customization
- Ensure theme works with both light and dark modes

## Commands for Next Session

# Start dev server
pnpm --filter=docs dev

# Type checking
pnpm --filter=docs types

# Format code
pnpm --filter=docs format

## Branch Strategy
Create a new branch for Story 002:
git checkout -b fds/theme-configuration
