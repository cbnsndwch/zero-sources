// PacketDispatcher: Routes packets to the current command and manages command switching.
// Inspired by node-mysql2's command dispatch logic, but extracted for clarity and testability.

import type { Command } from './protocol-types.js';

export class PacketDispatcher {
  private currentCommand: Command | null = null;

  /**
   * Sets the current command to dispatch packets to.
   */
  setCurrent(cmd: Command): void {
    this.currentCommand = cmd;
  }

  /**
   * Dispatches a packet to the current command, if any.
   * Returns true if a command handled the packet, false otherwise.
   */
  dispatch(pkt: any): boolean {
    if (this.currentCommand && typeof this.currentCommand.execute === 'function') {
      return !!this.currentCommand.execute(pkt);
    }
    return false;
  }

  /**
   * Clears the current command (e.g., after completion or error).
   */
  clear(): void {
    this.currentCommand = null;
  }

  /**
   * Returns the current command, if any.
   */
  get current(): Command | null {
    return this.currentCommand;
  }
}
