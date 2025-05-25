/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'mysql2/lib/commands/command.js' {
    import { EventEmitter } from 'node:events';

    import type BaseConnection from 'mysql2/lib/base/connection.js';

    export type CommandCallback = (
        this: Command,
        packet: Packet,
        connection: BaseConnection
    ) => CommandCallback | null;

    export default class Command extends EventEmitter {
        next: CommandCallback | null;

        execute(packet: any, connection: BaseConnection): boolean;

        start(packet?: Packet, connection?: Connection): CommandCallback | null;

        /**
         * Handles errors that occur during the binlog stream.
         *
         * @param err The error that occurred.
         */
        protected onResult(err: Error): void;
    }
}

declare module 'mysql2/lib/base/connection.js' {
    import { EventEmitter } from 'node:events';
    import { Socket } from 'node:net';
    import { TLSSocket } from 'node:tls';

    import type { Command } from 'mysql2/lib/commands/command.js';
    import ConnectionConfig from 'mysql2/lib/connection_config.js';

    export interface RegisterSlaveOptions {
        serverId?: number;
        slaveHostname?: string;
        slaveUser?: string;
        slavePassword?: string;
        slavePort?: number;
        replicationRank?: number;
        masterId?: number;
    }

    export interface Config {
        stream?: Socket | TLSSocket | ((opts: unknown) => Socket | TLSSocket);
        socketPath?: string;
        port?: number;
        host?: string;
        enableKeepAlive?: boolean;
        keepAliveInitialDelay?: number;
        maxPreparedStatements?: number;
        charsetNumber?: number;
        debug?: boolean;
        ssl?: {
            ca?: string | Buffer;
            cert?: string | Buffer;
            ciphers?: string;
            key?: string | Buffer;
            passphrase?: string;
            minVersion?: string;
            maxVersion?: string;
            rejectUnauthorized?: boolean;
            verifyIdentity?: boolean;
        };
        clientFlags?: number;
        isServer?: boolean;
        connectTimeout?: number;
        queryFormat?: (
            this: unknown,
            sql: string,
            values: unknown,
            timezone: string
        ) => string;
        stringifyObjects?: boolean;
        timezone?: string;
        namedPlaceholders?: boolean;
        infileStreamFactory?: unknown;
        rowsAsArray?: boolean;
        user?: string;
        password?: string;
        password1?: string;
        password2?: string;
        password3?: string;
        passwordSha1?: string;
        database?: string;
        pool?: boolean;
    }

    export interface QueryOptions {
        sql: string;
        values?: unknown;
        nestTables?: boolean | string;
        rowsAsArray?: boolean;
        infileStreamFactory?: unknown;
        namedPlaceholders?: boolean;
    }

    export interface ChangeUserOptions {
        user?: string;
        password?: string;
        password1?: string;
        password2?: string;
        password3?: string;
        passwordSha1?: string;
        database?: string;
        timeout?: number;
        charset?: string | number;
    }

    export default class BaseConnection extends EventEmitter {
        config: ConnectionConfig;
        stream: Socket | TLSSocket;
        sequenceId: number;
        compressedSequenceId: number;
        threadId: number | null;
        clientEncoding: string;
        serverEncoding: string;
        serverCapabilityFlags: number;
        authorized: boolean;

        private _fatalError: Error | null;
        private _protocolError: Error | null;
        private _closing: boolean;
        private _handshakePacket: unknown;
        private _command: unknown;
        private _commands: unknown;
        private _paused: boolean;
        private _paused_packets: unknown;
        private _statements: unknown;
        private _internalId: number;
        private _outOfOrderPackets: unknown[];
        private _pool?: boolean;

        constructor(opts: { config: ConnectionConfig });

        get fatalError(): Error | null;

