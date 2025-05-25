import 'dotenv/config';
import { resolver } from '@rocicorp/resolver';

import { bigIntReplacer } from '@cbnsndwch/zero-contracts';

import { BinlogStreamConnection } from './binlog-stream.connection.js';
import type { BinlogEvent } from './events/binlog-event.js';

const events: BinlogEvent[] = [];

const conn = BinlogStreamConnection.createConnection({
    host: process.env.MYSQL_HOST!,
    port: process.env.MYSQL_PORT!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,

    idleTimeout: 500_000,
    connectTimeout: 500_000,

    debug: Boolean(process.env.MYSQL_DEBUG)
});

new Promise<void>((resolve, reject) => {
    conn.connect((err, conn) => {
        if (err) {
            return reject(err);
        }

        if (!conn) {
            return reject(new Error('No connection'));
        }

        resolve();
    });
})
    .then(async () => {
        const { resolve, reject, promise } = resolver<void>();

        try {
            const stream = conn.createBinlogStream({
                masterId: 0,
                serverId: 123, // slave ID, first field in "show slave hosts" sql response
                binlogPos: 4,
                // filename: 'mysql-bin.000001'
                // filename: 'mysql-bin.000002'
                // filename: 'mysql-bin.000008'
                filename: 'mysql-bin.000009'

                // // non-blocking operation => exit on EOF
                // flags: 1
            });

            stream.on('connect', () => {
                console.log('Connected to MySQL binlog stream');
            });

            stream.on('checksum', result => {
                console.log('Checksum result:', result);
            });

            stream.on('eof', () => {
                console.log('EOF received');
            });

            stream.on('error', err => {
                reject(err);
            });

            stream.on('event', event => {
                console.log('Event:', JSON.stringify(event, bigIntReplacer, 2));

                events.push(event);
                // if (event.name === 'XID') {
                //     console.log(
                //         JSON.stringify(
                //             events,
                //             bigIntReplacer,
                //             2
                //         )
                //     );
                // }
            });

            stream.on('end', () => {
                resolve();
            });
            stream.on('close', () => {
                resolve();
            });
        } catch (err) {
            console.error('Error connecting to MySQL binlog stream:', err);
            reject(err);
        }

        return promise;
    })
    .then(() => {
        console.log('Done');
    })
    .catch(err => {
        console.error('Error:', err);
    });
