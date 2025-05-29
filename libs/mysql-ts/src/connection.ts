import EventEmitter from 'node:events';
import Net from 'node:net';
import Timers from 'node:timers';

import Queue from 'denque';
import { createLRU } from 'lru.min';

import type { Dict } from '@cbnsndwch/zero-contracts';

import type { ICommand } from './contracts/command.js';

import CharsetToEncoding, {
    type Encoding
} from './constants/charset-encodings.js';

import { ProtocolError } from './errors/protocol.error.js';
import Commands from './commands/index.js';

import ConnectionConfig from './connection-config.js';
import { IPacket } from './contracts/packet.js';
import PacketParser from './packet-parser.js';
import { ErrorPacket } from './packets/error.packet.js';
import ErrorCodeToName from './constants/errors.js';
import { OutOfOrderPacketError } from './errors/out-of-order-packet.error.js';

let _connectionId = 0;

let convertNamedPlaceholders = null;

type LruCache<TKey, TValue> = ReturnType<typeof createLRU<TKey, TValue>>;

// TODO: add missing fields
type IStatement = {
    close: () => void;
};

export default class Connection extends EventEmitter {
    config: ConnectionConfig;

    stream: Net.Socket;
    serverCapabilityFlags: number;
    authorized: boolean;
    sequenceId: number;
    compressedSequenceId: number;
    threadId: unknown;

    clientEncoding: Encoding | undefined;
    serverEncoding: Encoding;

    connectTimeout: NodeJS.Timeout | null = null;

    private _internalId: number;
    private _commands: Queue<ICommand>;
    private _command: ICommand | null;
    private _paused: boolean;
    private _paused_packets: Queue<IPacket>;
    private _statements: LruCache<string, IStatement>;
    private _handshakePacket: null;
    _fatalError: unknown;
    _protocolError: ProtocolError | null;
    private _outOfOrderPackets: unknown[];

    private _closing = false;
    private _pool = false;
    packetParser: PacketParser;
    connectionId: any;

