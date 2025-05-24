import type Packet from 'mysql2/lib/packets/packet.js';

import type { BinlogEventBase, BinlogEventHeader, MakeBinlogEventOptions } from './binlog-event.js';
import { BINLOG_EVENT_ROTATE } from './binlog-event-type.js';

export type BinlogEventRotateData = {
    position: number;
    nextBinlog: string;
};

export type BinlogEventRotate = BinlogEventBase<
    'ROTATE',
    typeof BINLOG_EVENT_ROTATE,
    BinlogEventRotateData
>;

export function makeRotateEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventRotate {
    const position = packet.readInt32();

    // skip 4 bytes
    packet.readInt32();

    const nextBinlog = packet.readString('utf8');

    return {
        name: 'ROTATE',
        type: BINLOG_EVENT_ROTATE,
        header,
        data: {
            position,
            nextBinlog
        }
    };
}
