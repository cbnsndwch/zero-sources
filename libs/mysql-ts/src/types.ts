// Types for MySQL-TS helpers and commands

import type { PacketKind, Packet } from '../protocol-types.js';

export interface Packet {
  // TODO: Define packet structure (discriminated union for packet types)
  [key: string]: any;
}

export interface Command {
  execute(pkt: Packet): boolean | void;
  // Optionally, add more methods as needed for state, cleanup, etc.
}
