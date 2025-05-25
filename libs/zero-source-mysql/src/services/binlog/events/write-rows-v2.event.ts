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
    // Parse tableId (6 bytes, little-endian)
    const tableId = packet.readBuffer(6).readUintLE(0, 6);

    // Parse flags (2 bytes)
    const flags = packet.readInt16();

    // For v2, extraDataLength (2 bytes) and extraData
    const extraDataLength = packet.readInt16();
    const extraData = packet.readBuffer(extraDataLength - 2);

    // Number of columns (length-encoded integer)
    const numberOfColumns = packet.readLengthCodedNumber();
    invariant(
        typeof numberOfColumns === 'number' && !isNaN(numberOfColumns),
        'Invalid numberOfColumns in WRITE_ROWS_V2 event'
    );

    // Columns-present bitmap
    const columnsBitmapSize = Math.floor((numberOfColumns + 7) / 8);
    const columnsPresentBitmap = packet.readBuffer(columnsBitmapSize);

    // Parse rows
    const rows: unknown[] = [];

    const checksumLen = options.useChecksum ? 4 : 0;

    // The actual row parsing logic depends on the tableMap, which should be
    // available in the consumer context. Here, we use a placeholder. You should
    // replace this with your actual row parsing logic.
    while (packet.offset < packet.end - checksumLen) {
        // TODO: Implement row parsing using tableMap and columnsPresentBitmap
        // Example: const row = parseRow(packet, tableMap, columnsPresentBitmap);
        // rows.push(row);
        break; // Remove this break when row parsing is implemented
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
