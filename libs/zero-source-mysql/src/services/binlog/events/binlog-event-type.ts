/**
 * Unknown event (unused) `HEX: 0x00`
*/
export const BINLOG_EVENT_UNKNOWN = 0x00;

/**
 * Binlog format descriptor (v3, old) `HEX: 0x01`
 */
export const BINLOG_EVENT_START_V3 = 0x01;

// prettier-ignore-end

/**
 * SQL statement executed `HEX: 0x02`
 */
export const BINLOG_EVENT_QUERY = 0x02;

/**
 * End of binlog `HEX: 0x03`
 */
export const BINLOG_EVENT_STOP = 0x03;

/**
 * Binlog rotation event `HEX: 0x04`
 */
export const BINLOG_EVENT_ROTATE = 0x04;

/**
 * Internal variable change (AUTO_INC) `HEX: 0x05`
 */
export const BINLOG_EVENT_INTVAR = 0x05;

/**
 * LOAD DATA event `HEX: 0x06`
 */
export const BINLOG_EVENT_LOAD = 0x06;

/**
 * Unused `HEX: 0x07`
 */
export const BINLOG_EVENT_SLAVE = 0x07;

/**
 * CREATE TABLE from file `HEX: 0x08`
 */
export const BINLOG_EVENT_CREATE_FILE = 0x08;

/**
 * Append block to file `HEX: 0x09`
 */
export const BINLOG_EVENT_APPEND_BLOCK = 0x09;

/**
 * Execute LOAD DATA INFILE `HEX: 0x0a` `DEC: 10`
 */
export const BINLOG_EVENT_EXEC_LOAD = 0x0a;

/**
 * File deleted (LOAD DATA cleanup) `HEX: 0x0b` `DEC: 11`
 */
export const BINLOG_EVENT_DELETE_FILE = 0x0b;

/**
 * New LOAD DATA event `HEX: 0x0c` `DEC: 12`
 */
export const BINLOG_EVENT_NEW_LOAD = 0x0c;

/**
 * RAND() seed set `HEX: 0x0d` `DEC: 13`
 */
export const BINLOG_EVENT_RAND = 0x0d;

/**
 * User-defined variable changed `HEX: 0x0e` `DEC: 14`
 */
export const BINLOG_EVENT_USER_VAR = 0x0e;

/**
 * Binlog format descriptor (current) `HEX: 0x0f` `DEC: 15`
 */
export const BINLOG_EVENT_FORMAT_DESCRIPTION = 0x0f;

/**
 * Transaction commit `HEX: 0x10` `DEC: 16`
 */
export const BINLOG_EVENT_XID = 0x10;

/**
 * Begin LOAD DATA INFILE `HEX: 0x11` `DEC: 17`
 */
export const BINLOG_EVENT_BEGIN_LOAD_QUERY = 0x11;

/**
 * Execute LOAD DATA INFILE query `HEX: 0x12` `DEC: 18`
 */
export const BINLOG_EVENT_EXECUTE_LOAD_QUERY = 0x12;

/**
 * Metadata for row-based event `HEX: 0x13` `DEC: 19`
 */
export const BINLOG_EVENT_TABLE_MAP = 0x13;

/**
 * Row inserted (v0, deprecated) `HEX: 0x14` `DEC: 20`
 */
export const BINLOG_EVENT_WRITE_ROWS_V0 = 0x14;

/**
 * Row updated (v0, deprecated) `HEX: 0x15` `DEC: 21`
 */
export const BINLOG_EVENT_UPDATE_ROWS_V0 = 0x15;

/**
 * Row deleted (v0, deprecated) `HEX: 0x16` `DEC: 22`
 */
export const BINLOG_EVENT_DELETE_ROWS_V0 = 0x16;

/**
 * Row inserted (current) `HEX: 0x17` `DEC: 23`
 */
export const BINLOG_EVENT_WRITE_ROWS_V1 = 0x17;

/**
 * Row updated (current) `HEX: 0x18` `DEC: 24`
 */
export const BINLOG_EVENT_UPDATE_ROWS_V1 = 0x18;

/**
 * Row deleted (current) `HEX: 0x19` `DEC: 25`
 */
export const BINLOG_EVENT_DELETE_ROWS_V1 = 0x19;

/**
 * Incident (error/warning condition) `HEX: 0x1a` `DEC: 26`
 */
export const BINLOG_EVENT_INCIDENT = 0x1a; 

/**
 * Heartbeat signal for replication `HEX: 0x1b` `DEC: 27`
 */
export const BINLOG_EVENT_HEARTBEAT = 0x1b;

/**
 * Event can safely be ignored `HEX: 0x1c` `DEC: 28`
 */
export const BINLOG_EVENT_IGNORABLE = 0x1c;

/**
 * SQL query associated with rows event `HEX: 0x1d` `DEC: 29`
 */
