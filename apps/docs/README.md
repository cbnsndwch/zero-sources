# zero-sources Documentation

This is the documentation site for the zero-sources project, built with React Router v7, Vite, and Fumadocs.

## Development

Install dependencies from the monorepo root:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev --filter=docs
```

The site will be available at `http://localhost:5173`.

## Build

Build the production site:

```bash
pnpm build --filter=docs
```

## Technology Stack

- **React Router v7**: File-based routing with SSR support
- **Vite 6**: Fast build tool with HMR
- **Fumadocs 16**: Documentation framework with React Router support
- **Tailwind CSS 4**: Utility-first CSS framework
- **TypeScript 5.9**: Type-safe development

## Project Structure

```
apps/docs/
├── app/                    # Application code
│   ├── routes/            # Route components
│   ├── root.tsx           # Root layout
│   └── globals.css        # Global styles
├── content/               # MDX documentation content
├── components/            # Reusable React components
├── public/                # Static assets
├── vite.config.ts         # Vite configuration
└── react-router.config.ts # React Router configuration
```

## Next Steps

1. Add documentation content to `content/` directory
2. Configure theme and navigation in `app/root.tsx`
3. Set up search functionality
4. Deploy to production

For more details, see the [PRD](../../docs/projects/fumadocs-with-react-router/PRD.md) and [implementation stories](../../docs/projects/fumadocs-with-react-router/implementation-plan/).
