import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_FORMAT_DESCRIPTION } from './binlog-event-type.js';

export type BinlogEventFormatDescriptionData = {
    /**
     *
     */
    binlogVersion: number;

    /**
     *
     */
    serverVersion: string;

    /**
     *
     */
    createTimestamp: number;

    /**
     *
     * @remarks should always be 19
     */
    eventHeaderLength: number;

    /**
     *
     */
    eventsLength: Buffer;
};

export type BinlogEventFormatDescription = BinlogEventBase<
    'FORMAT_DESCRIPTION',
    typeof BINLOG_EVENT_FORMAT_DESCRIPTION,
    BinlogEventFormatDescriptionData
>;

export function makeFormatDescriptionEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventFormatDescription {
    const binlogVersion = packet.readInt16();

    // eslint-disable-next-line no-control-regex
    const serverVersion = packet.readString(50, 'utf8').replace(/\u0000.*/, '');
    const createTimestamp = packet.readInt32();

    // should be 19
    const eventHeaderLength = packet.readInt8();

    const eventsLength = packet.readBuffer();

    const data: BinlogEventFormatDescriptionData = {
        binlogVersion,
        serverVersion,
        createTimestamp,
        eventHeaderLength,
        eventsLength
    };

    return {
        type: BINLOG_EVENT_FORMAT_DESCRIPTION,
        name: 'FORMAT_DESCRIPTION',
        header,
        data
    };
}