        write(buffer: Buffer): void;
        writePacket(packet: unknown): void;
        startTLS(onSecure: (err?: Error) => void): void;
        protocolError(message: string, code?: string): void;
        handlePacket(packet?: unknown): void;
        format(sql: string, values?: unknown): string;
        escape(value: unknown): string;
        escapeId(value: unknown): string;
        raw(sql: string): unknown;
        query(
            sql: string | QueryOptions | unknown,
            values?: unknown,
            cb?: (err: Error | null, result?: unknown) => void
        ): unknown;
        pause(): void;
        resume(): void;
        prepare(
            options: string | QueryOptions,
            cb?: (err: Error | null, stmt?: unknown) => void
        ): unknown;
        unprepare(sql: string | QueryOptions): unknown;
        execute(
            sql: string | QueryOptions,
            values?: unknown,
            cb?: (err: Error | null, result?: unknown) => void
        ): unknown;
        changeUser(
            options: ChangeUserOptions,
            callback?: (err?: Error) => void
        ): unknown;
        beginTransaction(cb?: (err?: Error) => void): unknown;
        commit(cb?: (err?: Error) => void): unknown;
        rollback(cb?: (err?: Error) => void): unknown;
        ping(cb?: (err?: Error) => void): unknown;
        destroy(): void;
        close(): void;
        connect(cb?: (err: Error | null, conn?: this) => void): void;
        end(callback?: (err?: Error) => void): unknown;

        // Server-side methods
        writeColumns(columns: unknown[]): void;
        writeTextRow(column: unknown[]): void;
        writeBinaryRow(column: unknown[]): void;
        writeTextResult(
            rows: unknown[],
            columns: unknown[],
            binary?: boolean
        ): void;
        writeEof(warnings?: number, statusFlags?: number): void;
        writeOk(args?: unknown): void;
        writeError(args: unknown): void;
        serverHandshake(args: unknown): unknown;

        static createQuery(
            sql: string | QueryOptions,
            values: unknown,
            cb: (err: Error | null, result?: unknown) => void,
            config: Config
        ): unknown;

        static statementKey(options: QueryOptions): string;

        // #region Commands Pipeline

        public addCommand<TCommand extends Command>(cmd: TCommand): TCommand;

        // #endregion Commands Pipeline

        // #region Binlog Processing - This is what we really care about

        protected _registerSlave(
            opts: RegisterSlaveOptions,
            cb: () => void
        ): void;

        // #endregion Binlog Processing - This is what we really care about
    }
}

declare module 'mysql2/lib/packets/packet.js' {
    export interface PacketOptions {
        id: number;
        buffer: Buffer;
        start: number;
        end: number;
    }

    export default class Packet {
        sequenceId: number;
        numPackets: number;
        buffer: Buffer;
        start: number;
        offset: number;
        end: number;

        constructor(id: number, buffer: Buffer, start: number, end: number);

        reset(): void;
        length(): number;
        slice(): Buffer;
        dump(): void;
        haveMoreData(): boolean;
        skip(num: number): void;

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
        isEOF(): boolean;
        eofStatusFlags(): number;
        eofWarningCount(): number;

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
        readDateTime(timezone?: string): Date | null;
        readDateTimeString(
            decimals?: number,
            timeSep?: string,
            columnType?: number
        ): string;
        readTimeString(convertTtoMs?: boolean): string | number;

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
        parseInt(
            len: number,
            supportBigNumbers?: boolean
        ): number | string | null;
        parseIntNoBigCheck(len: number): number | null;
        parseGeometryValue(): any;
        parseVector(): number[];
        parseDate(timezone?: string): Date | null;
        parseDateTime(timezone?: string): Date | null;
        parseFloat(len: number): number | null;
        parseLengthCodedIntNoBigCheck(): number | null;
        parseLengthCodedInt(
            supportBigNumbers?: boolean
        ): number | string | null;
        parseLengthCodedIntString(): string | null;
        parseLengthCodedFloat(): number | null;
        peekByte(): number;
        isAlt(): boolean;
        isError(): boolean;
        asError(encoding?: string): Error;

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
        clone(): Packet;
        type(): string;

        // #region Extensions

        /**
         * Parses a UUID from the provided packet.
         *
         * @param this - The packet to read from.
         * @returns A UUID string in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
         */
        readUUID(this: Packet): string;

        /**
         * Reads an unsigned 64-bit integer from the current packet position.
         *
         * This method reads two 32-bit integers (low and high parts) from the packet,
         * combines them into a single 64-bit unsigned integer, and returns the result
         * as a `BigInt`.
         *
         * @returns The unsigned 64-bit integer value read from the packet.
         */
        readUInt64(this: Packet): bigint;

