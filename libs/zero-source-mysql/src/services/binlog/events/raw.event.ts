import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';

import { BINLOG_EVENT_RAW } from './binlog-event-type.js';

export type BinlogEventRaw = BinlogEventBase<
    'RAW',
    typeof BINLOG_EVENT_RAW,
    Packet
>;

export function makeRawEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventRaw {
    return {
        name: 'RAW',
        type: BINLOG_EVENT_RAW,
        header,
        data: packet
    };
}
