import Packet from 'mysql2/lib/packets/packet.js';

import type { BinlogDumpOptions } from '../commands/binlog-consumer.js';

const COMMAND_BINLOG_DUMP = 0x12;

// TODO: add flag to constants
// 0x01 - BINLOG_DUMP_NON_BLOCK
// send EOF instead of blocking

export default class BinlogDumpPacket {
    binlogPos: number;
    serverId: number;
    flags: number;
    filename: string;

    constructor(opts: BinlogDumpOptions) {
        this.binlogPos = opts.binlogPos || 0;
        this.serverId = opts.serverId || 0;
        this.flags = opts.flags || 0;
        this.filename = opts.filename || '';
    }

    serialize() {
        // TODO: should be ascii?
        const length = 15 + Buffer.byteLength(this.filename, 'utf8');

        const buffer = Buffer.allocUnsafe(length);
        const packet = new Packet(0, buffer, 0, length);

        packet.offset = 4;
        packet.writeInt8(COMMAND_BINLOG_DUMP);
        packet.writeInt32(this.binlogPos);
        packet.writeInt16(this.flags);
        packet.writeInt32(this.serverId);
        packet.writeString(this.filename, 'utf8');

        return packet;
    }
}
