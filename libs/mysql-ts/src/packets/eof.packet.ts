'use strict';

import type { IPacket } from '../contracts/packet.js';

import Packet from './packet.js';

// import TextRow from './text_row.js';
export class EOFPacket {
    static toPacket(warnings?: number, statusFlags?: number): IPacket {
        if (typeof warnings === 'undefined') {
            warnings = 0;
        }
        if (typeof statusFlags === 'undefined') {
            statusFlags = 0;
        }

        const buffer = Buffer.allocUnsafe(9);
        buffer.fill(0);

        const packet = new Packet(0, buffer, 0, 9);
        packet.offset = 4;
        packet.writeInt8(0xfe);
        packet.writeInt16(warnings);
        packet.writeInt16(statusFlags);
        packet._name = 'EOF';

        return packet;
    }
}
