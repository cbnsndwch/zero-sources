'use strict';

import Net from 'node:net';
import { URL } from 'node:url';

import type { Dict } from '@cbnsndwch/zero-contracts';

import pkJson from '../package.json' with { type: 'json' };

import * as Charsets from './constants/charsets.js';
import * as ClientConstants from './constants/client.js';

import type { AuthPlugin } from './contracts/auth-plugin.js';
import type {
    AuthSwitchHandler,
    ConnectionOptions,
    InFileStreamFactory,
    QueryFormatFn
} from './contracts/connection-options.js';
import type { SslOptions, SslProfile } from './contracts/ssl-options.js';

import type { TypeCastFn } from './parsers/type-cast.js';

let SSLProfiles: Record<string, SslProfile> | null = null;

const { version } = pkJson;

const validOptions = [
    'authPlugins',
    'authSwitchHandler',
    'bigNumberStrings',
    'charset',
    'charsetNumber',
    'compress',
    'connectAttributes',
    'connectTimeout',
    'database',
    'dateStrings',
    'debug',
    'decimalNumbers',
    'enableKeepAlive',
    'flags',
    'host',
    'insecureAuth',
    'infileStreamFactory',
    'isServer',
    'keepAliveInitialDelay',
    'localAddress',
    'maxPreparedStatements',
    'multipleStatements',
    'namedPlaceholders',
    'nestTables',
    'password',
    // with multi-factor authentication, the main password (used for the first
    // authentication factor) can be provided via password1
    'password1',
    'password2',
    'password3',
    'passwordSha1',
    'pool',
    'port',
    'queryFormat',
    'rowsAsArray',
    'socketPath',
    'ssl',
    'stream',
    'stringifyObjects',
    'supportBigNumbers',
    'timezone',
    'trace',
    'typeCast',
    'uri',
    'user',
    'disableEval',
    // These options are used for Pool
    'connectionLimit',
    'maxIdle',
    'idleTimeout',
    'queueLimit',
    'waitForConnections',
    'jsonStrings'
];

export default class ConnectionConfig {
    isServer: boolean | undefined;

    stream: Net.Socket | SocketFactory;

    localAddress: string | undefined;
    socketPath: string | undefined;

    host: string;
    port: number;
    user: string | undefined;
    database: string | undefined;

    password: string | undefined;
    password2: string | undefined;
    password3: string | undefined;
    passwordSha1: string | undefined;
    insecureAuth: boolean;

    connectTimeout: number | undefined;

    infileStreamFactory: InFileStreamFactory | undefined;

    supportBigNumbers: boolean;
    bigNumberStrings: boolean;
    decimalNumbers: boolean;
    dateStrings: boolean | ('TIMESTAMP' | 'DATETIME' | 'DATE')[];

    debug: boolean | string[];
    trace: boolean;

    stringifyObjects: boolean;

    enableKeepAlive: boolean;
    keepAliveInitialDelay: number | undefined;

    timezone: string;

    queryFormat: QueryFormatFn | undefined;
    ssl: boolean | SslOptions;

    pool: unknown;

    multipleStatements: boolean;
    rowsAsArray: boolean;
    namedPlaceholders: boolean;
    nestTables: string | boolean | undefined;
    disableEval: boolean;
    typeCast: boolean | TypeCastFn;

    maxPacketSize: number;
    charsetNumber: number;
    compress: boolean;
    authPlugins: Record<string, AuthPlugin> | undefined;
    clientFlags: number;
    maxPreparedStatements: number;
    jsonStrings: boolean;

    authSwitchHandler: AuthSwitchHandler | undefined;

    connectAttributes: Dict & {
        _client_name: string;
        _client_version: string;
    };

