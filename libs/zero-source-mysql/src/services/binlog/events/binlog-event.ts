import type Packet from 'mysql2/lib/packets/packet.js';
import type { BINLOG_EVENT_RAW, BinlogEventType } from './binlog-event-type.js';

import type { BinlogEventAnonymousGtid } from './anonymous-gtids.event.js';
import type { BinlogEventFormatDescription } from './format-description.event.js';
import type { BinlogEventPreviousGtids } from './previous-gtids.event.js';
import type { BinlogEventQuery } from './query.event.js';
import type { BinlogEventRaw } from './raw.event.js';
import type { BinlogEventRotate } from './rotate.event.js';
import type { BinlogEventTableMap } from './table-map.event.js';
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

    /**
     * If checksum is used, this is the checksum value.
     */
    checksum?: number | undefined;
};

export type BinlogEvent =
    // | BinlogEventAnomaly
    | BinlogEventAnonymousGtid
    | BinlogEventFormatDescription
    // | BinlogEventGtid
    // | BinlogEventHeartbeat
    | BinlogEventPreviousGtids
    | BinlogEventQuery
    | BinlogEventRaw
    | BinlogEventRotate
    // | BinlogEventRows
    | BinlogEventTableMap
    // | BinlogEventUnknown
    // | BinlogEventUserVar
    | BinlogEventXid;

export type MakeBinlogEventOptions = {
    useChecksum?: boolean;
};

export type MakeBinlogEvent = (
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
) => BinlogEvent;

export type BinlogParserMap = Partial<Record<BinlogEventType, MakeBinlogEvent>>;
