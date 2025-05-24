import {
    BINLOG_EVENT_FORMAT_DESCRIPTION,
    BINLOG_EVENT_QUERY,
    // BINLOG_EVENT_GTID,
    // BINLOG_EVENT_ANONYMOUS_GTID,
    // BINLOG_EVENT_PREVIOUS_GTIDS,
    // BINLOG_EVENT_TABLE_MAP,
    // BINLOG_EVENT_WRITE_ROWS_V0,
    BINLOG_EVENT_ROTATE,
    BINLOG_EVENT_XID
} from '../events/binlog-event-type.js';

import { makeFormatDescriptionEvent } from '../events/format-description.event.js';
import { makeQueryEvent } from '../events/query.event.js';
import { makeRotateEvent } from '../events/rotate.event.js';
import { makeXidEvent } from '../events/xid.event.js';

export const DEFAULT_PARSERS = {
    [BINLOG_EVENT_QUERY]: makeQueryEvent,
    [BINLOG_EVENT_ROTATE]: makeRotateEvent,
    [BINLOG_EVENT_FORMAT_DESCRIPTION]: makeFormatDescriptionEvent,
    [BINLOG_EVENT_XID]: makeXidEvent

    // [BINLOG_EVENT_GTID]: makeGtidEvent,
    // [BINLOG_EVENT_ANONYMOUS_GTID]: makeAnonymousGtidEvent,
    // [BINLOG_EVENT_PREVIOUS_GTIDS]: makePreviousGtidEvent,
    // [BINLOG_EVENT_TABLE_MAP]: makeTableMapEvent,
    // [BINLOG_EVENT_WRITE_ROWS_V0]: makeWriteRowsEventV0,
};
