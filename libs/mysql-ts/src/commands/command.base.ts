'use strict';

import { EventEmitter } from 'node:events';
import Timers from 'node:timers';

import type { IPacket } from '../contracts/packet.js';
import type { ICommand, PacketHandler } from '../contracts/command.js';

import type Connection from '../connection.js';
import { Dict } from '@cbnsndwch/zero-contracts';

export default class CommandBase extends EventEmitter implements ICommand {
    queryTimeout?: NodeJS.Timeout | null = null;

    start: PacketHandler | null = null;

    next: PacketHandler | null = null;

    onError?: (error: Error) => void;

    /**
     * SLOW, use for debugging only
     */
    stateName() {
        const state = this.next;

        for (const i in this) {
            if (this[i] === state && i !== 'next') {
                return i;
            }
        }

        return 'unknown name';
    }

    async execute(packet: IPacket, connection: Connection) {
        if (!this.next) {
            this.next = this.start;
            connection._resetSequenceId();
        }

        if (packet && packet.isError) {
            const err = packet.asError(connection.clientEncoding);
            err.sql = (this as Dict).sql || (this as Dict).query;

            if (this.queryTimeout) {
                Timers.clearTimeout(this.queryTimeout);
                this.queryTimeout = null;
            }

            if (this.onError) {
                this.onError(err);
                this.emit('end');
            } else {
                this.emit('error', err);
                this.emit('end');
            }

            return true;
        }

        if (this.next) {
            this.next = await this.next?.(packet, connection);
        }

        if (this.next) {
            return false;
        }

        this.emit('end');

        return true;
    }
}
