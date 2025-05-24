import Packet from 'mysql2/lib/packets/packet.js';
import { BINLOG_EVENT_RAW, type BinlogEventType } from './binlog-event-type.js';

import type { BinlogEventFormatDescription } from './format-description.event.js';
import type { BinlogEventQuery } from './query.event.js';
import type { BinlogEventRaw } from './raw.event.js';
import type { BinlogEventRotate } from './rotate.event.js';
import type { BinlogEventXid } from './xid.event.js';

export type BinlogEventHeader = {
    timestamp: number;
    eventType: BinlogEventType;
    serverId: number;
    eventSize: number;
    logPos: number;
    flags: number;
};

export type BinlogEventBase<
    EventName,
    EventType extends BinlogEventType | typeof BINLOG_EVENT_RAW,
    EventData
> = {
    /**
     * The event type numeric code.
     *
     * @see {@link BinlogEventType}
     */
    type: EventType;

    /**
     * The event type name.
     */
    name: EventName;

    /**
     * The parsed event header.
     */
    header: BinlogEventHeader;

    /**
     * The parsed event data. Depends on the concrete event type.
     */
    data: EventData;
};

export type BinlogEvent =
    | BinlogEventRaw
    | BinlogEventQuery
    | BinlogEventXid
    | BinlogEventRotate
    | BinlogEventFormatDescription;
// | BinlogEventTableMap
// | BinlogEventRows
// | BinlogEventGtid
// | BinlogEventHeartbeat
// | BinlogEventUserVar
// | BinlogEventAnomaly
// | BinlogEventUnknown;

export type MakeBinlogEventOptions = {
    useChecksum?: boolean;
};

export type MakeBinlogEvent = (
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
) => BinlogEvent;

export type BinlogParserMap = Partial<Record<BinlogEventType, MakeBinlogEvent>>;
