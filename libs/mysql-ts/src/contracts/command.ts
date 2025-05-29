import type Connection from '../connection.js';

import type { IPacket } from './packet.js';

export type PacketHandler = (
    packet?: IPacket,
    connection?: Connection
) => Promise<PacketHandler | null>;

export interface ICommand {
    _commandName?: string;

    start: PacketHandler | null;

    next: PacketHandler | null;

    onError?: (error: Error) => void;

    stateName(): string;

    execute(packet: IPacket, connection: Connection): Promise<boolean>;

    // TODO: add more properties
}
