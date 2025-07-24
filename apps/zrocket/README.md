# ZRocket - Unified Chat Application

**A React Router 7 + NestJS chat application showcasing Zero discriminated union tables**

This is a unified application that combines both the frontend (React Router 7) and backend (NestJS) in a single deployable app, demonstrating the power of discriminated union tables with MongoDB as the change source.

## Architecture

- **Frontend**: React Router 7 with Tailwind CSS and Radix UI components
- **Backend**: NestJS with MongoDB integration
- **Real-time**: WebSocket-based Zero synchronization with discriminated union routing
- **Development**: Concurrent development servers for both frontend and backend

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

## Development Commands

- `pnpm run dev` - Start both API and frontend servers
- `pnpm run dev:api` - Start only the NestJS API server
- `pnpm run dev:zero` - Start Zero Cache with discriminated schema
- `pnpm run build` - Build both API and frontend for production
- `pnpm run start` - Start production server

For more details, see the main repository README.
