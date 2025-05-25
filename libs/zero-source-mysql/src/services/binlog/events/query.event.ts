import type Packet from 'mysql2/lib/packets/packet.js';

import { BINLOG_EVENT_QUERY } from './binlog-event-type.js';
import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { invariant } from '@cbnsndwch/zero-contracts';
import { readNullTerminatedString } from '../utils/index.js';

export type BinlogEventQueryData = {
    threadId: number;
    executionTime: number;
    errorCode: number;
    databaseName: string;
    // statusVars: QueryStatusVars;
    statusVars: StatusVars;
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
    // 4 bytes little-endian: connection/thread ID
    const threadId = packet.readInt32();

    // 4 bytes LE: execution time in seconds
    const executionTime = packet.readInt32();

    // 1 byte: length of the database name
    const databaseNameLength = packet.readInt8();

    // 2 bytes LE: error code (warn count)
    const errorCode = packet.readInt16();

    // 2 bytes LE: length of the “status variables” block
    const statusVarsLength = packet.readInt16();

    // status variables block (just keep raw for now)
    const statusVarsBuffer = packet.readBuffer(statusVarsLength);

    // database/schema name + null terminator
    const databaseName = packet.readString(databaseNameLength, 'utf8');

    // skip 1 bytes, which should be all zeros
    packet.readInt8();

    // the rest is the SQL statement + CRC32 checksum (if present)
    const queryLength =
        packet.end - packet.offset - (options.useChecksum ? 4 : 0);
    const query = packet.readString(queryLength, 'utf8');

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    const statusVars = parseStatusVars(statusVarsBuffer);

    return {
        name: 'QUERY',
        type: BINLOG_EVENT_QUERY,
        header,
        data: {
            threadId,
            executionTime,
            errorCode,
            databaseName,
            statusVars,
            query
        },
        checksum
    };
}

// #region Helpers

export type SqlMode = {
    REAL_AS_FLOAT: boolean;
    PIPES_AS_CONCAT: boolean;
    ANSI_QUOTES: boolean;
    IGNORE_SPACE: boolean;
    NOT_USED: boolean;
    ONLY_FULL_GROUP_BY: boolean;
    NO_UNSIGNED_SUBTRACTION: boolean;
    NO_DIR_IN_CREATE: boolean;
    ANSI: boolean;
    NO_AUTO_VALUE_ON_ZERO: boolean;
    NO_BACKSLASH_ESCAPES: boolean;
    STRICT_TRANS_TABLES: boolean;
    STRICT_ALL_TABLES: boolean;
    NO_ZERO_IN_DATE: boolean;
    NO_ZERO_DATE: boolean;
    INVALID_DATES: boolean;
    ERROR_FOR_DIVISION_BY_ZERO: boolean;
    TRADITIONAL: boolean;
    HIGH_NOT_PRECEDENCE: boolean;
    PAD_CHAR_TO_FULL_LENGTH: boolean;
    TIME_TRUNCATE_FRACTIONAL: boolean;
};