    constructor(options: ConnectionOptions | string) {
        if (typeof options === 'string') {
            options = ConnectionConfig.parseUrl(options);
        } else if (options?.uri) {
            const uriOptions = ConnectionConfig.parseUrl(options.uri);
            for (const _key in uriOptions) {
                if (!Object.prototype.hasOwnProperty.call(uriOptions, _key)) {
                    continue;
                }

                const key = _key as keyof ConnectionOptions;

                if (options[key] === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (options as any)[key] = (uriOptions as any)[key]!;
                }
            }
        }

        for (const key in options) {
            if (!Object.prototype.hasOwnProperty.call(options, key)) {
                continue;
            }

            if (!validOptions.includes(key)) {
                // REVIEW: Should this be emitted somehow?
                console.error(
                    `Ignoring invalid configuration option passed to Connection: ${key}. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection`
                );
            }
        }

        this.isServer = options.isServer;
        this.stream = options.stream;
        this.host = options.host || 'localhost';
        this.port =
            (typeof options.port === 'string'
                ? parseInt(options.port, 10)
                : options.port) || 3306;
        this.localAddress = options.localAddress;
        this.socketPath = options.socketPath;
        this.user = options.user || undefined;

        // for the purpose of multi-factor authentication, or not, the main
        // password (used for the 1st authentication factor) can also be
        // provided via the "password1" option
        this.password = options.password || options.password1 || undefined;
        this.password2 = options.password2 || undefined;
        this.password3 = options.password3 || undefined;
        this.passwordSha1 = options.passwordSha1 || undefined;

        this.database = options.database;

        this.connectTimeout = isNaN(options.connectTimeout ?? NaN)
            ? 10 * 1000
            : options.connectTimeout;

        this.insecureAuth = options.insecureAuth || false;

        this.infileStreamFactory = options.infileStreamFactory || undefined;

        this.supportBigNumbers = options.supportBigNumbers || false;
        this.bigNumberStrings = options.bigNumberStrings || false;
        this.decimalNumbers = options.decimalNumbers || false;
        this.dateStrings = options.dateStrings || false;

        this.debug = options.debug || false;
        this.trace = options.trace !== false;

        this.stringifyObjects = options.stringifyObjects || false;

        this.enableKeepAlive = options.enableKeepAlive !== false;
        this.keepAliveInitialDelay = options.keepAliveInitialDelay;

        if (
            options.timezone &&
            !/^(?:local|Z|[ +-]\d\d:\d\d)$/.test(options.timezone)
        ) {
            // strictly supports timezones specified by mysqljs/mysql:
            // https://github.com/mysqljs/mysql#user-content-connection-options

            console.error(
                `Ignoring invalid timezone passed to Connection: ${options.timezone}. This is currently a warning, but in future versions of MySQL2, an error will be thrown if you pass an invalid configuration option to a Connection`
            );

            // SqlStrings falls back to UTC on invalid timezone
            this.timezone = 'Z';
        } else {
            this.timezone = options.timezone || 'local';
        }

        this.queryFormat = options.queryFormat;
        this.pool = options.pool || undefined;
        this.ssl = options.ssl || false;

        this.multipleStatements = options.multipleStatements || false;
        this.rowsAsArray = options.rowsAsArray || false;
        this.namedPlaceholders = options.namedPlaceholders || false;
        this.nestTables =
            options.nestTables === undefined ? undefined : options.nestTables;
        this.typeCast =
            options.typeCast === undefined ? true : options.typeCast;
        this.disableEval = Boolean(options.disableEval);

        if (this.timezone[0] === ' ') {
            // "+" is a url encoded char for space so it
            // gets translated to space when giving a
            // connection string..
            this.timezone = `+${this.timezone.slice(1)}`;
        }

        if (this.ssl) {
            if (typeof this.ssl !== 'object') {
                throw new TypeError(
                    `SSL profile must be an object, instead it's a ${typeof this.ssl}`
                );
            }

            // Default rejectUnauthorized to true
            this.ssl.rejectUnauthorized = this.ssl.rejectUnauthorized !== false;
        }

        this.maxPacketSize = 0;
        this.charsetNumber = options.charset
            ? ConnectionConfig.getCharsetNumber(options.charset)
            : options.charsetNumber || Charsets.UTF8MB4_UNICODE_CI;
        this.compress = options.compress || false;
        this.authPlugins = options.authPlugins;
        this.clientFlags = ConnectionConfig.mergeFlags(
            ConnectionConfig.getDefaultFlags(options),
            options.flags || []
        );

        this.authSwitchHandler = options.authSwitchHandler;

        // Default connection attributes
        // https://dev.mysql.com/doc/refman/8.0/en/performance-schema-connection-attribute-tables.html
        const defaultConnectAttributes = {
            _client_name: '@cbnsndwch/mysql-ts',
            _client_version: version
        } as const;

        this.connectAttributes = {
            ...defaultConnectAttributes,
            ...(options.connectAttributes || {})
        };

        this.maxPreparedStatements = options.maxPreparedStatements || 16000;
        this.jsonStrings = options.jsonStrings || false;
    }

