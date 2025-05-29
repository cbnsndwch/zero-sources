import type { Connection } from 'mysql2/promise';

import type { Dict } from '@cbnsndwch/zero-contracts';

export class SchemaDiscoveryService {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async getColumnNames(schema: string, table: string): Promise<string[]> {
        const [rows] = await this.connection.query(
            `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ORDINAL_POSITION`,
            [schema, table]
        );
        return (rows as Dict[]).map(r => r.COLUMN_NAME);
    }
}
