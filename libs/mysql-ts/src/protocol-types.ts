// PacketKind: Enum for MySQL packet types, replacing magic numbers.
// This is a starting point; expand as needed for all protocol packets.

export enum PacketKind {
  OK = 0x00,
  ERR = 0xff,
  EOF = 0xfe,
  // ... add more as needed ...
}

// Example discriminated union for packets (expand as protocol requires)
export type Packet =
  | { kind: PacketKind.OK; payload: any }
  | { kind: PacketKind.ERR; payload: any }
  | { kind: PacketKind.EOF; payload: any }
  | { kind: PacketKind; payload: any };

// Command interface for dispatcher
export interface Command {
  execute(pkt: Packet): boolean | void;
  // Optionally, add more methods as needed for state, cleanup, etc.
}
