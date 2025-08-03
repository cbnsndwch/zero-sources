# ZRocket - Unified Chat Application

**A React Router 7 + NestJS chat application showcasing Zero discriminated union tables**

This is a unified application that combines both the frontend (React Router 7) and backend (NestJS) in a single deployable app, demonstrating the power of discriminated union tables with MongoDB as the change source.

## Architecture

- **Frontend**: React Router 7 with Tailwind CSS and Radix UI components
- **Backend**: NestJS with MongoDB integration
- **Real-time**: WebSocket-based Zero synchronization with discriminated union routing
- **Development**: Concurrent development servers for both frontend and backend

## Discriminated Union Tables

ZRocket demonstrates how multiple Zero tables can map to the same MongoDB collections:

**Room Tables** (all from `rooms` collection):

- `chatsTable` → Direct messages with filter `{ t: 'd' }`
- `channelsTable` → Public channels with filter `{ t: 'c' }`
- `groupsTable` → Private groups with filter `{ t: 'p' }`

**Message Tables** (all from `messages` collection):

- `messages` → User messages with filter `{ t: { $exists: false } }`
- `systemMessages` → System messages with filter `{ t: { $exists: true } }`

Each table uses separate `TableMapping` configurations to specify source collection, filters, and field projections.

## Quick Start

1. **Start Zero Cache:**

    ```bash
    pnpm run dev:zero
    ```

2. **Start Development Servers:**

    ```bash
    pnpm run dev
    ```

    This starts both the NestJS API and React Router server

3. **Seed Data:**

    ```bash
    curl -X POST http://localhost:8011/zrocket/seed-data
    ```

4. **Access the App:**
    - Frontend: http://localhost:8011
    - API: http://localhost:8011/api
    - API Docs: http://localhost:8011/api-docs

## Rich Message Composer

ZRocket includes Lexical editor packages for building rich text message composition capabilities:

### Installed Lexical Packages

- **Core**: `lexical` - Core editor functionality
- **React**: `@lexical/react` - React bindings and components
- **Rich Text**: `@lexical/rich-text` - Rich text formatting support
- **History**: `@lexical/history` - Undo/redo functionality
- **Lists**: `@lexical/list` - Ordered and unordered lists
- **Links**: `@lexical/link` - Link insertion and editing
- **Utils**: `@lexical/utils` - Utility functions and helpers

### Version Information

All Lexical packages are pinned to version `^0.33.1` for consistency and compatibility.

### Usage Example

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
```

## Development Commands

- `pnpm run dev` - Start both API and frontend servers
- `pnpm run dev:api` - Start only the NestJS API server
- `pnpm run dev:zero` - Start Zero Cache with discriminated schema
- `pnpm run build` - Build both API and frontend for production
- `pnpm run start` - Start production server

For more details, see the main repository README.
