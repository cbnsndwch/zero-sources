// ErrorChannel: Centralizes all error handling, cleanup, and event emission for the connection.
// Inspired by node-mysql2's error handling, but extracted for clarity and testability.

export interface ErrorChannel {
  /**
   * Handles a fatal error: marks connection closed, clears timeouts, drains command queue, destroys socket, emits 'error'.
   * Should never return.
   */
  fatal(err: Error): never;

  /**
   * Handles a protocol error: emits protocol error, may close connection.
   * Should never return.
   */
  protocol(msg: string, code?: string): never;

  /**
   * Handles a network error: emits network error, may close connection.
   * Should never return.
   */
  net(err: NodeJS.ErrnoException): never;
}

// Example stub implementation for development/testing.
export class DefaultErrorChannel implements ErrorChannel {
  fatal(err: Error): never {
    // ... mark connection closed, cleanup, emit error ...
    throw err;
  }
  protocol(msg: string, code?: string): never {
    // ... emit protocol error ...
    throw new Error(`Protocol error: ${msg}${code ? ` [${code}]` : ''}`);
  }
  net(err: NodeJS.ErrnoException): never {
    // ... emit network error ...
    throw err;
  }
}
