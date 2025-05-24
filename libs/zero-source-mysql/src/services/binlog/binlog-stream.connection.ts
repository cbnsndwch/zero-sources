import MysqlConnection from 'mysql2/lib/base/connection.js';
import type { ConnectionConfigOptions } from 'mysql2/lib/connection_config.js';

import {
    BinlogConsumer,
    type IBinlogEmitter,
    type BinlogDumpOptions
} from './commands/binlog-consumer.js';
import ConnectionConfig from 'mysql2/lib/connection_config.js';

export type RegisterSlaveOptions = {
    masterId?: number;
    serverId?: number;
    slaveHostname?: string;
    slaveUser?: string;
    slavePassword?: string;
    slavePort?: number;
    replicationRank?: number;
};

export type BinlogStreamOptions = RegisterSlaveOptions & BinlogDumpOptions;

const SQL_SET_CRC32_CHECKSUM = "SET @master_binlog_checksum = 'CRC32'";

export class BinlogStreamConnection extends MysqlConnection {
    createBinlogStream(opts: BinlogStreamOptions): IBinlogEmitter {
        const emitter = new BinlogConsumer(opts);

        this._registerSlave(opts, () => {
            this.query(SQL_SET_CRC32_CHECKSUM, null, (err, result) => {
                if (err) {
                    emitter.emit('error', err);
                    return;
                }

                emitter.emit('checksum', result);

                this.addCommand(emitter);
            });
        });

        return emitter;
    }

    static createConnection(opts: ConnectionConfigOptions) {
        const config = new ConnectionConfig(opts);
        return new BinlogStreamConnection({ config });
    }
}