// prettier-ignore
const SQL_MODE_FLAGS: [keyof SqlMode, bigint][] = [
    ['REAL_AS_FLOAT', BigInt(0x00_00_00_00_01)],
    ['PIPES_AS_CONCAT', BigInt(0x00_00_00_00_02)],
    ['ANSI_QUOTES', BigInt(0x00_00_00_00_04)],
    ['IGNORE_SPACE', BigInt(0x00_00_00_00_08)],
    ['NOT_USED', BigInt(0x00_00_00_00_10)],
    ['ONLY_FULL_GROUP_BY', BigInt(0x00_00_00_00_20)],
    ['NO_UNSIGNED_SUBTRACTION', BigInt(0x00_00_00_00_40)],
    ['NO_DIR_IN_CREATE', BigInt(0x00_00_00_00_80)],
    ['ANSI', BigInt(0x00_00_08_00_00)],
    ['NO_AUTO_VALUE_ON_ZERO', BigInt(0x00_00_10_00_00)],
    ['NO_BACKSLASH_ESCAPES', BigInt(0x00_00_20_00_00)],
    ['STRICT_TRANS_TABLES', BigInt(0x00_00_40_00_00)],
    ['STRICT_ALL_TABLES', BigInt(0x00_00_80_00_00)],
    ['NO_ZERO_IN_DATE', BigInt(0x00_01_00_00_00)],
    ['NO_ZERO_DATE', BigInt(0x00_02_00_00_00)],
    ['INVALID_DATES', BigInt(0x00_04_00_00_00)],
    ['ERROR_FOR_DIVISION_BY_ZERO', BigInt(0x00_08_00_00_00)],
    ['TRADITIONAL', BigInt(0x00_10_00_00_00)],
    ['HIGH_NOT_PRECEDENCE', BigInt(0x00_40_00_00_00)],
    ['PAD_CHAR_TO_FULL_LENGTH', BigInt(0x00_80_00_00_00)],
    ['TIME_TRUNCATE_FRACTIONAL', BigInt(0x10_00_00_00_00)],
] as const;

function decodeSqlMode(flags: bigint): SqlMode {
    const entries = SQL_MODE_FLAGS.filter(
        // iterate over the SQL_MODE_FLAGS // filter out unset flags
        ([, mask]) => (flags & mask) !== 0n
    ).map(
        // and map to true
        ([name]) => [name as keyof SqlMode, true]
    );

    const sqlMode = Object.fromEntries(entries) as SqlMode;

    return sqlMode;
}

/**
 * From MySQL `include/mysql_com.h`
 */
// prettier-ignore
export const StatusVarCode = {
    Flags2                       : 0x00, //  0
    SqlMode                      : 0x01, //  1
    AutoIncrement                : 0x03, //  3
    Charset                      : 0x04, //  4
    TimeZone                     : 0x05, //  5
    CatalogNz                    : 0x06, //  6
    LcTimeNames                  : 0x07, //  7
    CharsetDatabase              : 0x08, //  8
    TableMapForUpdate            : 0x09, //  9
    Invoker                      : 0x0b, // 11
    UpdatedDbNames               : 0x0c, // 12
    Microseconds                 : 0x0d, // 13
    ExplicitDefaultsForTimestamp : 0x10, // 16
    DdlLoggedWithTransactionId   : 0x11, // 17
    DefaultCollationForUtf8mb4   : 0x12, // 18
    SqlRequirePrimaryKey         : 0x13, // 19
    DefaultTableEncryption       : 0x14, // 20

    /**
     *
     * Q_CATALOG_CODE is catalog with end zero stored; it is used only by MySQL
     * 5.0.x where 0<=x<=3. We have to keep it to be able to replicate these
     * old masters.
    *
    * @deprecated See {@link StatusVarCode.CatalogNz} instead.
    */
    Catalog2Legacy: 0x02, //  2

    /**
     * It is just a placeholder after 8.0.2    
     */
    MasterDataWritten: 0x0a, // 10


    /**
     * A old (unused now) code for Query_log_event status similar to 
     * `G_COMMIT_TS`.
     * 
     * @deprecated
    */
    Q_COMMIT_TS: 14,

    /**
     * An old (unused after migration to Gtid_event) code for Query_log_event
     * status, similar to `G_COMMIT_TS2`.
      * 
      * @deprecated
      */
    Q_COMMIT_TS2: 15,

} as const;

type StatusVarCode = (typeof StatusVarCode)[keyof typeof StatusVarCode];

