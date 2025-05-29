'use strict';

import * as ClientConstants from '../constants/client.js';

import type { IPacket } from '../contracts/packet.js';

import Packet from './packet.js';

export class SSLRequestPacket {
    clientFlags: number;
    charset: number;

    constructor(flags: number, charset: number) {
        this.clientFlags = flags | ClientConstants.SSL;
        this.charset = charset;
    }

    toPacket(): IPacket {
        const length = 36;
        const buffer = Buffer.allocUnsafe(length);
        buffer.fill(0);

        const packet = new Packet(0, buffer, 0, length);
        packet.offset = 4;
        packet.writeInt32(this.clientFlags);

        // max packet size. todo: move to config
        packet.writeInt32(0);

        packet.writeInt8(this.charset);

        return packet;
    }
}
