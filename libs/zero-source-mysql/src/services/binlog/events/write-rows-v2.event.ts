import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_WRITE_ROWS_V2 } from './binlog-event-type.js';
import { invariant } from '@cbnsndwch/zero-contracts';
import { BinlogEventTableMapData } from './table-map.event.js';
import { multiLine, singleLine } from 'src/utils/strings.js';

/**
 * TODO: extract to shared contracts file for other event parsers to use
 */
export type AnyRow = Record<string, unknown>;

export type BinlogEventWriteRowsV2Data = {
    tableId: number;
    flags: number;
    extraDataLength?: number;
    extraData?: Buffer;
    numberOfColumns: number;
    columnsPresentBitmap: Buffer;
    rows?: unknown[];
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

    const checksumLen = options.useChecksum ? 4 : 0;

    // look up TableMap for this tableId
    const tableMap = options.tables?.get(BigInt(tableId));

    // a table map is required to correctly parse the event
    if (!tableMap) {
        invariant(
            false,
            `TableMap not found for tableId ${tableId}. This is required to parse the event.`
        );
    }

    const rows = parseRows(packet, checksumLen, tableMap, columnsPresentBitmap);

    // finally, handle 4 bytes for checksum if needed
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
            rows: rows ?? []
        },
        checksum
    };
}

function parseRows(
    packet: Packet,
    checksumLen: number,
    tableMap: BinlogEventTableMapData,
    columnsPresentBitmap: Buffer<ArrayBufferLike>
) {
    const rows: AnyRow[] = [];

    while (packet.offset < packet.end - checksumLen) {
        const row = parseRow(packet, tableMap, columnsPresentBitmap);
        rows.push(row);
    }

    return rows;
}

/**
 * Helper to parse a single row
 */
function parseRow(
    packet: Packet,
    tableMap: BinlogEventTableMapData,
    columnsPresentBitmap: Buffer
): AnyRow {
    const row: AnyRow = {};
    const { columnTypes, columnCount } = tableMap;
    const nullBitmapSize = Math.floor((columnCount + 7) / 8);
    // Read the null bitmap for this row
    const nullBitmap = packet.readBuffer(nullBitmapSize);

    let nullBitIdx = 0;
    let nullBitMask = 1;

    for (let i = 0; i < columnCount; i++) {
        // Check if column is present in columnsPresentBitmap
        const bitmapIdx = Math.floor(i / 8);
        const present =
            columnsPresentBitmap &&
            columnsPresentBitmap.length > bitmapIdx &&
            columnsPresentBitmap[bitmapIdx] !== undefined &&
            (columnsPresentBitmap[bitmapIdx] & (1 << i % 8)) !== 0;

        if (!present) {
            continue;
        }

        // Check if column is null in nullBitmap
        let isNullable = false;
        if (
            nullBitmap &&
            nullBitmap.length > nullBitIdx &&
            nullBitmap[nullBitIdx] !== undefined
        ) {
            // Only do bitwise op if defined
            isNullable = ((nullBitmap[nullBitIdx] ?? 0) & nullBitMask) !== 0;
        }

        nullBitMask <<= 1;
        if (nullBitMask === 0x100) {
            nullBitMask = 1;
            nullBitIdx++;
        }

        let colName: string;
        if (
            hasColumnNames(tableMap) &&
            typeof tableMap.columnNames[i] === 'string'
        ) {
            colName = tableMap.columnNames[i] as string;
        } else {
            colName = `col${i}`;
        }

        if (isNullable) {
            row[colName] = null;
        } else {
            // Parse value based on column type
            const type = columnTypes[i] ?? 0;
            row[colName] = parseColumnValue(packet, type);
        }
    }

    return row;
}

function parseColumnValue(packet: Packet, type: number): unknown {
    // This is a minimal implementation. Extend as needed for more types.
    switch (type) {
        case 1 /* TINY */:
            return packet.readInt8();

        case 2 /* SHORT */:
            return packet.readInt16();

        case 3 /* LONG */:
            return packet.readInt32();

        case 4 /* FLOAT */:
            return packet.readFloat();

        case 5 /* DOUBLE */:
            return packet.readDouble();

        case 8 /* LONGLONG */:
            return packet.readInt64();

        case 9 /* INT24 */:
            return packet.readInt24();

        case 15: /* VARCHAR */
        case 253: /* VAR_STRING */
        case 254 /* STRING */:
            // Length-coded string
            return packet.readLengthCodedString('utf8');

        case 252 /* BLOB/TEXT */:
            return packet.readLengthCodedBuffer();

        case 6 /* NULL */:
            return null;

        case 0: /* DECIMAL */
        case 246 /* NEWDECIMAL */:
            __tempLogUnsupportedColumnType(
                type,
                type === 0 ? 'DECIMAL' : 'NEWDECIMAL',
                ['DECIMAL', 'NEWDECIMAL']
            );

            // Not implemented: skip for now
            return undefined;

        case 10: /* DATE */
        case 11 /* TIME */:
            __tempLogUnsupportedColumnType(
                type,
                type === 10 ? 'DATE' : 'TIME',
                ['DATE', 'TIME']
            );

            // Not implemented: skip for now
            return undefined;

        case 7: /* TIMESTAMP */
        case 12 /* DATETIME */:
            __tempLogUnsupportedColumnType(
                type,
                type === 7 ? 'TIMESTAMP' : 'DATETIME',
                ['TIMESTAMP', 'DATETIME']
            );

            // Not implemented: skip for now
            return undefined;

        case 16 /* BIT */:
            __tempLogUnsupportedColumnType(type, 'BIT', ['BIT']);

            // Not implemented: skip for now
            return undefined;
        default: {
            const bufferSlice = packet.buffer.subarray(
                packet.start,
                packet.end
            );

            invariant(
                false,
                multiLine(
                    singleLine(
                        `makeWriteRowsV2Event::parseColumnValue got unknown column type ${type}.`,
                        'You may be reading data incorrectly from the packet or there',
                        'may be some other unrelated issue that is causing read head drift.'
                    ),
                    '',
                    'Packet dump:',
                    '',
                    `ASCII: ${bufferSlice.toString('ascii')}`,
                    `HEX: ${bufferSlice
                        .toString('hex')
                        .match(/.{1,2}/g)
                        ?.join(' ')}`,
                    `Length: ${packet.length()}`,
                    `Sequence ID: ${packet.sequenceId}`
                )
            );

            // Not implemented: skip for now
            return undefined;
        }
    }
}

/**
 * Type guard for `columnNames: string[]` property
 */
function hasColumnNames(val: unknown): val is { columnNames: unknown[] } {
    return (
        typeof val === 'object' &&
        val !== null &&
        'columnNames' in val &&
        Array.isArray(val.columnNames)
    );
}

function __tempLogUnsupportedColumnType(
    type: number,
    typeName: string,
    caseColumnTypes: string[]
) {
    const typesList =
        '[ ' + caseColumnTypes.map(type => `'${type}'`).join(', ') + ' ]';

    console.debug(
        `parseColumnValue got column type ${typeName} (${type}), but ${typesList} types are not implemented yet`
    );
}