    static mergeFlags(defaultFlags: string[], userFlags: string[]) {
        let flags = 0x0,
            i;

        if (!Array.isArray(userFlags)) {
            userFlags = String(userFlags || '')
                .toUpperCase()
                .split(/\s*,+\s*/);
        }

        // add default flags unless "blacklisted"
        for (i in defaultFlags) {
            if (userFlags.indexOf(`-${defaultFlags[i]}`) >= 0) {
                continue;
            }

            const flag = defaultFlags[i];
            if (!flag) {
                continue;
            }

            const flagValue =
                ClientConstants[flag as keyof typeof ClientConstants];
            if (!flagValue) {
                continue;
            }

            flags |= flagValue;
        }

        // add user flags unless already already added
        for (i in userFlags) {
            const flag = userFlags[i];

            if (!flag || flag[0] === '-') {
                continue;
            }

            if (defaultFlags.includes(flag)) {
                continue;
            }

            const flagValue =
                ClientConstants[flag as keyof typeof ClientConstants];
            if (!flagValue) {
                continue;
            }

            flags |= flagValue;
        }

        return flags;
    }

    static getDefaultFlags(options: ConnectionOptions) {
        const defaultFlags = [
            'LONG_PASSWORD',
            'FOUND_ROWS',
            'LONG_FLAG',
            'CONNECT_WITH_DB',
            'ODBC',
            'LOCAL_FILES',
            'IGNORE_SPACE',
            'PROTOCOL_41',
            'IGNORE_SIGPIPE',
            'TRANSACTIONS',
            'RESERVED',
            'SECURE_CONNECTION',
            'MULTI_RESULTS',
            'TRANSACTIONS',
            'SESSION_TRACK',
            'CONNECT_ATTRS'
        ];
        if (options?.multipleStatements) {
            defaultFlags.push('MULTI_STATEMENTS');
        }

        defaultFlags.push('PLUGIN_AUTH');
        defaultFlags.push('PLUGIN_AUTH_LENENC_CLIENT_DATA');

        return defaultFlags;
    }

    static getCharsetNumber(charset: string): number {
        const charsetNumber =
            Charsets[charset.toUpperCase() as keyof typeof Charsets];

        if (charsetNumber === undefined) {
            throw new TypeError(`Unknown charset '${charset}'`);
        }

        return charsetNumber;
    }

    static async getSSLProfile(name: string) {
        if (!SSLProfiles) {
            SSLProfiles = (await import('./constants/ssl-profiles.js')).default;
        }

        const ssl = SSLProfiles[name];
        if (ssl === undefined) {
            throw new TypeError(`Unknown SSL profile '${name}'`);
        }
        return ssl;
    }

    static parseUrl(url: string) {
        const parsedUrl = new URL(url);

        const options: Dict = {
            host: decodeURIComponent(parsedUrl.hostname),
            port: parseInt(parsedUrl.port, 10),
            database: decodeURIComponent(parsedUrl.pathname.slice(1)),
            user: decodeURIComponent(parsedUrl.username),
            password: decodeURIComponent(parsedUrl.password)
        };

        for (const [value, key] of parsedUrl.searchParams) {
            try {
                // Try to parse this as a JSON expression first
                options[key] = JSON.parse(value);
            } catch {
                // Otherwise assume it is a plain string
                options[key] = value;
            }
        }

        return options;
    }
}

export type SocketFactory = (config: ConnectionConfig) => Net.Socket;