        // #endregion Extensions

        static lengthCodedNumberLength(n: number): number;
        static lengthCodedStringLength(str: string, encoding?: string): number;
        static MockBuffer(): Buffer;
    }
}

declare module 'mysql2/lib/connection_config.js' {
    export interface SSLProfile {
        ca?: string | Buffer;
        cert?: string | Buffer;
        ciphers?: string;
        key?: string | Buffer;
        passphrase?: string;
        minVersion?: string;
        maxVersion?: string;
        rejectUnauthorized?: boolean;
        [key: string]: any;
    }

    export interface ConnectionConfigOptions {
        authPlugins?: any;
        authSwitchHandler?: any;
        bigNumberStrings?: boolean;
        charset?: string;
        charsetNumber?: number;
        compress?: boolean;
        connectAttributes?: Record<string, any>;
        connectTimeout?: number;
        database?: string;
        dateStrings?: boolean;
        debug?: boolean;
        decimalNumbers?: boolean;
        enableKeepAlive?: boolean;
        flags?: string | string[];
        host?: string;
        insecureAuth?: boolean;
        infileStreamFactory?: any;
        isServer?: boolean;
        keepAliveInitialDelay?: number;
        localAddress?: string;
        maxPreparedStatements?: number;
        multipleStatements?: boolean;
        namedPlaceholders?: boolean;
        nestTables?: boolean | string;
        password?: string;
        password1?: string;
        password2?: string;
        password3?: string;
        passwordSha1?: string;
        pool?: boolean;
        port?: number | string;
        queryFormat?: (
            this: any,
            sql: string,
            values: any,
            timezone: string
        ) => string;
        rowsAsArray?: boolean;
        socketPath?: string;
        ssl?: SSLProfile | string | boolean;
        stream?: any;
        stringifyObjects?: boolean;
        supportBigNumbers?: boolean;
        timezone?: string;
        trace?: boolean;
        typeCast?: boolean | ((field: any, next: () => void) => any);
        uri?: string;
        user?: string;
        disableEval?: boolean;
        connectionLimit?: number;
        maxIdle?: number;
        idleTimeout?: number;
        Promise?: any;
        queueLimit?: number;
        waitForConnections?: boolean;
        jsonStrings?: boolean;
        [key: string]: any;
    }

    export default class ConnectionConfig {
        isServer?: boolean;
        stream?: any;
        host: string;
        port: number;
        localAddress?: string;
        socketPath?: string;
        user?: string;
        password?: string;
        password1?: string;
        password2?: string;
        password3?: string;
        passwordSha1?: string;
        database?: string;
        connectTimeout: number;
        insecureAuth: boolean;
        infileStreamFactory?: any;
        supportBigNumbers: boolean;
        bigNumberStrings: boolean;
        decimalNumbers: boolean;
        dateStrings: boolean;
        debug?: boolean;
        trace: boolean;
        stringifyObjects: boolean;
        enableKeepAlive: boolean;
        keepAliveInitialDelay?: number;
        timezone: string;
        queryFormat?: (
            this: any,
            sql: string,
            values: any,
            timezone: string
        ) => string;
        pool?: boolean;
        ssl: SSLProfile | boolean;
        multipleStatements: boolean;
        rowsAsArray: boolean;
        namedPlaceholders: boolean;
        nestTables?: boolean | string;
        typeCast: boolean | ((field: any, next: () => void) => any);
        disableEval: boolean;
        maxPacketSize: number;
        charsetNumber: number;
        compress: boolean;
        authPlugins?: any;
        authSwitchHandler?: any;
        clientFlags: number;
        connectAttributes: Record<string, any>;
        maxPreparedStatements: number;
        jsonStrings: boolean;

        constructor(options: ConnectionConfigOptions | string);

        static mergeFlags(
            default_flags: string[],
            user_flags: string | string[]
        ): number;
        static getDefaultFlags(options?: ConnectionConfigOptions): string[];
        static getCharsetNumber(charset: string): number;
        static getSSLProfile(name: string): SSLProfile;
        static parseUrl(url: string): ConnectionConfigOptions;
    }
}
