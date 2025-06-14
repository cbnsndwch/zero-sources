// Example of a type-safe QueryCommand using the new state machine pattern
// This is a scaffold for future command refactors

import type { Packet } from './protocol-types.js';
import type { State } from './typed-state-machine.js';

export class QueryCommand {
  private state: State<this>;

  constructor(initialState: State<QueryCommand>) {
    this.state = initialState;
  }

  execute(pkt: Packet): boolean {
    this.state = this.state.run(pkt, this);
    // Return true if the state machine handled the packet
    return true;
  }

  // Add more command-specific logic as needed
}

// Example state definitions (to be expanded for real protocol logic)
export const states = {
  awaitingHeader: {
    name: 'awaitingHeader',
    run(pkt: Packet, ctx: QueryCommand) {
      // ... handle header ...
      return states.readingRows;
    }
  },
  readingRows: {
    name: 'readingRows',
    run(pkt: Packet, ctx: QueryCommand) {
      // ... handle row ...
      return states.readingRows;
    }
  }
};
