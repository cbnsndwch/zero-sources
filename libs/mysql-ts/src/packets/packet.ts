// This file was modified by Oracle on June 1, 2021.
// A comment describing some changes in the strict default SQL mode regarding
// non-standard dates was introduced.
// Modifications copyright (c) 2021, Oracle and/or its affiliates.

'use strict';

import type { WithImplicitCoercion } from 'node:buffer';

import Long from 'long';

import { invariant } from '@cbnsndwch/zero-contracts';

import type {
    WKBGeometry,
    WKBLineString,
    WKBMultiGeometry,
    WKBPoint,
    WKBPolygon
} from '../contracts/geometry.js';
import type { IPacket } from '../contracts/packet.js';

import ErrorCodeToName, { ErrorCode } from '../constants/errors.js';
import { DATETIME } from '../constants/types.js';

import { PacketError } from '../errors/packet.error.js';

import { decode, encode } from '../parsers/string.js';

type LengthCodedNumberTag = 0xfb | 0xfc | 0xfd | 0xfe;

const INVALID_DATE = new Date(NaN);

// this is nearly duplicate of previous function so generated code is not slower
// due to "if (dateStrings)" branching
const pad = '000000000000';
function leftPad(num: number, value: number) {
    const s = value.toString();
    // if we don't need to pad
    if (s.length >= num) {
        return s;
    }
    return (pad + s).slice(-num);
}

// The whole reason parse* function below exist
// is because String creation is relatively expensive (at least with V8), and if we have
// a buffer with "12345" content ideally we would like to bypass intermediate
// "12345" string creation and directly build 12345 number out of
// <Buffer 31 32 33 34 35> data.
// In my benchmarks the difference is ~25M 8-digit numbers per second vs
// 4.5 M using Number(packet.readLengthCodedString())
// not used when size is close to max precision as series of *10 accumulate error
// and approximate result might be different from (approximate as well) Number(bigNumStringValue))
// In the future node version if speed difference is smaller parse* functions might be removed
// don't consider them as Packet public API

const minus = '-'.charCodeAt(0);
const plus = '+'.charCodeAt(0);

// TODO: handle scientific notation (e.g. 1.23e+4) as well
const dot = '.'.charCodeAt(0);
const exponent = 'e'.charCodeAt(0);
const exponentCapital = 'E'.charCodeAt(0);

export default class Packet implements IPacket {
    sequenceId: number;
    numPackets: number;
    buffer: Buffer<ArrayBufferLike>;
    start: number;
    offset: number;
    end: number;

    _name?: string;

    constructor(id: number, buffer: Buffer, start: number, end: number) {
        // hot path, enable checks when testing only
        // if (!Buffer.isBuffer(buffer) || typeof start == 'undefined' || typeof end == 'undefined')
        //  throw new Error('invalid packet');
        this.sequenceId = id;
        this.numPackets = 1;
        this.buffer = buffer;
        this.start = start;
        this.offset = start + 4;
        this.end = end;
    }

    //#region Meta

    get type() {
        if (this.isEOF) {
            return 'EOF';
        }
        if (this.isError) {
            return 'Error';
        }
        if (this.buffer[this.offset] === 0) {
            return 'maybeOK'; // could be other packet types as well
        }

        return '';
    }

    get length() {
        return this.end - this.start;
    }

    get hasMoreData() {
        return this.end > this.offset;
    }

    get isEOF() {
        return this.buffer[this.offset] === 0xfe && this.length < 13;
    }

    /**
     * OxFE is often used as "Alt" flag - not ok, not error.
     * For example, it's first byte of AuthSwitchRequest
     */
    get isAlt() {
        return this.peekByte() === 0xfe;
    }

    get isError() {
        return this.peekByte() === 0xff;
    }

    dump() {
        console.log(
            // Buffer.prototype.asciiSlice is there but undocumented
            // see https://github.com/nodejs/node/issues/46467
            // https://github.com/nodejs/node/pull/48041
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [(this.buffer as any).asciiSlice(this.start, this.end)],
            this.buffer.subarray(this.start, this.end),
            this.length,
            this.sequenceId
        );
    }

