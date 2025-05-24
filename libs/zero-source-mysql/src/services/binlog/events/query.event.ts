import type Packet from 'mysql2/lib/packets/packet.js';

import { BINLOG_EVENT_QUERY } from './binlog-event-type.js';
import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';

export type BinlogEventQueryData = {
    slaveProxyId: number;
    executionTime: number;
    errorCode: number;
    schema: string;
    statusVars: QueryStatusVars;
    query: string;
};

export type BinlogEventQuery = BinlogEventBase<
    'QUERY',
    typeof BINLOG_EVENT_QUERY,
    BinlogEventQueryData
>;

export function makeQueryEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventQuery {
    const slaveProxyId = packet.readInt32();

    const executionTime = packet.readInt32();

    const schemaLength = packet.readInt8();

    const errorCode = packet.readInt16();

    const statusVarsLength = packet.readInt16();
    const statusVarsBuffer = packet.readBuffer(statusVarsLength);

    const schema = packet.readString(schemaLength, 'utf8');

    // skip 8 bytes, which should all be zero
    packet.readInt8();

    const statusVars = parseQueryStatusVars(statusVarsBuffer);

    const query = packet.readString('utf8');

    const data: BinlogEventQueryData = {
        slaveProxyId,
        executionTime,
        errorCode,
        schema,
        statusVars,
        query
    };

    return {
        name: 'QUERY',
        type: BINLOG_EVENT_QUERY,
        header,
        data
    };
}

// #region Helpers

const StatusVarsKey = {
    FLAGS_2: 0,
    SQL_MODE: 1,
    CATALOG: 2,
    AUTO_INCREMENT: 3,
    CHARSET: 4,
    TIME_ZONE: 5,
    CATALOG_NZ: 6,
    LC_TIME_NAMES: 7,
    CHARSET_DATABASE: 8,
    TABLE_MAP_FOR_UPDATE: 9,
    MASTER_DATA_WRITTEN: 10,
    INVOKERS: 11,
    UPDATED_DB_NAMES: 12,
    MICROSECONDS: 3
};

type QueryStatusVars = {
    flags: number;
    sqlMode: number;
    catalog: string;
    clientCharset: number;
    connectionCollation: number;
    serverCharset: number;
    timeZone: string;
    catalogNz: string;
    lcTimeNames: number;
    schemaCharset: number;
    mapForUpdate1: number;
    mapForUpdate2: number;
    masterDataWritten: number;
    invokerUsername: string;
    invokerHostname: string;
    updatedDBs: string[];
    microseconds: number;
};

function parseQueryStatusVars(buffer: Buffer): QueryStatusVars {
    const result = {} as QueryStatusVars;
    let offset = 0;
    let key, length, prevOffset;

    while (offset < buffer.length) {
        key = buffer[offset++];
        switch (key) {
            case StatusVarsKey.FLAGS_2:
                result.flags = buffer.readUInt32LE(offset);
                offset += 4;
                break;

            case StatusVarsKey.SQL_MODE:
                // value is 8 bytes, but all documented flags are in first 4 bytes
                result.sqlMode = buffer.readUInt32LE(offset);
                offset += 8;
                break;

            case StatusVarsKey.CATALOG:
                length = buffer[offset++]!;
                result.catalog = buffer.toString(
                    'utf8',
                    offset,
                    offset + length
                );
                offset += length + 1; // null byte after string
                break;

            case StatusVarsKey.CHARSET:
                result.clientCharset = buffer.readUInt16LE(offset);
                result.connectionCollation = buffer.readUInt16LE(offset + 2);
                result.serverCharset = buffer.readUInt16LE(offset + 4);
                offset += 6;
                break;

            case StatusVarsKey.TIME_ZONE:
                length = buffer[offset++]!;
                result.timeZone = buffer.toString(
                    'utf8',
                    offset,
                    offset + length
                );
                offset += length; // no null byte
                break;

            case StatusVarsKey.CATALOG_NZ:
                length = buffer[offset++]!;
                result.catalogNz = buffer.toString(
                    'utf8',
                    offset,
                    offset + length
                );
                offset += length; // no null byte
                break;

            case StatusVarsKey.LC_TIME_NAMES:
                result.lcTimeNames = buffer.readUInt16LE(offset);
                offset += 2;
                break;

            case StatusVarsKey.CHARSET_DATABASE:
                result.schemaCharset = buffer.readUInt16LE(offset);
                offset += 2;
                break;

            case StatusVarsKey.TABLE_MAP_FOR_UPDATE:
                result.mapForUpdate1 = buffer.readUInt32LE(offset);
                result.mapForUpdate2 = buffer.readUInt32LE(offset + 4);
                offset += 8;
                break;

            case StatusVarsKey.MASTER_DATA_WRITTEN:
                result.masterDataWritten = buffer.readUInt32LE(offset);
                offset += 4;
                break;

            case StatusVarsKey.INVOKERS:
                length = buffer[offset++]!;
                result.invokerUsername = buffer.toString(
                    'utf8',
                    offset,
                    offset + length
                );
                offset += length;
                length = buffer[offset++]!;
                result.invokerHostname = buffer.toString(
                    'utf8',
                    offset,
                    offset + length
                );
                offset += length;
                break;

            case StatusVarsKey.UPDATED_DB_NAMES:
                length = buffer[offset++];
                // length - number of null-terminated strings
                result.updatedDBs = []; // we'll store them as array here
                for (; length; --length) {
                    prevOffset = offset;
                    // fast forward to null terminating byte
                    while (buffer[offset++] && offset < buffer.length) {
                        // empty body, everything inside while condition
                    }
                    result.updatedDBs.push(
                        buffer.toString('utf8', prevOffset, offset - 1)
                    );
                }
                break;

            case StatusVarsKey.MICROSECONDS:
                result.microseconds =
                    // REVIEW: INVALID UNKNOWN VARIABLE!
                    buffer.readInt16LE(offset) + (buffer[offset + 2]! << 16);
                offset += 3;
        }
    }

    return result;
}

// #endregion Helpers
