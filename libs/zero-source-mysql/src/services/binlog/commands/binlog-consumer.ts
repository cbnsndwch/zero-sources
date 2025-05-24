import type { ResultSetHeader } from 'mysql2';
import Command, { CommandCallback } from 'mysql2/lib/commands/command.js';
import type Packet from 'mysql2/lib/packets/packet.js';

import type { BinlogStreamConnection } from '../binlog-stream.connection.js';
import BinlogDumpPacket from '../packets/binlog-dump.packet.js';

import type {
    BinlogEvent,
    BinlogEventHeader,
    BinlogParserMap
} from '../events/binlog-event.js';
import { makeRawEvent } from '../events/raw.event.js';

import { BinlogEventType } from '../events/binlog-event-type.js';
import { isNonBlockingFlags } from '../guards.js';
import { DEFAULT_PARSERS } from './default-parsers.js';

export type BinlogDumpOptions = {
    serverId?: number;
    filename?: string;
    binlogPos?: number;
    flags?: number;
};

export interface IBinlogEmitter {
    on(event: 'eof', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'event', listener: (event: BinlogEvent) => void): this;
    on(event: 'checksum', listener: (result: ResultSetHeader) => void): this;
    on(event: string, listener: (...args: unknown[]) => void): this;
}

export class BinlogConsumer extends Command implements IBinlogEmitter {
    #options: BinlogDumpOptions;
    #parsers: BinlogParserMap;

    #connection?: BinlogStreamConnection;

    constructor(opts: BinlogDumpOptions, parsers: BinlogParserMap = {}) {
        super();
        this.#options = opts || {};
        this.#parsers = {
            ...DEFAULT_PARSERS,
            ...parsers
        };

        this.onResult = err => this.#onError(err);
    }

    start(_packet?: Packet, connection?: BinlogStreamConnection) {
        const newPacket = new BinlogDumpPacket(this.#options);
        const buffer = newPacket.serialize();

        connection?.writePacket(buffer);

        return BinlogConsumer.prototype.onServerPacket as CommandCallback;
    }

    onServerPacket(packet: Packet) {
        // ok - continue consuming events
        // error - error
        // eof - end of binlog
        if (packet.isEOF()) {
            this.emit('eof');

            // if non-blocking, then close stream to prevent errors
            if (isNonBlockingFlags(this.#options.flags)) {
                this.#connection?.close();
            }

            return null;
        }

        // binlog event header
        packet.readInt8();

        const header = this.#parseHeader(packet);
        const makeEvent = this.#parsers[header.eventType] ?? makeRawEvent;

        const event = makeEvent({ useChecksum: true }, header, packet);
        this.emit('event', event);

        return BinlogConsumer.prototype.onServerPacket;
    }

    // #region Private Methods

    /**
     * Handles errors that occur during the binlog stream.
     *
     * @param err The error that occurred.
     */
    #onError(err: Error) {
        // DEBUG: inspect(err);
        this.emit('error', err);
    }

    /**
     * Parses the binlog event header from the packet.
     *
     * @param packet The packet containing the binlog event data.
     * @returns The parsed binlog event header.
     */
    #parseHeader(packet: Packet): BinlogEventHeader {
        const timestamp = packet.readInt32();
        const eventType = packet.readInt8() as BinlogEventType;
        const serverId = packet.readInt32();
        const eventSize = packet.readInt32();
        const logPos = packet.readInt32();
        const flags = packet.readInt16();

        return {
            timestamp,
            eventType,
            serverId,
            eventSize,
            logPos,
            flags
        };
    }

    // #endregion Private Methods
}