    eofStatusFlags() {
        return this.buffer.readInt16LE(this.offset + 3);
    }

    eofWarningCount() {
        return this.buffer.readInt16LE(this.offset + 1);
    }

    /**
     * Parses the packet data as a MySQL error packet and returns an Error object.
     *
     * This method reads a MySQL error packet structure which contains:
     * - Field count (1 byte)
     * - Error code (2 bytes)
     * - Optional SQL state (6 bytes total: '#' marker + 5-character state)
     * - Error message (remaining bytes)
     *
     * @param encoding - The character encoding to use when reading the error message string
     * @returns An Error object extended with MySQL-specific properties:
     *   - `code`: The error code name (string representation)
     *   - `errno`: The numeric error code
     *   - `sqlState`: The SQL state string (empty if not present)
     *   - `sqlMessage`: The error message text
     */
    asError(encoding: string): PacketError {
        this.reset();

        // fieldCount
        this.readInt8();

        const errorCode = this.readInt16()! as ErrorCode;

        let sqlState = '';
        if (this.buffer[this.offset] === 0x23) {
            this.skip(1);
            sqlState = this.readBuffer(5).toString();
        }

        const message = this.readString(undefined, encoding);

        return new PacketError(message, {
            err: ErrorCodeToName[errorCode],
            errorCode,
            sqlState
        });
    }

    clone(): IPacket {
        return new Packet(
            this.sequenceId,
            this.buffer,
            this.start,
            this.end
        ) as IPacket;
    }

    /**
     * @deprecated User `get hasMoreData` instead.
     */
    haveMoreData() {
        return this.hasMoreData;
    }
    //#endregion Meta

    //#region Lifecycle

    reset(): void {
        this.offset = this.start + 4;
    }

    //#endregion Lifecycle

    //#region Read

    skip(num: number) {
        this.offset += num;
    }

    slice() {
        return this.buffer.subarray(this.start, this.end);
    }

    peekByte() {
        return this.buffer[this.offset]!;
    }

    readInt8() {
        return this.buffer[this.offset++]!;
    }

    readInt16() {
        this.offset += 2;
        return this.buffer.readUInt16LE(this.offset - 2);
    }

    readInt24() {
        return this.readInt16() + (this.readInt8()! << 16);
    }

    readInt32() {
        this.offset += 4;
        return this.buffer.readUInt32LE(this.offset - 4);
    }

    readSInt8() {
        return this.buffer.readInt8(this.offset++);
    }

    readSInt16() {
        this.offset += 2;
        return this.buffer.readInt16LE(this.offset - 2);
    }

    readSInt32() {
        this.offset += 4;
        return this.buffer.readInt32LE(this.offset - 4);
    }