export type StatusVars = {
    /**
     * A 4 byte bitfield
     *
     * The flags in thd->options, binary AND-ed with OPTIONS_WRITTEN_TO_BIN_LOG.
     * The thd->options bitfield contains options for "SELECT". OPTIONS_WRITTEN
     * identifies those options that need to be written to the binlog (not all
     * do).
     *
     * Specifically, `OPTIONS_WRITTEN_TO_BIN_LOG` equals `0x0c084000` in hex or
     * the following:
     *
     * `OPTION_AUTO_IS_NULL` | `OPTION_NO_FOREIGN_KEY_CHECKS` | `OPTION_RELAXED_UNIQUE_CHECKS` | `OPTION_NOT_AUTOCOMMIT`
     *
     * These flags correspond to the SQL variables `SQL_AUTO_IS_NULL`,
     * `FOREIGN_KEY_CHECKS`, `UNIQUE_CHECKS`, and `AUTOCOMMIT`, documented in
     * the `SET Syntax` section of the MySQL Manual.
     *
     * This field is always written to the binlog in version >= 5.0, and never
     * written in version < 5.0.
     */
    flags2?: number;

    /**
     * An 8 byte bitfield
     *
     * The sql_mode variable. See the section "SQL Modes" in the MySQL manual,
     * and see sql_class.h for a list of the possible flags. As of `2007-10-04`,
     * the following flags are available:
     *
     * | Name                               | Value         |
     * |:---------------------------------- |:------------- |
     * | `MODE_REAL_AS_FLOAT`               | `0x1`         |
     * | `MODE_PIPES_AS_CONCAT`             | `0x2`         |
     * | `MODE_ANSI_QUOTES`                 | `0x4`         |
     * | `MODE_IGNORE_SPACE`                | `0x8`         |
     * | `MODE_NOT_USED`                    | `0x10`        |
     * | `MODE_ONLY_FULL_GROUP_BY`          | `0x20`        |
     * | `MODE_NO_UNSIGNED_SUBTRACTION`     | `0x40`        |
     * | `MODE_NO_DIR_IN_CREATE`            | `0x80`        |
     * | `MODE_ANSI`                        | `0x80000`     |
     * | `MODE_NO_AUTO_VALUE_ON_ZERO`       | `0x100000`    |
     * | `MODE_NO_BACKSLASH_ESCAPES`        | `0x200000`    |
     * | `MODE_STRICT_TRANS_TABLES`         | `0x400000`    |
     * | `MODE_STRICT_ALL_TABLES`           | `0x800000`    |
     * | `MODE_NO_ZERO_IN_DATE`             | `0x1000000`   |
     * | `MODE_NO_ZERO_DATE`                | `0x2000000`   |
     * | `MODE_INVALID_DATES`               | `0x4000000`   |
     * | `MODE_ERROR_FOR_DIVISION_BY_ZERO`  | `0x8000000`   |
     * | `MODE_TRADITIONAL`                 | `0x10000000`  |
     * | `MODE_HIGH_NOT_PRECEDENCE`         | `0x40000000`  |
     * | `MODE_PAD_CHAR_TO_FULL_LENGTH`     | `0x80000000`  |
     * | `MODE_TIME_TRUNCATE_FRACTIONAL`    | `0x100000000` |
     *
     * All these flags are replicated from the server. However, all flags except
     * `MODE_NO_DIR_IN_CREATE` are honored by the replica; the replica always
     * preserves its old value of `MODE_NO_DIR_IN_CREATE`.
     *
     * This field is always written to the binlog.
     */
    sqlModeFlags?: bigint;

    /**
     * Parsed SQL mode flags
     */
    sqlMode?: SqlMode;

    /**
     * Variable-length string: the length in bytes (1 byte) followed by the
     * characters (at most 255 bytes)
     *
     * Stores the client's current catalog. Every database belongs to a catalog,
     * the same way that every table belongs to a database. Currently, there is
     * only one catalog, "std".
     *
     * This field is written if the length of the catalog is > 0; otherwise it
     * is not written.
     */
    catalog?: string;

    // /**
    //  * The status variable `Q_CATALOG_CODE == 2` existed in MySQL 5.0.0 to 5.0.3.
    //  * It was identical to `Q_CATALOG_CODE_NZ == 6`, except that the string had
    //  * a trailing '\0'. The '\0' was removed in 5.0.4 since it was redundant
    //  * (the string length is stored before the string).
    //  *
    //  * The Q_CATALOG_CODE will never be written by a new master, but can still
    //  * be understood by a new slave when the `Q_CHARSET_DATABASE_CODE` flag indicate
    //  */
    // catalogLegacy?: string;

    /**
     * The first of two 2-byte unsigned integers, totally 2+2=4 bytes
     *
     * The two variables auto_increment_increment and auto_increment_offset, in
     * that order. For more information, see "System variables" in the MySQL
     * manual.
     *
     * This field is written if auto_increment > 1. Otherwise, it is not
     * written.
     */
    autoIncrementIncrement?: number;

    /**
     * The second of two 2-byte unsigned integers, totally 2+2=4 bytes
     *
     * The two variables auto_increment_increment and auto_increment_offset, in
     * that order. For more information, see "System variables" in the MySQL
     * manual.
     *
     * This field is written if auto_increment > 1. Otherwise, it is not
     * written.
     */
    autoIncrementOffset?: number;

    /**
     * The `character_set_client` variable, first part of the `charset` field.
     *
     * A code identifying the character set and collation used by the client to
     * encode the query.
     *
     * See also "Connection Character Sets and Collations" in the MySQL 5.1 manual.
     *
     * All three variables are codes identifying a (character set, collation)
     * pair. To see which codes map to which pairs, run the query
     *
     * ```sql
     * SELECT id, character_set_name, collation_name FROM COLLATIONS
     * ```
     *
     * This field is always written.
     */
    charsetClient?: number;

    /**
     * The `collation_connection` variable, second part of the `charset` field.
     *
     * Identifies the character set and collation that the master converts the
     * query to when it receives it; this is useful when comparing literal
     * strings.
     *
     * See also "Connection Character Sets and Collations" in the MySQL 5.1 manual.
     *
     * All three variables are codes identifying a (character set, collation)
     * pair. To see which codes map to which pairs, run the query
     *
     * ```sql
     * SELECT id, character_set_name, collation_name FROM COLLATIONS
     * ```
     *
     * This field is always written.
     */
    collationConnection?: number;

    /**
     * The `character_set_results` variable, third part of the `charset` field.
     *
     * The default character set and collation used when a new database is
     * created.
     *
     *
     * See also "Connection Character Sets and Collations" in the MySQL 5.1 manual.
     *
     * All three variables are codes identifying a (character set, collation)
     * pair. To see which codes map to which pairs, run the query
     *
     * ```sql
     * SELECT id, character_set_name, collation_name FROM COLLATIONS
     * ```
     *
     * This field is always written.
     */
    collationDatabase?: number;

    /**
     * The time_zone of the master.
     *
     * A variable-length string: the length in bytes (1 byte) followed by the
     * characters (at most 255 bytes).
     *
     * See also "System Variables" and "MySQL Server Time Zone Support" in the
     * MySQL manual.
     *
     * This field is written if the length of the time zone string is > 0;
     * otherwise, it is not written.
     */
    timeZone?: string;

    /**
     * A 2 byte integer code identifying a table of month and day names. The
     * mapping from codes to languages is defined in `sql_locale.cc`.
     *
     * This field is written if it is not 0, i.e., if the locale is not `en_US`.
     */
    lcTimeNames?: number;

    /**
     * An 8 byte integer containing the value of the table map that is to be
     * updated by the multi-table update query statement. Every bit of this
     * variable represents a table, and is set to 1 if the corresponding table
     * is to be updated by this statement.
     *
     * The value of this variable is set when executing a multi-table update
     * statement and used by the replica to apply filter rules without opening
     * all the tables on the replica. This is required because some tables may
     * not exist on the replica because of the filter rules.
     *
     * TODO: parse this as a bitfield in the context of the latest table map
     * event received.
     */
    tableMapForUpdate?: boolean;

    /**
     * A 4 byte bitfield. The value of the original length of a QUERY_EVENT that
     * comes from a master. Master's event is relay-logged with storing the
     * original size of event in this field by the IO thread. The size is to be
     * restored by reading `Q_MASTER_DATA_WRITTEN_CODE`-marked event from the
     * relay log.
     *
     * This field is not written to the replica's server binlog by the SQL
     * thread. This field only exists in relay logs where master has
     * `binlog_version < 4`. i.e. server_version < 5.0 and the replicate has
     * `binlog_version = 4`.
     */
    masterDataWritten?: number;

    /**
     * Two variable-length strings: `user` and `host`, each preceded by a length
     * byte
     *
     * The value of boolean variable `m_binlog_invoker` is set `TRUE` if
     * `CURRENT_USER()` is called in account management statements. SQL thread
     * uses it as a default definer in CREATE/ALTER SP, SF, Event, TRIGGER or
     * VIEW statements.
     *
     * The field `Q_INVOKER` has length of user stored in 1 byte followed by
     * the user string which is assigned to 'user' and the length of host stored
     * in 1 byte followed by host string which is assigned to 'host'.
     */
    invoker?: { user: string; host: string };

    /**
     * A 1 byte count, and a 2-D array representing the total number and the
     * names to of the databases accessed, to be propagated to the replica in
     * order to facilitate the parallel applying of the Query events.
     */
    accessedDbNames?: string[];

    /**
     *
     */
    microseconds?: number;

    // #region POORLY DOCUMENTED:

    /**
     * Stores master connection `@session.explicit_defaults_for_timestamp` when
     * `CREATE` and `ALTER` operate on a table with a `TIMESTAMP` column.
     *
     * @remarks A 1-byte boolean
     */
    explicitDefaultsTs?: boolean;

    /**
     * Stores variable carrying xid info of 2pc-aware (recoverable) DDL queries.
     *
     * @remarks An 8-byte integer
     */
    ddlTransactionId?: bigint;

    /**
     * Stores variable carrying the the default collation for the utf8mb4
     * character set. Mainly used to support replication from a 5.7- master to a
     * 8.0+ replica.
     *
     * @remarks A 2-byte integer
     */
    defaultCollationForUtf8mb4Number?: number;

    /**
     * Value of the config variable `sql_require_primary_key`
     *
     * **WARNING:** The MySQL 8.4.4 documentation states that this value is a 2-byte
     * integer, but the code in `statement_events.h` declares it as
     * `uint8_t default_table_encryption`.
     * 
     * @remarks A 1-byte integer
     */
    sqlRequirePrimaryKey?: number;

    /**
     * Value of the config variable `default_table_encryption`
     *
     * **WARNING:** The MySQL 8.4.4 documentation states that this value is a 2-byte
     * integer, but the code in `statement_events.h` declares it as
     * `uint8_t sql_require_primary_key`.
     *
     * @remarks A 1-byte integer
     */
    defaultTableEncryption?: number;

    // #endregion POORLY DOCUMENTED
};

