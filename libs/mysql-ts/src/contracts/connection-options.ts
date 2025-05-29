import { Readable } from 'node:stream';

import type { Dict } from '@cbnsndwch/zero-contracts';

import type { TypeCast } from '../parsers/type-cast.js';
import { SslOptions } from './ssl-options.js';
import { AuthPlugin } from './auth-plugin.js';

export type ConnectionOptions = {
    /**
     * DECIMAL and NEWDECIMAL types will be returned as numbers if this option is set to `true` ( default: `false`).
     */
    decimalNumbers?: boolean;

    /**
     * The MySQL user to authenticate as
     */
    user?: string;

    /**
     * The password of that MySQL user
     */
    password?: string;

    /**
     * Alias for the MySQL user password. Makes a bit more sense in a multi-factor authentication setup (see
     * "password2" and "password3")
     */
    password1?: string;

    /**
     * 2nd factor authentication password. Mandatory when the authentication policy for the MySQL user account
     * requires an additional authentication method that needs a password.
     * https://dev.mysql.com/doc/refman/8.0/en/multifactor-authentication.html
     */
    password2?: string;

    /**
     * 3rd factor authentication password. Mandatory when the authentication policy for the MySQL user account
     * requires two additional authentication methods and the last one needs a password.
     * https://dev.mysql.com/doc/refman/8.0/en/multifactor-authentication.html
     */
    password3?: string;

    /**
     * Name of the database to use for this connection
     */
    database?: string;

    /**
     * The charset for the connection. This is called 'collation' in the SQL-level of MySQL (like utf8_general_ci).
     * If a SQL-level charset is specified (like utf8mb4) then the default collation for that charset is used.
     * (Default: 'UTF8_GENERAL_CI')
     */
    charset?: string;

    /**
     * The hostname of the database you are connecting to. (Default: localhost)
     */
    host?: string;

    /**
     * The port number to connect to. (Default: 3306)
     */
    port?: number;

    /**
     * The source IP address to use for TCP connection
     */
    localAddress?: string;

    /**
     * The path to a unix domain socket to connect to. When used host and port are ignored
     */
    socketPath?: string;

    /**
     * The timezone used to store local dates. (Default: 'local')
     */
    timezone?: string | 'local';

    /**
     * The milliseconds before a timeout occurs during the initial connection to the MySQL server. (Default: 10 seconds)
     */
    connectTimeout?: number;

    /**
     * Stringify objects instead of converting to values. (Default: 'false')
     */
    stringifyObjects?: boolean;

    /**
     * Allow connecting to MySQL instances that ask for the old (insecure) authentication method. (Default: false)
     */
    insecureAuth?: boolean;

    /**
     * By specifying a function that returns a readable stream, an arbitrary stream can be sent when sending a local fs file.
     */
    infileStreamFactory?: InFileStreamFactory;

    /**
     * Determines if column values should be converted to native JavaScript types.
     *
     * @default true
     *
     * It is not recommended (and may go away / change in the future) to disable type casting, but you can currently do so on either the connection or query level.
     *
     * ---
     *
     * You can also specify a function to do the type casting yourself:
     * ```ts
     * (field: Field, next: () => unknown) => {
     *   return next();
     * }
     * ```
     *
     * ---
     *
     * **WARNING:**
     *
     * YOU MUST INVOKE the parser using one of these three field functions in your custom typeCast callback. They can only be called once:
     *
     * ```js
     * field.string();
     * field.buffer();
     * field.geometry();
     * ```
     *
     * Which are aliases for:
     *
     * ```js
     * parser.parseLengthCodedString();
     * parser.parseLengthCodedBuffer();
     * parser.parseGeometryValue();
     * ```
     *
     * You can find which field function you need to use by looking at `RowDataPacket.prototype._typeCast`.
     */
    typeCast?: TypeCast;

    /**
     * A custom query format function
     */
    queryFormat?: QueryFormatFn;

    /**
     * When dealing with big numbers (BIGINT and DECIMAL columns) in the database, you should enable this option
     * (Default: false)
     */
    supportBigNumbers?: boolean;

    /**
     * Enabling both supportBigNumbers and bigNumberStrings forces big numbers (BIGINT and DECIMAL columns) to be
     * always returned as JavaScript String objects (Default: false). Enabling supportBigNumbers but leaving
     * bigNumberStrings disabled will return big numbers as String objects only when they cannot be accurately
     * represented with [JavaScript Number objects](https://262.ecma-international.org/5.1/#sec-8.5)
     * (which happens when they exceed the [-2^53, +2^53] range), otherwise they will be returned as Number objects.
     * This option is ignored if supportBigNumbers is disabled.
     */
    bigNumberStrings?: boolean;

    /**
     * Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date
     * objects. Can be true/false or an array of type names to keep as strings.
     *
     * (Default: false)
     */
    dateStrings?: boolean | Array<'TIMESTAMP' | 'DATETIME' | 'DATE'>;

    /**
     * This will print all incoming and outgoing packets on stdout.
     * You can also restrict debugging to packet types by passing an array of types (strings) to debug;
     *
     * (Default: false)
     */
    debug?: string[] | boolean;

    /**
     * Generates stack traces on Error to include call site of library entrance ('long stack traces'). Slight
     * performance penalty for most calls. (Default: true)
     */
    trace?: boolean;

    /**
     * Allow multiple mysql statements per query. Be careful with this, it exposes you to SQL injection attacks. (Default: false)
     */
    multipleStatements?: boolean;

    /**
     * List of connection flags to use other than the default ones. It is also possible to blacklist default ones
     */
    flags?: Array<string>;

    /**
     * object with ssl parameters or a string containing name of ssl profile
     */
    ssl?: SslOptions;

    /**
     * Return each row as an array, not as an object.
     * This is useful when you have duplicate column names.
     * This can also be set in the `QueryOption` object to be applied per-query.
     */
    rowsAsArray?: boolean;

    /**
     * Enable keep-alive on the socket. (Default: true)
     */
    enableKeepAlive?: boolean;

    /**
     * If keep-alive is enabled users can supply an initial delay. (Default: 0)
     */
    keepAliveInitialDelay?: number;

    charsetNumber?: number;

    compress?: boolean;

    authSwitchHandler?: AuthSwitchHandler;

    connectAttributes?: Dict;

    isServer?: boolean;

    maxPreparedStatements?: number;

    namedPlaceholders?: boolean;

    nestTables?: boolean | string;

    passwordSha1?: string;

    pool?: any;

    stream?: any;

    uri?: string;

    connectionLimit?: number;

    maxIdle?: number;

    idleTimeout?: number;

    queueLimit?: number;

    waitForConnections?: boolean;

    disableEval?: boolean;

    authPlugins?: Record<string, AuthPlugin>;

    /**
     * Force JSON to be returned as string
     *
     * (Default: false)
     */
    jsonStrings?: boolean;
};

export type InFileStreamFactory = (path: string) => Readable;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFormatFn = (query: string, values: any) => void;

export type AuthSwitchHandler = (data: any, callback: () => void) => any;
