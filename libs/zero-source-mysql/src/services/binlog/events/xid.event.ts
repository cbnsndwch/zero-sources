import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_XID } from './binlog-event-type.js';

export type BinlogEventXidData = {
    /**
     * The transaction ID
     */
    xid: bigint;
};

export type BinlogEventXid = BinlogEventBase<
    'XID',
    typeof BINLOG_EVENT_XID,
    BinlogEventXidData
>;

export function makeXidEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventXid {
    const xid = packet.readUInt64();

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    return {
        name: 'XID',
        type: BINLOG_EVENT_XID,
        header,
        data: {
            xid
        },
        checksum
    };
}