    readInt64JSNumber() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        const l = new Long(word0, word1, true);
        return l.toNumber();
    }

    readSInt64JSNumber() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        if (!(word1 & 0x80000000)) {
            return word0 + 0x100000000 * word1;
        }
        const l = new Long(word0, word1, false);
        return l.toNumber();
    }

    readInt64String() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        const res = new Long(word0, word1, true);
        return res.toString();
    }

    readSInt64String() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        const res = new Long(word0, word1, false);
        return res.toString();
    }

    readInt64() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        const res = new Long(word0, word1, true);

        const resNumber = res.toNumber();
        const resString = res.toString();
        return resNumber.toString() === resString ? resNumber : resString;
    }

    readSInt64() {
        const word0 = this.readInt32();
        const word1 = this.readInt32();
        const res = new Long(word0, word1, false);

        const resNumber = res.toNumber();
        const resString = res.toString();
        return resNumber.toString() === resString ? resNumber : resString;
    }

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
    readLengthCodedNumber(bigNumberStrings?: boolean, signed?: boolean) {
        const byte1 = this.buffer[this.offset++]!;
        if (byte1 < 251) {
            return byte1;
        }

        return this.readLengthCodedNumberExt(
            byte1 as LengthCodedNumberTag,
            bigNumberStrings,
            signed
        );
    }

    readLengthCodedNumberSigned(bigNumberStrings?: boolean) {
        return this.readLengthCodedNumber(bigNumberStrings, true);
    }

    readLengthCodedNumberExt(
        tag: LengthCodedNumberTag,
        bigNumberStrings?: boolean,
        signed?: boolean
    ) {
        let word0, word1;
        let res;

        if (tag === 0xfb) {
            return null;
        }

        if (tag === 0xfc) {
            return this.readInt8()! + (this.readInt8()! << 8);
        }

        if (tag === 0xfd) {
            return (
                this.readInt8()! +
                (this.readInt8()! << 8) +
                (this.readInt8()! << 16)
            );
        }

        if (tag === 0xfe) {
            // TODO: check version
            // Up to MySQL 3.22, 0xfe was followed by a 4-byte integer.
            word0 = this.readInt32();
            word1 = this.readInt32();
            if (word1 === 0) {
                return word0; // don't convert to float if possible
            }
            if (word1 < 2097152) {
                // max exact float point int, 2^52 / 2^32
                return word1 * 0x100000000 + word0;
            }
            res = new Long(word0, word1, !signed); // Long need unsigned
            const resNumber = res.toNumber();
            const resString = res.toString();
            res = resNumber.toString() === resString ? resNumber : resString;
            return bigNumberStrings ? resString : res;
        }

        console.trace();
        throw new Error(`Should not reach here: ${tag}`);
    }

    readFloat() {
        const res = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return res;
    }

    readDouble() {
        const res = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return res;
    }

    readBuffer(len?: number) {
        if (typeof len === 'undefined') {
            len = this.end - this.offset;
        }
        this.offset += len;
        return this.buffer.slice(this.offset - len, this.offset);
    }

    /**
     * `DATE`, `DATETIME` and `TIMESTAMP`
     */
    readDateTime(timezone: string) {
        if (!timezone || timezone === 'Z' || timezone === 'local') {
            const length = this.readInt8()!;

            if (length === 0xfb) {
                return null;
            }

            let y = 0;
            let m = 0;
            let d = 0;
            let H = 0;
            let M = 0;
            let S = 0;
            let ms = 0;

            if (length > 3) {
                y = this.readInt16()!;
                m = this.readInt8()!;
                d = this.readInt8()!;
            }

            if (length > 6) {
                H = this.readInt8()!;
                M = this.readInt8()!;
                S = this.readInt8()!;
            }

            if (length > 10) {
                ms = this.readInt32() / 1000;
            }

            // NO_ZERO_DATE mode and NO_ZERO_IN_DATE mode are part of the strict
            // default SQL mode used by MySQL 8.0. This means that non-standard
            // dates like '0000-00-00' become NULL. For older versions and other
            // possible MySQL flavours we still need to account for the
            // non-standard behavior.
            if (y + m + d + H + M + S + ms === 0) {
                return INVALID_DATE;
            }

            if (timezone === 'Z') {
                return new Date(Date.UTC(y, m - 1, d, H, M, S, ms));
            }

            return new Date(y, m - 1, d, H, M, S, ms);
        }

        let str = this.readDateTimeString(6, 'T');
        if (str.length === 10) {
            str += 'T00:00:00';
        }

        return new Date(str + timezone);
    }

    readDateTimeString(
        decimals?: number,
        timeSep?: string,
        columnType?: number
    ) {
        let y = 0;
        let m = 0;
        let d = 0;
        let H = 0;
        let M = 0;
        let S = 0;
        let ms = 0;
        let str = '';

        const length = this.readInt8()!;
        if (length > 3) {
            y = this.readInt16()!;
            m = this.readInt8()!;
            d = this.readInt8()!;
            str = [leftPad(4, y), leftPad(2, m), leftPad(2, d)].join('-');
        }

        if (length > 6) {
            H = this.readInt8()!;
            M = this.readInt8()!;
            S = this.readInt8()!;
            str += `${timeSep || ' '}${[
                leftPad(2, H),
                leftPad(2, M),
                leftPad(2, S)
            ].join(':')}`;
        } else if (columnType === DATETIME) {
            str += ' 00:00:00';
        }

        if (length > 10) {
            ms = this.readInt32()!;
            str += '.';

            let _ms: number | string = ms;
            if (decimals) {
                _ms = leftPad(6, _ms);
                if (_ms.length > decimals) {
                    _ms = _ms.substring(0, decimals); // rounding is done at the MySQL side, only 0 are here
                }
            }
            str += _ms;
        }

        return str;
    }

    /**
     * `TIME` - value as a string, Can be negative
     */
    readTimeString(convertToMs?: boolean) {
        const length = this.readInt8()!;
        if (length === 0) {
            return '00:00:00';
        }

        // 'isNegative' flag byte
        const sign = this.readInt8() ? -1 : 1;

        let d = 0;
        let H = 0;
        let M = 0;
        let S = 0;
        let ms = 0;

        if (length > 6) {
            d = this.readInt32();
            H = this.readInt8()!;
            M = this.readInt8()!;
            S = this.readInt8()!;
        }

        if (length > 10) {
            ms = this.readInt32();
        }

        if (convertToMs) {
            H += d * 24;
            M += H * 60;
            S += M * 60;
            ms += S * 1000;
            ms *= sign;
            return ms;
        }

        // Format follows MySQL TIME format: ([-][h]hh:mm:ss[.u[u[u[u[u[u]]]]]])
        // For positive times below 24 hours, this makes it equal to ISO 8601 times
        return (
            (sign === -1 ? '-' : '') +
            [leftPad(2, d * 24 + H), leftPad(2, M), leftPad(2, S)].join(':') +
            (ms ? `.${ms}`.replace(/0+$/, '') : '')
        );
    }

    /**
     * Reads a length-coded string from the current packet.
     *
     * The function first reads an 8-bit integer to determine the length of the string,
     * then reads the string of that length using the specified encoding.
     *
     * @param encoding - The character encoding to use when reading the string. Defaults to 'utf8'.
     * @returns The decoded string read from the packet.
     */
    readLengthCodedString(encoding: string) {
        const len = this.readLengthCodedNumber() as number | null;

        // TODO: check manually first byte here to avoid polymorphic return type?
        if (len === null) {
            return null;
        }

        this.offset += len;

        // TODO: Use characterSetCode to get proper encoding
        // https://github.com/sidorares/node-mysql2/pull/374
        return decode(this.buffer, encoding, this.offset - len, this.offset);
    }

    readLengthCodedBuffer() {
        const len = this.readLengthCodedNumber() as number | null;
        if (len === null) {
            return null;
        }
        return this.readBuffer(len);
    }

    readNullTerminatedString(encoding: string) {
        const start = this.offset;
        let end = this.offset;
        while (this.buffer[end]) {
            end = end + 1; // TODO: handle OOB check
        }
        this.offset = end + 1;
        return decode(this.buffer, encoding, start, end);
    }

    readString(encoding: string): string;
    readString(len: number, encoding?: string): string;
    readString(len?: number, encoding?: string): string;
    readString(len?: number | string, encoding?: string): string {
        if (typeof len === 'string' && typeof encoding === 'undefined') {
            encoding = len;
            len = undefined;
        }

        if (typeof len === 'undefined') {
            len = this.end - this.offset;
        }

        this.offset += len as number;
        return decode(
            this.buffer,
            encoding!,
            this.offset - (len as number),
            this.offset
        );
    }

    //#endregion Read

    //#region Read Extensions

    /**
     * Parses a UUID from the provided packet.
     *
     * @param this - The packet to read from.
     * @returns A UUID string in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
     */
    readUuid(): string {
        const buffer = this.readBuffer(16);

        const uuid = [
            buffer.toString('hex', 0, 4),
            buffer.toString('hex', 4, 6),
            buffer.toString('hex', 6, 8),
            buffer.toString('hex', 8, 10),
            buffer.toString('hex', 10, 16)
        ].join('-');

        return uuid;
    }

    /**
     * Reads an unsigned 64-bit integer from the current packet position.
     *
     * This method reads two 32-bit integers (low and high parts) from the packet,
     * combines them into a single 64-bit unsigned integer, and returns the result
     * as a `BigInt`.
     *
     * @returns The unsigned 64-bit integer value read from the packet.
     */
    readUInt64(this: IPacket): bigint {
        const low = this.readInt32();
        const high = this.readInt32();

        // Convert to BigInt
        return (BigInt(high) << 32n) | BigInt(low);
    }

    //#endregion Read Extensions

    //#region Parse - Fancy Read

    parseInt(len: number | null, supportBigNumbers?: false): number | null;
    parseInt(
        len: number | null,
        supportBigNumbers: true
    ): number | string | null;
    parseInt(
        len: number | null,
        supportBigNumbers?: boolean
    ): number | string | null {
        if (len === null) {
            return null;
        }
        if (len >= 14 && !supportBigNumbers) {
            const s = this.buffer.toString(
                'ascii',
                this.offset,
                this.offset + len
            );
            this.offset += len;
            return Number(s);
        }
        let result = 0;
        const start = this.offset;
        const end = this.offset + len;
        let sign = 1;
        if (len === 0) {
            return 0; // TODO: assert? exception?
        }
        if (this.buffer[this.offset] === minus) {
            this.offset++;
            sign = -1;
        }
        // max precise int is 9007199254740992
        let str;
        const numDigits = end - this.offset;
        if (supportBigNumbers) {
            if (numDigits >= 15) {
                str = this.readString(end - this.offset, 'binary');
                result = parseInt(str, 10);
                if (result.toString() === str) {
                    return sign * result;
                }
                return sign === -1 ? `-${str}` : str;
            }
            if (numDigits > 16) {
                str = this.readString(end - this.offset);
                return sign === -1 ? `-${str}` : str;
            }
        }
        if (this.buffer[this.offset] === plus) {
            this.offset++; // just ignore
        }
        while (this.offset < end) {
            result *= 10;
            result += this.buffer[this.offset]! - 48;
            this.offset++;
        }
        const num = result * sign;
        if (!supportBigNumbers) {
            return num;
        }
        str = this.buffer.toString('ascii', start, end);
        if (num.toString() === str) {
            return num;
        }
        return str;
    }

    /**
     * note that if value of inputNumberAsString is bigger than MAX_SAFE_INTEGER
     * ( or smaller than MIN_SAFE_INTEGER ) the parseIntNoBigCheck result might be
     * different from what you would get from Number(inputNumberAsString)
     * String(parseIntNoBigCheck) <> String(Number(inputNumberAsString)) <> inputNumberAsString
     *
     * @param len - length of number in bytes, or null if no number
     * @return parsed number, or null if no number
     */
    parseIntNoBigCheck(len: number | null) {
        if (len === null) {
            return null;
        }

        let result = 0;
        const end = this.offset + len;
        let sign = 1;
        if (len === 0) {
            // TODO: assert? exception?
            return 0;
        }

        if (this.buffer[this.offset] === minus) {
            this.offset++;
            sign = -1;
        }

        if (this.buffer[this.offset] === plus) {
            // just ignore
            this.offset++;
        }

        while (this.offset < end) {
            result *= 10;
            result += this.buffer[this.offset]! - 48;
            this.offset++;
        }

        return result * sign;
    }

    /**
     *  Copy/paste from {@link https://github.com/mysqljs/mysql/blob/master/lib/protocol/Parser.js}
     */
    parseGeometryValue(): WKBGeometry | null {
        const _buffer = this.readLengthCodedBuffer();
        let offset = 4;
        if (!_buffer || !_buffer.length) {
            return null;
        }

        const buffer = _buffer!;

        function parseGeometry() {
            let x, y, i, j, numPoints;

            const byteOrder = buffer.readUInt8(offset);
            offset += 1;

            const wkbType = byteOrder
                ? buffer.readUInt32LE(offset)
                : buffer.readUInt32BE(offset);
            offset += 4;

            switch (wkbType) {
                case 1: {
                    // WKBPoint
                    x = byteOrder
                        ? buffer.readDoubleLE(offset)
                        : buffer.readDoubleBE(offset);
                    offset += 8;

                    y = byteOrder
                        ? buffer.readDoubleLE(offset)
                        : buffer.readDoubleBE(offset);
                    offset += 8;

                    return { x, y } as WKBPoint;
                }
                case 2: {
                    const result: WKBLineString = [];

                    numPoints = byteOrder
                        ? buffer.readUInt32LE(offset)
                        : buffer.readUInt32BE(offset);
                    offset += 4;

                    for (i = numPoints; i > 0; i--) {
                        x = byteOrder
                            ? buffer.readDoubleLE(offset)
                            : buffer.readDoubleBE(offset);
                        offset += 8;
                        y = byteOrder
                            ? buffer.readDoubleLE(offset)
                            : buffer.readDoubleBE(offset);
                        offset += 8;
                        result.push({ x, y });
                    }

                    return result;
                }

                case 3: {
                    // WKBPolygon
                    const result: WKBPolygon = [];

                    const numRings = byteOrder
                        ? buffer.readUInt32LE(offset)
                        : buffer.readUInt32BE(offset);
                    offset += 4;

                    for (i = numRings; i > 0; i--) {
                        numPoints = byteOrder
                            ? buffer.readUInt32LE(offset)
                            : buffer.readUInt32BE(offset);
                        offset += 4;

                        const line: WKBLineString = [];
                        for (j = numPoints; j > 0; j--) {
                            x = byteOrder
                                ? buffer.readDoubleLE(offset)
                                : buffer.readDoubleBE(offset);
                            offset += 8;
                            y = byteOrder
                                ? buffer.readDoubleLE(offset)
                                : buffer.readDoubleBE(offset);
                            offset += 8;
                            line.push({ x, y });
                        }
                        result.push(line);
                    }

                    return result;
                }

                case 4: // WKBMultiPoint
                case 5: // WKBMultiLineString
                case 6: // WKBMultiPolygon
                case 7: {
                    // WKBGeometryCollection
                    const num = byteOrder
                        ? buffer.readUInt32LE(offset)
                        : buffer.readUInt32BE(offset);
                    offset += 4;

                    const result: WKBMultiGeometry = [];
                    for (i = num; i > 0; i--) {
                        const item = parseGeometry();
                        result.push(item);
                    }

                    return result;
                }

                default:
                    // sanity check
                    invariant(false, `Unsupported WKB type: ${wkbType}`);
            }
        }

        return parseGeometry();
    }

    parseVector() {
        const bufLen = this.readLengthCodedNumber() as number;
        const vectorEnd = this.offset + bufLen;

        const result = [];
        while (this.offset < vectorEnd && this.offset < this.end) {
            result.push(this.readFloat());
        }

        return result;
    }

    parseDate(timezone?: string) {
        const strLen = this.readLengthCodedNumber();
        if (strLen === null) {
            return null;
        }
        if (strLen !== 10) {
            // we expect only YYYY-MM-DD here.
            // if for some reason it's not the case return invalid date
            return new Date(NaN);
        }
        const y = this.parseInt(4)!;
        this.offset++;

        const m = this.parseInt(2)!;
        this.offset++;

        const d = this.parseInt(2)!;
        if (!timezone || timezone === 'local') {
            return new Date(y, m - 1, d);
        }

        if (timezone === 'Z') {
            return new Date(Date.UTC(y, m - 1, d));
        }

        return new Date(
            `${leftPad(4, y)}-${leftPad(2, m)}-${leftPad(2, d)}T00:00:00${timezone}`
        );
    }

    parseDateTime(timezone?: string) {
        const str = this.readLengthCodedString('binary');

        if (str === null) {
            return null;
        }

        if (!timezone || timezone === 'local') {
            return new Date(str);
        }

        return new Date(`${str}${timezone}`);
    }

    parseFloat(len: number | null) {
        if (len === null) {
            return null;
        }

        if (len === 0) {
            return 0; // TODO: assert? exception?
        }

        const end = this.offset + len;

        let result = 0;
        let factor = 1;
        let pastDot = false;
        let charCode = 0;

        if (this.buffer[this.offset] === minus) {
            this.offset++;
            factor = -1;
        }

        if (this.buffer[this.offset] === plus) {
            this.offset++; // just ignore
        }

        while (this.offset < end) {
            charCode = this.buffer[this.offset]!;
            if (charCode === dot) {
                pastDot = true;
                this.offset++;
            } else if (charCode === exponent || charCode === exponentCapital) {
                this.offset++;
                const exponentValue = this.parseInt(end - this.offset)!;
                return (result / factor) * Math.pow(10, exponentValue);
            } else {
                result *= 10;
                result += this.buffer[this.offset]! - 48;
                this.offset++;
                if (pastDot) {
                    factor = factor * 10;
                }
            }
        }
        return result / factor;
    }

    parseLengthCodedIntNoBigCheck() {
        // FIXME: risky business here
        return this.parseIntNoBigCheck(this.readLengthCodedNumber() as any);
    }

    parseLengthCodedInt(supportBigNumbers?: boolean) {
        // FIXME: risky business here
        return this.parseInt(
            this.readLengthCodedNumber() as number,
            supportBigNumbers as any
        );
    }

    parseLengthCodedIntString() {
        return this.readLengthCodedString('binary');
    }

    parseLengthCodedFloat() {
        // FIXME: risky business here
        return this.parseFloat(this.readLengthCodedNumber() as any);
    }

    //#endregion Parse - Fancy Read

    //#region Write

    writeInt32(n: number) {
        this.buffer.writeUInt32LE(n, this.offset);
        this.offset += 4;
    }

    writeInt24(n: number) {
        this.writeInt8(n & 0xff);
        this.writeInt16(n >> 8);
    }

    writeInt16(n: number) {
        this.buffer.writeUInt16LE(n, this.offset);
        this.offset += 2;
    }

    writeInt8(n: number) {
        this.buffer.writeUInt8(n, this.offset);
        this.offset++;
    }

    writeDouble(n: number) {
        this.buffer.writeDoubleLE(n, this.offset);
        this.offset += 8;
    }

    writeBuffer(b: Buffer) {
        b.copy(this.buffer, this.offset);
        this.offset += b.length;
    }

    writeNull() {
        this.buffer[this.offset] = 0xfb;
        this.offset++;
    }

    // TODO: refactor following three?
    writeNullTerminatedString(s: string, encoding: string) {
        const buf = encode(s, encoding);

        if (this.buffer.length) {
            buf.copy(this.buffer, this.offset);
        }

        this.offset += buf.length;
        this.writeInt8(0);
    }

    writeString(s: string, encoding: string) {
        if (s === null) {
            this.writeInt8(0xfb);
            return;
        }
        if (s.length === 0) {
            return;
        }
        // const bytes = Buffer.byteLength(s, 'utf8');
        // this.buffer.write(s, this.offset, bytes, 'utf8');
        // this.offset += bytes;
        const buf = encode(s, encoding);

        if (this.buffer.length) {
            buf.copy(this.buffer, this.offset);
        }

        this.offset += buf.length;
    }

    writeLengthCodedString(s: string, encoding: string) {
        const buf = encode(s, encoding);
        this.writeLengthCodedNumber(buf.length);

        if (this.buffer.length) {
            buf.copy(this.buffer, this.offset);
        }

        this.offset += buf.length;
    }

    writeLengthCodedBuffer(b: Buffer) {
        this.writeLengthCodedNumber(b.length);
        b.copy(this.buffer, this.offset);
        this.offset += b.length;
    }

    writeLengthCodedNumber(n: number) {
        if (n < 0xfb) {
            return this.writeInt8(n);
        }
        if (n < 0xffff) {
            this.writeInt8(0xfc);
            return this.writeInt16(n);
        }
        if (n < 0xffffff) {
            this.writeInt8(0xfd);
            return this.writeInt24(n);
        }
        if (n === null) {
            return this.writeInt8(0xfb);
        }
        // TODO: check that n is out of int precision
        this.writeInt8(0xfe);
        this.buffer.writeUInt32LE(n, this.offset);
        this.offset += 4;
        this.buffer.writeUInt32LE(n >> 32, this.offset);
        this.offset += 4;
        return this.offset;
    }

    writeDate(d: Date, timezone: string) {
        this.buffer.writeUInt8(11, this.offset);
        if (!timezone || timezone === 'local') {
            this.buffer.writeUInt16LE(d.getFullYear(), this.offset + 1);
            this.buffer.writeUInt8(d.getMonth() + 1, this.offset + 3);
            this.buffer.writeUInt8(d.getDate(), this.offset + 4);
            this.buffer.writeUInt8(d.getHours(), this.offset + 5);
            this.buffer.writeUInt8(d.getMinutes(), this.offset + 6);
            this.buffer.writeUInt8(d.getSeconds(), this.offset + 7);
            this.buffer.writeUInt32LE(
                d.getMilliseconds() * 1000,
                this.offset + 8
            );
        } else {
            if (timezone !== 'Z') {
                const offset =
                    (timezone[0] === '-' ? -1 : 1) *
                    (parseInt(timezone.substring(1, 3), 10) * 60 +
                        parseInt(timezone.substring(4), 10));
                if (offset !== 0) {
                    d = new Date(d.getTime() + 60000 * offset);
                }
            }
            this.buffer.writeUInt16LE(d.getUTCFullYear(), this.offset + 1);
            this.buffer.writeUInt8(d.getUTCMonth() + 1, this.offset + 3);
            this.buffer.writeUInt8(d.getUTCDate(), this.offset + 4);
            this.buffer.writeUInt8(d.getUTCHours(), this.offset + 5);
            this.buffer.writeUInt8(d.getUTCMinutes(), this.offset + 6);
            this.buffer.writeUInt8(d.getUTCSeconds(), this.offset + 7);
            this.buffer.writeUInt32LE(
                d.getUTCMilliseconds() * 1000,
                this.offset + 8
            );
        }
        this.offset += 12;
    }

    writeHeader(sequenceId: number) {
        const offset = this.offset;
        this.offset = 0;
        this.writeInt24(this.buffer.length - 4);
        this.writeInt8(sequenceId);
        this.offset = offset;
    }

    //#endregion Write

    static lengthCodedNumberLength(n: number) {
        if (n < 0xfb) {
            return 1;
        }
        if (n < 0xffff) {
            return 3;
        }
        if (n < 0xffffff) {
            return 5;
        }
        return 9;
    }

    static lengthCodedStringLength(
        str: WithImplicitCoercion<string>,
        encoding: string
    ) {
        const buf = encode(str, encoding);
        const slen = buf.length;
        return Packet.lengthCodedNumberLength(slen) + slen;
    }

    static MockBuffer() {
        const noop = function () {};

        const res = Buffer.alloc(0);
        for (const op in Buffer.prototype) {
            if (typeof res[op as any] === 'function') {
                (res as any)[op] = noop;
            }
        }

        return res;
    }
}
