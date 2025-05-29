'use strict';

import { WithImplicitCoercion } from 'node:buffer';

import type { IPacket } from '../contracts/packet.js';
import type { ErrorCode } from '../constants/errors.js';

import Packet from './packet.js';
import ErrorCodeToName from '../constants/errors.js';

type ErrorPacketArgs = {
    code: number;
    message: WithImplicitCoercion<string>;
};

export class ErrorPacket {
    readonly code: ErrorCode;
    readonly error: string;
    readonly message: string;

    private constructor(
        code: ErrorCode,
        message: WithImplicitCoercion<string>
    ) {
        this.code = code;
        this.error = ErrorCodeToName[code] || 'Unknown Error';        this.message = String(message);
    }

    static toPacket(encoding: string, args: ErrorPacketArgs): IPacket {
        const msg = String(args.message);

        const length = 13 + Buffer.byteLength(msg, 'utf8');
        const packet = new Packet(0, Buffer.allocUnsafe(length), 0, length);
        packet.offset = 4;
        packet.writeInt8(0xff);
        packet.writeInt16(args.code);

        // TODO: sql state parameter
        packet.writeString('#_____', encoding);
        packet.writeString(msg, encoding);
        packet._name = 'Error';

        return packet;
    }

    static fromPacket(packet: IPacket) {
        packet.readInt8(); // marker

        const code = packet.readInt16();

        // the sql state marker
        // packet.readString(1, 'ascii');
        packet.skip(1);

        // The SQL state of the ERR_Packet which is always 5 bytes long (ignore for now)
        // https://dev.mysql.com/doc/dev/mysql-server/8.0.11/page_protocol_basic_dt_strings.html#sect_protocol_basic_dt_string_fix
        // packet.readString(5, 'ascii');
        packet.skip(5);

        const message = packet.readNullTerminatedString('utf8');

        return new ErrorPacket(code as ErrorCode, message);
    }
}
