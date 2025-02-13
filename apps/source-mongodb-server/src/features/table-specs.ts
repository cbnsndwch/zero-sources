import type { TableSpec } from '@cbnsndwch/zero-source-mongodb';

export const tables: TableSpec[] = [
    {
        schema: 'public',
        name: 'user',
        primaryKey: ['_id'],
        columns: {
            _id: {
                pos: 1,
                dataType: 'character',
                notNull: true
            },
            name: {
                pos: 2,
                dataType: 'varchar',
                notNull: true
            },
            partner: {
                pos: 3,
                dataType: 'boolean',
                notNull: true
            }
        }
    },
    {
        schema: 'public',
        name: 'medium',
        primaryKey: ['_id'],
        columns: {
            _id: {
                pos: 1,
                dataType: 'character',
                notNull: true
            },
            name: {
                pos: 2,
                dataType: 'varchar',
                notNull: true
            }
        }
    },
    {
        schema: 'public',
        name: 'message',
        primaryKey: ['_id'],
        columns: {
            _id: {
                pos: 1,
                dataType: 'character',
                notNull: true
            },
            senderID: {
                pos: 2,
                dataType: 'character',
                notNull: true
            },
            mediumID: {
                pos: 3,
                dataType: 'character',
                notNull: true
            },
            body: {
                pos: 4,
                dataType: 'text',
                notNull: true
            },
            timestamp: {
                pos: 5,
                dataType: 'integer',
                notNull: true
            }
        }
    }
];
