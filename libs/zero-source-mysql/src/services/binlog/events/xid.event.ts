import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_XID } from './binlog-event-type.js';

export type BinlogEventXidData = {
    /**
     *
     */
    binlogVersion: number;

    /**
     * The transaction ID
     */
    xid: number;
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
    const binlogVersion = packet.readInt16();
    const xid = packet.readInt64() as number;

    return {
        name: 'XID',
        type: BINLOG_EVENT_XID,
        header,
        data: {
            binlogVersion,
            xid
        }
    };
}
