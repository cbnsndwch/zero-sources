import type Packet from 'mysql2/lib/packets/packet.js';
import type { BINLOG_EVENT_RAW, BinlogEventType } from './binlog-event-type.js';
import type { BinlogEventTableMap, BinlogEventTableMapData } from './table-map.event.js';

import type { BinlogEventAnonymousGtid } from './anonymous-gtids.event.js';
import type { BinlogEventFormatDescription } from './format-description.event.js';
import type { BinlogEventPreviousGtids } from './previous-gtids.event.js';
import type { BinlogEventQuery } from './query.event.js';
import type { BinlogEventRaw } from './raw.event.js';
import type { BinlogEventRotate } from './rotate.event.js';
import type { BinlogEventXid } from './xid.event.js';
import { BinlogEventWriteRowsV2 } from './write-rows-v2.event.js';
import type { SchemaDiscoveryService } from '../schema-discovery.service.js';

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
    | BinlogEventWriteRowsV2
    | BinlogEventXid;

export type MakeBinlogEventOptions = {
    /**
     * Whether the server will send checksums for binlog events. If true, binlog
     * events will include a 4-byte trailer containing the CRC32 checksum of the
     * event data, which event processors must account for when parsing the
     * event. e.g.: by treating the packet's `end` marker as being 4 bytes
     * before the actual end of the event, and by collecting the checksum for
     * further processing downstream.
     */
    useChecksum?: boolean;

    /**
     * Map of tableId to TableMap event data, used for row events.
     */
    tables?: Map<bigint, BinlogEventTableMapData>;

    /**
     * Optional schema discovery service for column name lookup.
     */
    schemaDiscovery?: SchemaDiscoveryService | undefined;
};

export type MakeBinlogEvent = (
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
) => Promise<BinlogEvent>;

export type BinlogParserMap = Partial<Record<BinlogEventType, MakeBinlogEvent>>;
