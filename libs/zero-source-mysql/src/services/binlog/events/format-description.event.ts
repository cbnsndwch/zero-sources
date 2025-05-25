import type Packet from 'mysql2/lib/packets/packet.js';

import type {
    BinlogEventBase,
    BinlogEventHeader,
    MakeBinlogEventOptions
} from './binlog-event.js';
import { BINLOG_EVENT_FORMAT_DESCRIPTION } from './binlog-event-type.js';

export type ChecksumAlgorithm = 'NONE' | 'CRC32';

export type BinlogEventFormatDescriptionData = {
    /**
     *
     */
    binlogVersion: number;

    /**
     *
     */
    serverVersion: string;

    /**
     *
     */
    createTimestamp: number;

    /**
     *
     * @remarks should always be 19
     */
    eventHeaderLength: number;

    /**
     *
     */
    eventLengths: number[];

    /**
     * Final byte: checksum algorithm
     *
     * - `0` => `NONE`
     * - `1` => `CRC32`
     */
    checksumAlgorithm: ChecksumAlgorithm;
};

export type BinlogEventFormatDescription = BinlogEventBase<
    'FORMAT_DESCRIPTION',
    typeof BINLOG_EVENT_FORMAT_DESCRIPTION,
    BinlogEventFormatDescriptionData
>;

export function makeFormatDescriptionEvent(
    options: MakeBinlogEventOptions,
    header: BinlogEventHeader,
    packet: Packet
): BinlogEventFormatDescription {
    const binlogVersion = packet.readInt16();

    // eslint-disable-next-line no-control-regex
    const serverVersion = packet.readString(50, 'utf8').replace(/\u0000.*/, '');
    const createTimestamp = packet.readInt32();

    // should be 19
    const eventHeaderLength = packet.readInt8();

    // remaining bytes before the last byte are per-event‐type header lengths
    const count =
        packet.end - packet.offset - 1 - (options.useChecksum ? 4 : 0);

    const eventLengths: number[] = [];
    for (let i = 0; i < count; i++) {
        eventLengths.push(packet.readInt8());
    }

    // Final byte: checksum algorithm (0=NONE, 1=CRC32, …)
    const checksumAlgoByte = packet.readInt8();

    // handle 4 bytes for checksum if needed
    const checksum = options.useChecksum ? packet.readInt32() : undefined;

    const data: BinlogEventFormatDescriptionData = {
        binlogVersion,
        serverVersion,
        createTimestamp,
        eventHeaderLength,
        eventLengths,
        checksumAlgorithm: getChecksumAlgorithm(checksumAlgoByte)
        // checksumAlgorithm: 'CRC32'
    };

    return {
        type: BINLOG_EVENT_FORMAT_DESCRIPTION,
        name: 'FORMAT_DESCRIPTION',
        header,
        data,
        checksum
    };
}

function getChecksumAlgorithm(
    checksumAlgorithmByte: number
): ChecksumAlgorithm {
    switch (checksumAlgorithmByte) {
        case 0:
            return 'NONE';
        case 1:
            return 'CRC32';
        default:
            throw new Error(
                `Unsupported checksum algorithm: ${checksumAlgorithmByte}`
            );
    }
}
