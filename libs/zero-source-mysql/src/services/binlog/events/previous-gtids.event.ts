import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_PREVIOUS_GTIDS } from './binlog-event-type.js';

export type GtidInterval = {
    start: number;
    end: number;
};

export type GtidSet = {
    /**
     * The UUID of the GTID set
     */
    uuid: string;

    /**
     * The intervals of the GTID set
     */
    intervals: GtidInterval[];
};

export type BinlogEventPreviousGtidsData = {
    /**
     * List of GTID sets
     */
    gtidSets: GtidSet[];
};

export type BinlogEventPreviousGtids = BinlogEventBase<
    'PREVIOUS_GTIDS',
    typeof BINLOG_EVENT_PREVIOUS_GTIDS,
    BinlogEventPreviousGtidsData
>;

/**
 * Parses a PREVIOUS_GTIDS event from the binlog.
 *
 * The event contains a sequence of GTID sets (UUID + intervals)
 *
 * Format:
 *   uint64 n_sid (number of SIDs)
 *   for each SID:
 *     16 bytes SID (UUID)
 *     uint64 n_intervals
 *     for each interval:
 *       uint64 start
 *       uint64 end (open interval, not inclusive)
 *
 * @param options Binlog stream options
 * @param header Event header
 * @param packet Binary packet parser
 * @see {@link https://dev.mysql.com/doc/dev/mysql-server/8.4.4/classmysql_1_1binlog_1_1event_1_1Previous__gtids__event.html}
 */
export async function makePreviousGtidsEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): Promise<BinlogEventPreviousGtids> {
    const gtidSets: GtidSet[] = [];

    const gtidSetCount = Number(packet.readInt64());
    for (let i = 0; i < gtidSetCount; i++) {
        // read 16 bytes SID (a UUID)
        const uuid = packet.readUUID();

        // GTID := `${uuid}:${start}-${end}`
        const set: GtidSet = { uuid, intervals: [] };

        const nIntervals = Number(packet.readInt64());

        for (let j = 0; j < nIntervals; j++) {
            const start = Number(packet.readInt64());
            const end = Number(packet.readInt64());

            set.intervals.push({
                start,
                end
            });
        }

        gtidSets.push(set);
    }

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    return {
        name: 'PREVIOUS_GTIDS',
        type: BINLOG_EVENT_PREVIOUS_GTIDS,
        header,
        data: {
            gtidSets
        },
        checksum
    };
}