    constructor(config: ConnectionConfig) {
        super();

        this.config = config;

        // TODO: fill defaults
        // if no params, connect to /var/lib/mysql/mysql.sock ( /tmp/mysql.sock on OSX )
        // if host is given, connect to host:3306

        // TODO: use `/usr/local/mysql/bin/mysql_config --socket` output? as default socketPath

        // if there is no host/port and no socketPath parameters?
        if (!config.stream) {
            if (config.socketPath) {
                this.stream = Net.connect(config.socketPath);
            } else {
                this.stream = Net.connect(config.port || 3306, config.host);

                // Optionally enable keep-alive on the socket.
                if (this.config.enableKeepAlive) {
                    this.stream.on('connect', () => {
                        this.stream.setKeepAlive(
                            true,
                            this.config.keepAliveInitialDelay
                        );
                    });
                }

                // Enable TCP_NODELAY flag. This is needed so that the network packets
                // are sent immediately to the server
                this.stream.setNoDelay(true);
            }
            // if stream is a function, treat it as "stream agent / factory"
        } else if (typeof config.stream === 'function') {
            this.stream = config.stream(config);
        } else {
            this.stream = config.stream;
        }

        this._internalId = _connectionId++;
        this._commands = new Queue<ICommand>();
        this._command = null;
        this._paused = false;
        this._paused_packets = new Queue<IPacket>();

        this._statements = createLRU<string, IStatement>({
            max: this.config.maxPreparedStatements,
            onEviction: function (_, statement) {
                statement.close();
            }
        });

        this.serverCapabilityFlags = 0;
        this.authorized = false;
        this.sequenceId = 0;
        this.compressedSequenceId = 0;
        this.threadId = null;

        this._handshakePacket = null;
        this._fatalError = null;
        this._protocolError = null;
        this._outOfOrderPackets = [];
        this.clientEncoding = CharsetToEncoding[this.config.charsetNumber];
        this.stream.on('error', this._handleNetworkError.bind(this));

        this.packetParser = new PacketParser(p => {
            this.handlePacket(p);
        });

        this.stream
            .on('data', data => {
                if (this.connectTimeout) {
                    Timers.clearTimeout(this.connectTimeout);
                    this.connectTimeout = null;
                }
                this.packetParser.execute(data);
            })
            .on('end', () => {
                // emit the end event so that the pooled connection can close the connection
                this.emit('end');
            })
            .on('close', () => {
                // we need to set this flag everywhere where we want connection to close
                if (this._closing) {
                    return;
                }

                if (!this._protocolError) {
                    // no particular error message before disconnect
                    this._protocolError = new ProtocolError(
                        'Connection lost: The server closed the connection.',
                        'PROTOCOL_CONNECTION_LOST',
                        true
                    );
                }
                this._notifyError(this._protocolError);
            });

        let handshakeCommand: ICommand;
        if (!this.config.isServer) {
            handshakeCommand = new Commands.ClientHandshake(
                this.config.clientFlags
            );

            handshakeCommand
                .on('end', () => {
                    // this happens when handshake finishes early either because there was
                    // some fatal error or the server sent an error packet instead of
                    // an hello packet (for example, 'Too many connections' error)
                    if (
                        !handshakeCommand.handshake ||
                        this._fatalError ||
                        this._protocolError
                    ) {
                        return;
                    }
                    this._handshakePacket = handshakeCommand.handshake;
                    this.threadId = handshakeCommand.handshake.connectionId;
                    this.emit('connect', handshakeCommand.handshake);
                })
                .on('error', (err: Error) => {
                    this._closing = true;
                    this._notifyError(err);
                });

            this.addCommand(handshakeCommand);
        }

        // in case there was no initial handshake but we need to read sting, assume it utf-8
        // most common example: "Too many connections" error ( packet is sent immediately on connection attempt, we don't know server encoding yet)
        // will be overwritten with actual encoding value as soon as server handshake packet is received
        this.serverEncoding = 'utf8';

        if (this.config.connectTimeout) {
            this.connectTimeout = Timers.setTimeout(
                this._handleTimeoutError.bind(this),
                this.config.connectTimeout
            );
        }
    }

    //#region Stream: Write

    write(buffer: Buffer) {
        const result = this.stream.write(buffer, err => {
            if (err) {
                this._handleNetworkError(err);
            }
        });

        if (!result) {
            this.stream.emit('pause');
        }
    }

    //#endregion Stream: Write

    //#region Error Handling