/**
 * Parses the status-vars block from a MySQL query event.
 *
 * @param buffer the status-vars block
 * @returns parsed status variables
 */
function parseStatusVars(buffer: Buffer): StatusVars {
    let offset = 0;
    const vars: StatusVars = {};

    while (offset < buffer.length) {
        const code = buffer.readUInt8(offset++) as StatusVarCode;

        switch (code) {
            case StatusVarCode.Flags2:
                vars.flags2 = buffer.readUInt32LE(offset);
                offset += 4;
                break;

            case StatusVarCode.SqlMode: {
                vars.sqlModeFlags = buffer.readBigUint64LE(offset);

                vars.sqlMode = decodeSqlMode(vars.sqlModeFlags);
                offset += 8;
                break;
            }

            // case StatusVarCode.Catalog2Legacy: {
            //     const len = buffer.readUInt8(offset++);
            //     vars.catalogLegacy = buffer.toString('utf8', offset, offset + len);
            //     offset += len;
            //     break;
            // }

            case StatusVarCode.AutoIncrement:
                vars.autoIncrementIncrement = buffer.readUInt16LE(offset);
                vars.autoIncrementOffset = buffer.readUInt16LE(offset + 2);
                offset += 4;
                break;

            case StatusVarCode.Charset:
                vars.charsetClient = buffer.readUInt16LE(offset);
                vars.collationConnection = buffer.readUInt16LE(offset + 2);
                vars.collationDatabase = buffer.readUInt16LE(offset + 4);
                offset += 6;
                break;

            case StatusVarCode.TimeZone: {
                const len = buffer.readUInt8(offset++);
                vars.timeZone = buffer.toString('utf8', offset, offset + len);
                offset += len;
                break;
            }

            case StatusVarCode.CatalogNz: {
                const len = buffer.readUInt8(offset++);
                vars.catalog = buffer.toString('utf8', offset, offset + len);
                offset += len;
                break;
            }

            case StatusVarCode.LcTimeNames:
                vars.lcTimeNames = buffer.readUInt8(offset++);
                break;

            case StatusVarCode.CharsetDatabase:
                vars.collationDatabase = buffer.readUInt16LE(offset);
                offset += 2;
                break;

            case StatusVarCode.TableMapForUpdate:
                vars.tableMapForUpdate = true;
                break;

            case StatusVarCode.MasterDataWritten:
                vars.masterDataWritten = buffer.readUInt32LE(offset);
                offset += 4;
                break;

            case StatusVarCode.Invoker: {
                const userLen = buffer.readUInt8(offset++);
                const user = buffer.toString('utf8', offset, offset + userLen);
                offset += userLen;

                const hostLen = buffer.readUInt8(offset++);
                const host = buffer.toString('utf8', offset, offset + hostLen);
                offset += hostLen;

                vars.invoker = { user, host };
                break;
            }

            case StatusVarCode.UpdatedDbNames: {
                const accessedDbsCount = Number(buffer.readUint8(offset++));

                vars.accessedDbNames = [];
                for (let i = 0; i < accessedDbsCount; i++) {
                    const value = readNullTerminatedString.call(
                        buffer,
                        offset,
                        'utf8'
                    );

                    vars.accessedDbNames.push(value);

                    // advance the offset by the length of the string + 1 byte
                    // for the null terminator
                    offset += value.length + 1;
                }
                break;
            }

            case StatusVarCode.Microseconds: {
                const low = buffer.readUInt16LE(offset);
                const high = buffer.readUInt8(offset + 1);

                vars.microseconds = low + (high << 16);
                offset += 3;
                break;
            }

            case StatusVarCode.ExplicitDefaultsForTimestamp: {
                // 0x10, / 16
                vars.explicitDefaultsTs = Boolean(buffer.readUInt8(offset++));
                break;
            }
            case StatusVarCode.DdlLoggedWithTransactionId: {
                // 0x11, / 17
                vars.ddlTransactionId = buffer.readBigUInt64LE(offset);
                offset += 8;
                break;
            }
            case StatusVarCode.DefaultCollationForUtf8mb4: {
                // 0x12, / 18
                vars.defaultCollationForUtf8mb4Number =
                    buffer.readUInt16LE(offset);
                offset += 2;
                break;
            }
            case StatusVarCode.SqlRequirePrimaryKey: {
                // 0x13, / 19
                vars.sqlRequirePrimaryKey = buffer.readUint8(offset++);
                break;
            }
            case StatusVarCode.DefaultTableEncryption: {
                // 0x14, / 20
                vars.defaultTableEncryption = buffer.readUint8(offset++);
                break;
            }

            default:
                invariant(
                    false,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    `Unknown status-var code: 0x${(code as any).toString('hex')}`
                );
        }
    }

    return vars;
}

// #endregion Helpers
