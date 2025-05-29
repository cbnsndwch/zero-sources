import type { Dict } from '@cbnsndwch/zero-contracts';
import { WKBGeometry } from './geometry.js';

export interface IPacket {
    sequenceId: number;
    numPackets: number;
    buffer: Buffer;
    start: number;
    offset: number;
    end: number;

    _name?: string;

    //#region Meta

    get type(): string;

    get length(): number;

    get hasMoreData(): boolean;

    get isEOF(): boolean;

    get isAlt(): boolean;

    get isError(): boolean;

    dump(): void;

    eofStatusFlags(): number;

    eofWarningCount(): number;

    asError(encoding?: string): Error & Dict;

    clone(): IPacket;

    /**
     * @deprecated Use `get hasMoreData` instead.
     */
    haveMoreData(): boolean;
    //#endregion Meta

    //#region Lifecycle

    reset(): void;

    //#endregion Lifecycle

    //#region Read

    skip(num: number): void;

    slice(): Buffer;

    peekByte(): number;

    readInt8(): number;
    readInt16(): number;
    readInt24(): number;
    readInt32(): number;
    readSInt8(): number;
    readSInt16(): number;
    readSInt32(): number;
    readInt64JSNumber(): number;
    readSInt64JSNumber(): number;
    readInt64String(): string;
    readSInt64String(): string;
    readInt64(): number | string;
    readSInt64(): number | string;

    /**
     * Reads a length-coded number from the current position in the Packet.
     *
     * The function reads the first byte to determine the length of the number:
     * - If the first byte is less than 0xfb, it is returned as the value.
     * - If the first byte is 0xfc, the next 2 bytes are read as a 16-bit integer.
     * - If the first byte is 0xfd, the next 3 bytes are read as a 24-bit integer.
     * - If the first byte is 0xfe, the next 8 bytes are read as a 64-bit integer.
     * - For any other value, 0 is returned.
     *
     * @param bigNumberStrings - If true, the function returns the number as a string.
     * @param signed - If true, the function returns a signed number.
     */
    readLengthCodedNumber(
        bigNumberStrings?: boolean,
        signed?: boolean
    ): number | string | null;

    readLengthCodedNumberSigned(
        bigNumberStrings?: boolean
    ): number | string | null;

    readLengthCodedNumberExt(
        tag: number,
        bigNumberStrings?: boolean,
        signed?: boolean
    ): number | string | null;

    readFloat(): number;

    readDouble(): number;

    readBuffer(len?: number): Buffer;

    /**
     * `DATE`, `DATETIME` and `TIMESTAMP`
     */
    readDateTime(timezone?: string): Date | null;

    readDateTimeString(
        decimals?: number,
        timeSep?: string,
        columnType?: number
    ): string;

    /**
     * `TIME` - value as a string, Can be negative
     */
    readTimeString(convertToMs?: boolean): string | number;

    /**
     * Reads a length-coded string from the current packet.
     *
     * The function first reads an 8-bit integer to determine the length of the string,
     * then reads the string of that length using the specified encoding.
     *
     * @param encoding - The character encoding to use when reading the string. Defaults to 'utf8'.
     * @returns The decoded string read from the packet.
     */
    readLengthCodedString(encoding?: string): string | null;

    readLengthCodedBuffer(): Buffer | null;

    readNullTerminatedString(encoding?: string): string;

    readString(len?: number | string, encoding?: string): string;

    //#endregion Read

    //#region Read Extensions

    /**
     * Parses a UUID from the provided packet.
     *
     * @param this - The packet to read from.
     * @returns A UUID string in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
     */
    readUuid(this: IPacket): string;

    /**
     * Reads an unsigned 64-bit integer from the current packet position.
     *
     * This method reads two 32-bit integers (low and high parts) from the packet,
     * combines them into a single 64-bit unsigned integer, and returns the result
     * as a `BigInt`.
     *
     * @returns The unsigned 64-bit integer value read from the packet.
     */
    readUInt64(this: IPacket): bigint;

    //#endregion Read Extensions

    //#region Parse - Fancy Read

    parseInt(len: number, supportBigNumbers?: boolean): number | string | null;
    parseIntNoBigCheck(len: number): number | null;
    parseVector(): number[];
    parseDate(timezone?: string): Date | null;
    parseDateTime(timezone?: string): Date | null;
    parseFloat(len: number): number | null;
    parseLengthCodedIntNoBigCheck(): number | null;
    parseLengthCodedInt(supportBigNumbers?: boolean): number | string | null;
    parseLengthCodedIntString(): string | null;
    parseLengthCodedFloat(): number | null;

    parseGeometryValue(): WKBGeometry | null;

    //#endregion Parse - Fancy Read

    //#region Write

    writeInt32(n: number): void;
    writeInt24(n: number): void;
    writeInt16(n: number): void;
    writeInt8(n: number): void;
    writeDouble(n: number): void;
    writeBuffer(b: Buffer): void;
    writeNull(): void;
    writeNullTerminatedString(s: string, encoding?: string): void;
    writeString(s: string | null, encoding?: string): void;
    writeLengthCodedString(s: string, encoding?: string): void;
    writeLengthCodedBuffer(b: Buffer): void;
    writeLengthCodedNumber(n: number | null): number | void;
    writeDate(d: Date, timezone?: string): void;
    writeHeader(sequenceId: number): void;

    //#endregion Write
}
