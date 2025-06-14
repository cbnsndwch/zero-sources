// Typed state machine base for MySQL-TS commands
// This replaces the prototype-based state machine pattern from node-mysql2 for clarity and type safety.

import type { Packet } from './protocol-types.js';

export type StateFn<Ctx> = (pkt: Packet, ctx: Ctx) => State<Ctx>;

export interface State<Ctx> {
  name: string;
  run: StateFn<Ctx>;
}

// Example usage for a command:
// class QueryCommand implements Command {
//   private state: State<this> = states.awaitingHeader;
//   execute(pkt: Packet) {
//     this.state = this.state.run(pkt, this);
//   }
// }
