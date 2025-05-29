import type Packet from 'mysql2/lib/packets/packet.js';

import type { Dict } from '@cbnsndwch/zero-contracts';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_TABLE_MAP } from './binlog-event-type.js';

// prettier-ignore
enum MysqlTypes {
    DECIMAL     =   0,
    TINY        =   1,
    SHORT       =   2,
    LONG        =   3,
    FLOAT       =   4,
    DOUBLE      =   5,
    NULL        =   6,
    TIMESTAMP   =   7,
    LONGLONG    =   8,
    INT24       =   9,
    DATE        =  10,
    TIME        =  11,
    DATETIME    =  12,
    YEAR        =  13,
    NEWDATE     =  14,
    VARCHAR     =  15,
    BIT         =  16,
    TIMESTAMP2  =  17,
    DATETIME2   =  18,
    TIME2       =  19,
    JSON        = 245,
    NEWDECIMAL  = 246,
    ENUM        = 247,
    SET         = 248,
    TINY_BLOB   = 249,
    MEDIUM_BLOB = 250,
    LONG_BLOB   = 251,
    BLOB        = 252,
    VAR_STRING  = 253,
    STRING      = 254,
    GEOMETRY    = 255
}

export type BinlogEventTableMapData = {
    tableId: bigint;
    flags: number;
    schemaName: string;
    tableName: string;
    columnCount: number;
    columnTypes: number[];
    columnsMetadata: Dict[];
    /**
     * Optional: Column names for this table, populated from information_schema if available.
     */
    columnNames?: string[];
};

export type BinlogEventTableMap = BinlogEventBase<
    'TABLE_MAP',
    typeof BINLOG_EVENT_TABLE_MAP,
    BinlogEventTableMapData
>;

export async function makeTableMapEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): Promise<BinlogEventTableMap> {
    // Table ID is 6 bytes (little-endian)
    const tableIdLow = packet.readInt32();
    const tableIdHigh = packet.readInt16();
    const tableId = BigInt(tableIdLow) + (BigInt(tableIdHigh) << 32n);

    const flags = packet.readInt16();

    // Schema name
    const schemaName = packet.readLengthCodedString('utf8') as string;

    // skip 1 byte delimiter
    packet.readInt8();

    // Table name
    const tableName = packet.readLengthCodedString('utf8') as string;

    // skip 1 byte delimiter
    packet.readInt8();

    // Column count (length-coded)
    const columnCount = packet.readLengthCodedNumber() as number;

    // Column types
    const columnTypes = parseBytesArray(packet, columnCount);

    // Metadata block length (length-coded, but we don't need the value)
    packet.readLengthCodedNumber();

    // Column metadata
    const columnsMetadata = readColumnMetadata.call(packet, columnTypes);

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    let columnNames: string[] | undefined = undefined;
    if (options.schemaDiscovery) {
        try {
            columnNames = await options.schemaDiscovery.getColumnNames(
                schemaName,
                tableName
            );
        } catch (e) {
            console.warn(
                `Failed to fetch column names for ${schemaName}.${tableName}:`,
                e
            );
        }
    }

    const data: BinlogEventTableMapData = {
        tableId,
        flags,
        schemaName,
        tableName,
        columnCount,
        columnTypes,
        columnsMetadata,
        ...(columnNames ? { columnNames } : {})
    };

    options.tables?.set?.(tableId, data);

    return {
        name: 'TABLE_MAP',
        type: BINLOG_EVENT_TABLE_MAP,
        header,
        data,
        ...(checksum !== undefined ? { checksum } : {})
    };
}

function parseBytesArray(packet: Packet, count: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
        arr.push(packet.readInt8());
    }
    return arr;
}

function readColumnMetadata(this: Packet, columnTypes: number[]): Dict[] {
    return columnTypes.map(code => {
        let result: Dict;

        switch (code) {
            case MysqlTypes.FLOAT:
            case MysqlTypes.DOUBLE:
                result = { size: this.readInt8() };
                break;
            case MysqlTypes.VARCHAR:
                result = { max_length: this.readInt16() };
                break;
            case MysqlTypes.BIT: {
                const bits = this.readInt8();
                const bytes = this.readInt8();
                result = { bits: bytes * 8 + bits };
                break;
            }
            case MysqlTypes.NEWDECIMAL:
                result = {
                    precision: this.readInt8(),
                    decimals: this.readInt8()
                };
                break;
            case MysqlTypes.BLOB:
            case MysqlTypes.GEOMETRY:
            case MysqlTypes.JSON:
                result = { length_size: this.readInt8() };
                break;
            case MysqlTypes.STRING:
            case MysqlTypes.VAR_STRING: {
                const metadata = (this.readInt8() << 8) + this.readInt8();
                const realType = metadata >> 8;
                if (
                    realType === MysqlTypes.ENUM ||
                    realType === MysqlTypes.SET
                ) {
                    result = {
                        type: realType,
                        size: metadata & 0x00ff
                    };
                } else {
                    result = {
                        max_length:
                            (((metadata >> 4) & 0x300) ^ 0x300) +
                            (metadata & 0x00ff)
                    };
                }
                break;
            }
            case MysqlTypes.TIMESTAMP2:
            case MysqlTypes.DATETIME2:
            case MysqlTypes.TIME2:
                result = { decimals: this.readInt8() };
                break;
            default:
                // Handle unknown types gracefully, we could choose to throw
                // an error  but for now, we'll just log a warning and return an
                // empty object instead

                // invariant(
                //     false,
                //     `Unknown column type ${code} in TABLE_MAP event.`
                // );
                console.warn(`Unknown column type ${code} in TABLE_MAP event.`);

                result = {};
        }
        return result;
    });
}
