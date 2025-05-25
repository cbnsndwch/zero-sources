import type { BinlogParserMap } from '../events/binlog-event.js';

import {
    BINLOG_EVENT_ANONYMOUS_GTID,
    BINLOG_EVENT_FORMAT_DESCRIPTION,
    // BINLOG_EVENT_GTID,
    BINLOG_EVENT_PREVIOUS_GTIDS,
    BINLOG_EVENT_QUERY,
    BINLOG_EVENT_ROTATE,
    BINLOG_EVENT_TABLE_MAP,
    // BINLOG_EVENT_WRITE_ROWS_V0,
    BINLOG_EVENT_XID
} from '../events/binlog-event-type.js';

// import { makeRawEvent } from '../events/raw.event.js';

import { makeAnonymousGtidEvent } from '../events/anonymous-gtids.event.js';
import { makeFormatDescriptionEvent } from '../events/format-description.event.js';
import { makePreviousGtidsEvent } from '../events/previous-gtids.event.js';
import { makeQueryEvent } from '../events/query.event.js';
import { makeRotateEvent } from '../events/rotate.event.js';
import { makeTableMapEvent } from '../events/table-map.event.js';
import { makeXidEvent } from '../events/xid.event.js';

export const DEFAULT_PARSERS: BinlogParserMap = {
    [BINLOG_EVENT_QUERY]: makeQueryEvent,
    [BINLOG_EVENT_ROTATE]: makeRotateEvent,
    [BINLOG_EVENT_FORMAT_DESCRIPTION]: makeFormatDescriptionEvent,
    [BINLOG_EVENT_XID]: makeXidEvent,
    [BINLOG_EVENT_PREVIOUS_GTIDS]: makePreviousGtidsEvent,
    [BINLOG_EVENT_ANONYMOUS_GTID]: makeAnonymousGtidEvent,
    [BINLOG_EVENT_TABLE_MAP]: makeTableMapEvent

    // [BINLOG_EVENT_GTID]: makeGtidEvent,
    // [BINLOG_EVENT_WRITE_ROWS_V0]: makeWriteRowsEventV0,

    // DEBUG
};