export const BINLOG_EVENT_ROWS_QUERY = 0x1d;

/**
 * Row insert (MySQL >=5.6.2) `HEX: 0x1e` `DEC: 30`
 */
export const BINLOG_EVENT_WRITE_ROWS_V2 = 0x1e;

/**
 * Row update (MySQL >=5.6.2) `HEX: 0x1f` `DEC: 31`
 */
export const BINLOG_EVENT_UPDATE_ROWS_V2 = 0x1f;

/**
 * Row delete (MySQL >=5.6.2) `HEX: 0x20` `DEC: 32`
 */
export const BINLOG_EVENT_DELETE_ROWS_V2 = 0x20;

/**
 * Global transaction identifier event `HEX: 0x21` `DEC: 33`
 */
export const BINLOG_EVENT_GTID = 0x21;

/**
 * Anonymous GTID `HEX: 0x22` `DEC: 34`
 */
export const BINLOG_EVENT_ANONYMOUS_GTID = 0x22;

/**
 * Sets of previous GTIDs `HEX: 0x23` `DEC: 35`
 */
export const BINLOG_EVENT_PREVIOUS_GTIDS = 0x23;

/**
 * Transaction context info (8.0+) `HEX: 0x24` `DEC: 36`
 */
export const BINLOG_EVENT_TRANSACTION_CONTEXT = 0x24;

/**
 * Group Replication view change event `HEX: 0x25` `DEC: 37`
 */
export const BINLOG_VIEW_CHANGE = 0x25;

/**
 * XA transaction prepare event `HEX: 0x26` `DEC: 38`
 */
export const BINLOG_EVENT_XA_PREPARE_LOG = 0x26;

/**
 * Partial row updates (MySQL 8.0+) `HEX: 0x27` `DEC: 39`
 */
export const BINLOG_EVENT_PARTIAL_UPDATE_ROWS = 0x27;

/**
 * Transactional metadata (MySQL 8.0+) `HEX: 0x28` `DEC: 40`
 */
export const BINLOG_EVENT_TRANSACTION_PAYLOAD = 0x28;

export type BinlogEventType =
    | typeof BINLOG_EVENT_UNKNOWN
    | typeof BINLOG_EVENT_START_V3
    | typeof BINLOG_EVENT_QUERY
    | typeof BINLOG_EVENT_STOP
    | typeof BINLOG_EVENT_ROTATE
    | typeof BINLOG_EVENT_INTVAR
    | typeof BINLOG_EVENT_LOAD
    | typeof BINLOG_EVENT_SLAVE
    | typeof BINLOG_EVENT_CREATE_FILE
    | typeof BINLOG_EVENT_APPEND_BLOCK
    | typeof BINLOG_EVENT_EXEC_LOAD
    | typeof BINLOG_EVENT_DELETE_FILE
    | typeof BINLOG_EVENT_NEW_LOAD
    | typeof BINLOG_EVENT_RAND
    | typeof BINLOG_EVENT_USER_VAR
    | typeof BINLOG_EVENT_FORMAT_DESCRIPTION
    | typeof BINLOG_EVENT_XID
    | typeof BINLOG_EVENT_BEGIN_LOAD_QUERY
    | typeof BINLOG_EVENT_EXECUTE_LOAD_QUERY
    | typeof BINLOG_EVENT_TABLE_MAP
    | typeof BINLOG_EVENT_WRITE_ROWS_V0
    | typeof BINLOG_EVENT_UPDATE_ROWS_V0
    | typeof BINLOG_EVENT_DELETE_ROWS_V0
    | typeof BINLOG_EVENT_WRITE_ROWS_V1
    | typeof BINLOG_EVENT_UPDATE_ROWS_V1
    | typeof BINLOG_EVENT_DELETE_ROWS_V1
    | typeof BINLOG_EVENT_INCIDENT
    | typeof BINLOG_EVENT_HEARTBEAT
    | typeof BINLOG_EVENT_IGNORABLE
    | typeof BINLOG_EVENT_ROWS_QUERY
    | typeof BINLOG_EVENT_WRITE_ROWS_V2
    | typeof BINLOG_EVENT_UPDATE_ROWS_V2
    | typeof BINLOG_EVENT_DELETE_ROWS_V2
    | typeof BINLOG_EVENT_GTID
    | typeof BINLOG_EVENT_ANONYMOUS_GTID
    | typeof BINLOG_EVENT_PREVIOUS_GTIDS
    | typeof BINLOG_EVENT_TRANSACTION_CONTEXT
    | typeof BINLOG_VIEW_CHANGE
    | typeof BINLOG_EVENT_XA_PREPARE_LOG
    | typeof BINLOG_EVENT_PARTIAL_UPDATE_ROWS
    | typeof BINLOG_EVENT_TRANSACTION_PAYLOAD;

/**
 * Convenience constant for raw events
 */
export const BINLOG_EVENT_RAW = -1;
