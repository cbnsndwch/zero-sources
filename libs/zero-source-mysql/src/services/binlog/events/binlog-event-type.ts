/**
 * Unknown event (unused)
 */
export const BINLOG_EVENT_UNKNOWN = 0x00;

/**
 * Binlog format descriptor (v3, old)
 */
export const BINLOG_EVENT_START_V3 = 0x01;

/**
 * SQL statement executed
 */
export const BINLOG_EVENT_QUERY = 0x02;

/**
 * End of binlog
 */
export const BINLOG_EVENT_STOP = 0x03;

/**
 * Binlog rotation event
 */
export const BINLOG_EVENT_ROTATE = 0x04;

/**
 * Internal variable change (AUTO_INC)
 */
export const BINLOG_EVENT_INTVAR = 0x05;

/**
 * LOAD DATA event
 */
export const BINLOG_EVENT_LOAD = 0x06;

/**
 * Unused
 */
export const BINLOG_EVENT_SLAVE = 0x07;

/**
 * CREATE TABLE from file
 */
export const BINLOG_EVENT_CREATE_FILE = 0x08;

/**
 * Append block to file
 */
export const BINLOG_EVENT_APPEND_BLOCK = 0x09;

/**
 * Execute LOAD DATA INFILE
 */
export const BINLOG_EVENT_EXEC_LOAD = 0x0a;

/**
 * File deleted (LOAD DATA cleanup)
 */
export const BINLOG_EVENT_DELETE_FILE = 0x0b;

/**
 * New LOAD DATA event
 */
export const BINLOG_EVENT_NEW_LOAD = 0x0c;

/**
 * RAND() seed set
 */
export const BINLOG_EVENT_RAND = 0x0d;

/**
 * User-defined variable changed
 */
export const BINLOG_EVENT_USER_VAR = 0x0e;

/**
 * Binlog format descriptor (current)
 */
export const BINLOG_EVENT_FORMAT_DESCRIPTION = 0x0f;

/**
 * Transaction commit
 */
export const BINLOG_EVENT_XID = 0x10;

/**
 * Begin LOAD DATA INFILE
 */
export const BINLOG_EVENT_BEGIN_LOAD_QUERY = 0x11;

/**
 * Execute LOAD DATA INFILE query
 */
export const BINLOG_EVENT_EXECUTE_LOAD_QUERY = 0x12;

/**
 * Metadata for row-based event
 */
export const BINLOG_EVENT_TABLE_MAP = 0x13;

/**
 * Row inserted (v0, deprecated)
 */
export const BINLOG_EVENT_WRITE_ROWS_V0 = 0x14;

/**
 * Row updated (v0, deprecated)
 */
export const BINLOG_EVENT_UPDATE_ROWS_V0 = 0x15;

/**
 * Row deleted (v0, deprecated)
 */
export const BINLOG_EVENT_DELETE_ROWS_V0 = 0x16;

/**
 * Row inserted (current)
 */
export const BINLOG_EVENT_WRITE_ROWS_V1 = 0x17;

/**
 * Row updated (current)
 */
export const BINLOG_EVENT_UPDATE_ROWS_V1 = 0x18;

/**
 * Row deleted (current)
 */
export const BINLOG_EVENT_DELETE_ROWS_V1 = 0x19;

/**
 * Incident (error/warning condition)
 */
export const BINLOG_EVENT_INCIDENT = 0x1a;

/**
 * Heartbeat signal for replication
 */
export const BINLOG_EVENT_HEARTBEAT = 0x1b;

/**
 * Event can safely be ignored
 */
export const BINLOG_EVENT_IGNORABLE = 0x1c;

/**
 * SQL query associated with rows event
 */
export const BINLOG_EVENT_ROWS_QUERY = 0x1d;

/**
 * Row insert (MySQL >=5.6.2)
 */
export const BINLOG_EVENT_WRITE_ROWS_V2 = 0x1e;

/**
 * Row update (MySQL >=5.6.2)
 */
export const BINLOG_EVENT_UPDATE_ROWS_V2 = 0x1f;

/**
 * Row delete (MySQL >=5.6.2)
 */
export const BINLOG_EVENT_DELETE_ROWS_V2 = 0x20;

/**
 * Global transaction identifier event
 */
export const BINLOG_EVENT_GTID = 0x21;

/**
 * Anonymous GTID
 */
export const BINLOG_EVENT_ANONYMOUS_GTID = 0x22;

/**
 * Sets of previous GTIDs
 */
export const BINLOG_EVENT_PREVIOUS_GTIDS = 0x23;

/**
 * Transaction context info (8.0+)
 */
export const BINLOG_EVENT_TRANSACTION_CONTEXT = 0x24;

/**
 * Group Replication view change event
 */
export const BINLOG_VIEW_CHANGE = 0x25;

/**
 * XA transaction prepare event
 */
export const BINLOG_EVENT_XA_PREPARE_LOG = 0x26;

/**
 * Partial row updates (MySQL 8.0+)
 */
export const BINLOG_EVENT_PARTIAL_UPDATE_ROWS = 0x27;

/**
 * Transactional metadata (MySQL 8.0+)
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
