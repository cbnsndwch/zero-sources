# Todo Example - MongoDB Change Source Demo

A simple todo application demonstrating how to integrate MongoDB with Zero's change source capabilities. This example shows how to build a real-time todo app with automatic synchronization using Zero's change streams.

## Features

- ✅ **CRUD Operations**: Create, read, update, and delete todos
- 🔄 **Real-time Sync**: Automatic synchronization via MongoDB change streams
- 📊 **Priority Management**: Set priorities (low, medium, high) 
- 📅 **Due Dates**: Optional due date tracking
- ✅ **Status Tracking**: Mark todos as completed/incomplete
- 🔍 **Filtering**: Filter by completion status and priority
- 📚 **API Documentation**: Built-in Swagger documentation
- 🧪 **Validation**: Input validation with class-validator

## Architecture

This example demonstrates:

1. **MongoDB Integration**: Using Mongoose schemas with validation
2. **Zero Change Source**: Real-time change streaming from MongoDB
3. **NestJS Framework**: Modular, scalable backend architecture
4. **WebSocket Gateway**: Real-time communication via WebSockets
5. **Watermark Management**: SQLite-based watermark storage for reliable resumption

## Quick Start

### Prerequisites

- Node.js 22+
- MongoDB running locally or remotely
- PNPM package manager

### Installation & Setup

1. **Install dependencies** (from repository root):
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cd apps/todo-example
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

3. **Build the application**:
   ```bash
   # From repository root
   pnpm build:libs
   
   # From todo-example directory
   pnpm build
   ```

4. **Start the server**:
   ```bash
   pnpm dev
   ```

The server will start on `http://localhost:3001` with:
- 🔗 **API Endpoints**: `http://localhost:3001/todos`
- 📚 **Swagger Docs**: `http://localhost:3001/api`
- 🔄 **Change Stream**: `ws://localhost:3001/changes/v0/stream`

## API Endpoints

### Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/todos` | Get all todos (supports filtering) |
| `GET` | `/todos/:id` | Get a specific todo |
| `POST` | `/todos` | Create a new todo |
| `PUT` | `/todos/:id` | Update a todo |
| `PATCH` | `/todos/:id/toggle` | Toggle completion status |
| `DELETE` | `/todos/:id` | Delete a todo |

### Query Parameters

- `?completed=true/false` - Filter by completion status
- `?priority=low/medium/high` - Filter by priority

### Example Usage

**Create a todo:**
```bash
curl -X POST http://localhost:3001/todos \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Learn Zero change sources",
    "description": "Build a todo app with MongoDB integration",
    "priority": "high",
    "dueDate": "2025-07-01T00:00:00.000Z"
  }'
```

**Get all todos:**
```bash
curl http://localhost:3001/todos
```

**Toggle completion:**
```bash
curl -X PATCH http://localhost:3001/todos/{id}/toggle
```

## Zero Integration

This example showcases Zero's MongoDB change source with:

### 1. Change Stream Configuration

The app configures MongoDB change streams to watch the `todos` collection and automatically convert MongoDB change events into Zero protocol messages.

### 2. Real-time Synchronization

Any changes to todos (create, update, delete) are automatically streamed to connected Zero clients via WebSocket.

### 3. Watermark Management

Uses SQLite-based watermark storage to track synchronization state, enabling reliable resumption after disconnections.

### 4. Schema Mapping

Demonstrates how to map MongoDB/Mongoose schemas to Zero table specifications for proper change stream processing.

## Development

### Project Structure

```
src/
├── entities/           # Mongoose schemas with validation
│   └── todo.entity.ts
├── todos/              # Todo business logic
│   ├── dto/           # Data transfer objects
│   ├── todo.controller.ts
│   ├── todo.service.ts
│   └── todo.module.ts
├── zero/              # Zero schema definitions
│   └── schema.ts
├── app.module.ts      # Main application module
└── main.ts           # Application entry point
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Linting & Formatting

```bash
# Lint code
pnpm lint

# Format code
pnpm format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/todo-example` |
| `ZERO_STREAMER_TOKEN` | Authentication token for Zero streams | (optional) |
| `WATERMARK_DB_PATH` | SQLite database path for watermarks | `./todo-watermarks.db` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `debug` |
| `CORS_ORIGIN` | CORS origins | `http://localhost:3000,http://localhost:5173` |

## Next Steps

This basic example can be extended with:

- 🔐 **Authentication**: Add user authentication and authorization
- 👥 **Multi-user**: Support for user-specific todos
- 🏷️ **Categories**: Add todo categories or tags
- 📱 **Frontend**: Build a React/Vue frontend using Zero client
- 🔄 **Offline Support**: Add offline-first capabilities with Zero
- 📊 **Analytics**: Track todo completion metrics
- 🔔 **Notifications**: Add due date reminders

## Learn More

- [Zero Documentation](https://zero.rocicorp.dev/)
- [MongoDB Change Streams](https://docs.mongodb.com/manual/changeStreams/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