    private _handleNetworkError(err: Error & Dict) {
        if (this.connectTimeout) {
            Timers.clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        // Do not throw an error when a connection ends with a RST,ACK packet
        if (err.code === 'ECONNRESET' && this._closing) {
            return;
        }

        this._handleFatalError(err);
    }

    /**
     * notify all commands in the queue and bubble error as connection "error"
     * called on stream error or unexpected termination
     */
    private _notifyError(err: Error & Dict) {
        if (this.connectTimeout) {
            Timers.clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        // prevent from emitting 'PROTOCOL_CONNECTION_LOST' after EPIPE or ECONNRESET
        if (this._fatalError) {
            return;
        }

        let command;

        // if there is no active command, notify connection
        // if there are commands and all of them have callbacks, pass error via callback
        let bubbleErrorToConnection = !this._command;
        if (this._command?.onError) {
            this._command.onError(err);
            this._command = null;
            // connection handshake is special because we allow it to be implicit
            // if error happened during handshake, but there are others commands in queue
            // then bubble error to other commands and not to connection
        } else if (
            !this._command ||
            this._command.constructor !== Commands.ClientHandshake ||
            !this._commands.length
        ) {
            bubbleErrorToConnection = true;
        }

        while ((command = this._commands.shift())) {
            if (command.onError) {
                command.onError(err);
            } else {
                bubbleErrorToConnection = true;
            }
        }

        // notify connection if some commands in the queue did not have callbacks
        // or if this is pool connection ( so it can be removed from pool )
        if (bubbleErrorToConnection || this._pool) {
            this.emit('error', err);
        }

        // close connection after emitting the event in case of a fatal error
        if (err.fatal) {
            this.close();
        }
    }

    private _handleTimeoutError() {
        if (this.connectTimeout) {
            Timers.clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        this.stream?.destroy();

        const err: Error & Dict = new Error('connect ETIMEDOUT');
        err.errorno = 'ETIMEDOUT';
        err.code = 'ETIMEDOUT';
        err.syscall = 'connect';

        this._handleNetworkError(err);
    }

    private _handleFatalError(err: Error & Dict) {
        err.fatal = true;

        // stop receiving packets
        this.stream.removeAllListeners('data');

        this.addCommand = this._addCommandClosedState;

        this.write = () => {
            this.emit('error', new Error("Can't write in closed state"));
        };

        this._notifyError(err);
        this._fatalError = err;
    }

    private _addCommandClosedState(cmd: ICommand) {
        const err = new ProtocolError(
            "Can't add new command when connection is in closed state",
            'ADD_COMMAND_WITH_CONNECTION_CLOSED',
            true
        );

        if (cmd.onError) {
            cmd.onError(err);
        } else {
            this.emit('error', err);
        }

        return cmd;
    }

    protocolError(message: string, code?: string) {
        // Starting with MySQL 8.0.24, if the client closes the connection
        // unexpectedly, the server will send a last ERR Packet, which we can
        // safely ignore.
        // https://dev.mysql.com/worklog/task/?id=12999
        if (this._closing) {
            return;
        }

        const err = new ProtocolError(message, code || 'PROTOCOL_ERROR', true);

        this.emit('error', err);
    }

    get fatalError() {
        return this._fatalError;
    }

    //#endregion Error Handling

    //#region Commands

    addCommand(cmd: ICommand) {
        // this.compressedSequenceId = 0;
        // this.sequenceId = 0;

        if (this.config.debug) {
            const commandName = cmd.constructor.name;
            console.log(`Add command: ${commandName}`);
            (cmd as Dict)._commandName = commandName;
        }

        if (this._command) {
            this._commands.push(cmd);
        } else {
            this._command = cmd;
            this.handlePacket();
        }

        return cmd;
    }

    //#endregion Commands

    //#region Packet Handling

    handlePacket(packet?: IPacket) {
        // Handle paused state first
        if (this._paused) {
            if (packet) {
                this._paused_packets.push(packet);
            }
            return;
        }

        // Process any queued packets first
        if (!packet && this._paused_packets.length > 0) {
            packet = this._paused_packets.shift()!;
        }

        if (packet) {
            this._logIncomingPacket(packet);

            if (!this._validatePacketSequence(packet)) {
                return;
            }
        }

        this._processCommand(packet);
    }

    private _logIncomingPacket(packet: IPacket): void {
        if (!this.config.debug) return;

        console.log(
            ` raw: ${packet.buffer
                .subarray(packet.offset, packet.offset + packet.length)
                .toString('hex')}`
        );
        console.trace();

        const commandName = this._command?._commandName ?? '(no command)';
        const stateName = this._command?.stateName() ?? '(no command)';

        console.debug(
            this._internalId,
            this.connectionId,
            ` ==> `,
            `${commandName}#${stateName}(${[packet.sequenceId, packet.type, packet.length].join(',')})`
        );
    }

    private _validatePacketSequence(packet: IPacket): boolean {
        if (!this._command) {
            this._handleUnexpectedPacket(packet);
            return false;
        }

        if (this.sequenceId !== packet.sequenceId) {
            this._handleSequenceIdMismatch(packet);
        }

        this._bumpSequenceId(packet.numPackets);
        return true;
    }

    private _handleUnexpectedPacket(packet: IPacket): void {
        const marker = packet.peekByte();

        if (marker === 0xff) {
            const error = ErrorPacket.fromPacket(packet);
            this.protocolError(error.message, error.error);
        } else {
            this.protocolError(
                'Unexpected packet while no commands in the queue',
                'PROTOCOL_UNEXPECTED_PACKET'
            );
        }

        this.close();
    }

    private _handleSequenceIdMismatch(packet: IPacket): void {
        const err = new OutOfOrderPacketError(
            /* expected: */ this.sequenceId,
            /* received: */ packet.sequenceId,
            `Warning: got packets out of order. Expected ${this.sequenceId} but received ${packet.sequenceId}`
        );

        console.warn(err.message);

        this.emit('warn', err);
    }

    private _processCommand(packet?: IPacket): void {
        try {
            if (this._fatalError) {
                return;
            }

            if (!this._command) {
                return;
            }

            const done = this._command.execute(packet, this);
            if (done) {
                this._moveToNextCommand();
            }
        } catch (err) {
            this._handleFatalError(err);
            this.stream.destroy();
        }
    }

    private _moveToNextCommand(): void {
        this._command = this._commands.shift() || null;
        if (this._command) {
            this._resetSequenceId();
            // Process the next command without re-entrance
            setImmediate(() => this.handlePacket());
        }
    }

    writePacket(packet: IPacket) {
        const MAX_PACKET_LENGTH = 16777215;
        const length = packet.length;

        let chunk, offset, header;

        if (length < MAX_PACKET_LENGTH) {
            packet.writeHeader(this.sequenceId);
            if (this.config.debug) {
                console.debug(
                    `${this._internalId} ${this.connectionId}`,
                    '<==',
                    `${this._command?._commandName}#${this._command?.stateName()}(${[this.sequenceId, packet._name, packet.length].join(',')})`
                );
                console.debug(
                    `${this._internalId} ${this.connectionId}`,
                    '<==',
                    `${packet.buffer.toString('hex')}`
                );
            }
            this._bumpSequenceId(1);
            this.write(packet.buffer);

            return;
        }

        if (this.config.debug) {
            console.debug(
                `${this._internalId} ${this.connectionId}`,
                '<==',
                `Writing large packet, raw content not written:`
            );
            console.debug(
                `${this._internalId} ${this.connectionId}`,
                '<==',
                `${this._command?._commandName}#${this._command?.stateName()}(${[this.sequenceId, packet._name, packet.length].join(',')})`
            );
        }

        for (offset = 4; offset < 4 + length; offset += MAX_PACKET_LENGTH) {
            chunk = packet.buffer.subarray(offset, offset + MAX_PACKET_LENGTH);

            if (chunk.length === MAX_PACKET_LENGTH) {
                header = Buffer.from([0xff, 0xff, 0xff, this.sequenceId]);
            } else {
                header = Buffer.from([
                    chunk.length & 0xff,
                    (chunk.length >> 8) & 0xff,
                    (chunk.length >> 16) & 0xff,
                    this.sequenceId
                ]);
            }

            this._bumpSequenceId(1);
            this.write(header);
            this.write(chunk);
        }
    }

    //#endregion Packet Handling

    //#region Lifecycle

    /**
     * An alias to close
     */
    destroy() {
        this.close();
    }

    close() {
        if (this.connectTimeout) {
            Timers.clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }

        this._closing = true;

        this.stream.end();

        this.addCommand = this._addCommandClosedState;
    }

    /**
     * The sequence-id is incremented with each packet and may wrap around. It
     * starts at 0 and is reset to 0 when a new command begins in the Command
     * Phase.
     *
     * @see {@link http://dev.mysql.com/doc/internals/en/example-several-mysql-packets.html}
     * @see {@link http://dev.mysql.com/doc/internals/en/sequence-id.html}
     */
    _resetSequenceId() {
        this.sequenceId = 0;
        this.compressedSequenceId = 0;
    }

    /**
     * Increments the sequence ID by the specified number of packets and wraps
     * it around at 256.
     *
     * The sequence ID is used in MySQL protocol communication to track packet
     * ordering. It automatically wraps around using modulo 256 to stay within
     * the (0-255) range.
     *
     * @param numPackets - The number of packets to increment the sequence ID by
     */
    _bumpSequenceId(numPackets: number) {
        this.sequenceId += numPackets;
        this.sequenceId %= 256;
    }

    //#endregion Lifecycle
}
