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
    Buffer
>;

export async function makeRawEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): Promise<BinlogEventRaw> {
    const dataLength =
        packet.end - packet.offset - (options.useChecksum ? 4 : 0);
    const data = packet.readBuffer(dataLength);

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    return {
        name: 'RAW',
        type: BINLOG_EVENT_RAW,
        header,
        data,
        checksum
    };
}
