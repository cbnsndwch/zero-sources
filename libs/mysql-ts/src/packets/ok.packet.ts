'use strict';

import type { IPacket } from '../contracts/packet.js';

import Packet from './packet.js';

type OKPacketArgs = {
    affectedRows?: number;
    insertId?: number;
    serverStatus?: number;
    warningCount?: number;
    message?: string;
};

export class OKPacket {
    static toPacket(encoding: string, args: OKPacketArgs = {}): IPacket {
        const {
            affectedRows = 0,
            insertId = 0,
            serverStatus = 0,
            warningCount = 0,
            message = ''
        } = args;

        let length = 9 + Packet.lengthCodedNumberLength(affectedRows);
        length += Packet.lengthCodedNumberLength(insertId);

        const buffer = Buffer.allocUnsafe(length);

        const packet = new Packet(0, buffer, 0, length);
        packet.offset = 4;
        packet.writeInt8(0);
        packet.writeLengthCodedNumber(affectedRows);
        packet.writeLengthCodedNumber(insertId);
        packet.writeInt16(serverStatus);
        packet.writeInt16(warningCount);
        packet.writeString(message, encoding);
        packet._name = 'OK';

        return packet;
    }
}
