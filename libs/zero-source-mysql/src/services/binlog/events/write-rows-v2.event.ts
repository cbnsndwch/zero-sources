import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_WRITE_ROWS_V2 } from './binlog-event-type.js';
import { invariant } from '@cbnsndwch/zero-contracts';

export type BinlogEventWriteRowsV2Data = {
    tableId: number;
    flags: number;
    extraDataLength?: number;
    extraData?: Buffer;
    numberOfColumns: number;
    columnsPresentBitmap: Buffer;
    rows: unknown[];
};

export type BinlogEventWriteRowsV2 = BinlogEventBase<
    'WRITE_ROWS_V2',
    typeof BINLOG_EVENT_WRITE_ROWS_V2,
    BinlogEventWriteRowsV2Data
>;

export function makeWriteRowsV2Event(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventWriteRowsV2 {
    // parse tableId (6 bytes, little-endian)
    const tableId = packet.readBuffer(6).readUintLE(0, 6);

    // parse flags (2 bytes)
    const flags = packet.readInt16();

    // for v2, extraDataLength (2 bytes) and extraData
    const extraDataLength = packet.readInt16();
    const extraData = packet.readBuffer(extraDataLength - 2);

    // number of columns (length-encoded integer)
    const numberOfColumns = packet.readLengthCodedNumber();
    invariant(
        typeof numberOfColumns === 'number' && !isNaN(numberOfColumns),
        'Invalid numberOfColumns in WRITE_ROWS_V2 event'
    );

    // columns-present bitmap
    const columnsBitmapSize = Math.floor((numberOfColumns + 7) / 8);
    const columnsPresentBitmap = packet.readBuffer(columnsBitmapSize);

    // parse rows
    const rows: unknown[] = [];
    const checksumLen = options.useChecksum ? 4 : 0;

    // look up TableMap for this tableId
    const tableMap = options.tables?.get(BigInt(tableId));

    // Helper to parse a single row (placeholder, implement as needed)
    function parseRow(
        packet: Packet,
        tableMap: unknown,
        columnsPresentBitmap: Buffer
    ): unknown {
        // Arguments are intentionally unused for now; will be used in actual implementation
        void packet;
        void tableMap;
        void columnsPresentBitmap;
        // TODO: Implement actual row parsing logic using tableMap and columnsPresentBitmap
        return {};
    }

    if (tableMap) {
        while (packet.offset < packet.end - checksumLen) {
            const row = parseRow(packet, tableMap, columnsPresentBitmap);
            rows.push(row);
        }
    } else {
        // If no tableMap, skip row parsing
    }

    // finally, skip 4 bytes for checksum if needed
    const checksum = checksumLen ? packet.readInt32() : undefined;

    return {
        name: 'WRITE_ROWS_V2',
        type: BINLOG_EVENT_WRITE_ROWS_V2,
        header,
        data: {
            tableId,
            flags,
            extraDataLength,
            extraData,
            numberOfColumns,
            columnsPresentBitmap,
            rows
        },
        checksum
    };
}
