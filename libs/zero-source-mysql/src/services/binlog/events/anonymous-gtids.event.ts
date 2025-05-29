import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_ANONYMOUS_GTID } from './binlog-event-type.js';
import { invariant } from '@cbnsndwch/zero-contracts';

export type BinlogEventAnonymousGtidData = {
    /**
     * The GTID flags (1 byte)
     */
    flags: number;

    /**
     * Server ID (UUID, 16 bytes)
     */
    serverId: string;

    /**
     * The GTID group number (8 bytes)
     */
    groupNumber: string;
};

export type BinlogEventAnonymousGtid = BinlogEventBase<
    'ANONYMOUS_GTID',
    typeof BINLOG_EVENT_ANONYMOUS_GTID,
    BinlogEventAnonymousGtidData
>;

/**
 * Parses a ANONYMOUS_GTID event from the binlog.
 *
 * @param options Binlog stream options
 * @param header Event header
 * @param packet Binary packet parser
 * @returns
 */
export async function makeAnonymousGtidEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): Promise<BinlogEventAnonymousGtid> {
    const bufferLen =
        packet.end - packet.offset - 4 - (options.useChecksum ? 4 : 0);

    invariant(
        bufferLen >= 25,
        'ANONYMOUS_GTID event is too short, expected 25 bytes (not counting CRC32)'
    );

    // 1-byte flags
    const flags = packet.readInt8();

    // read 16 bytes SID (a UUID)
    const serverId = packet.readUUID();

    // 8-byte group number
    const groupNumberBuffer = packet.readBuffer(8);
    const groupNumber = groupNumberBuffer.toString('hex');

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    return {
        name: 'ANONYMOUS_GTID',
        type: BINLOG_EVENT_ANONYMOUS_GTID,
        header,
        data: {
            flags,
            serverId,
            groupNumber
        },
        checksum
    };
}
