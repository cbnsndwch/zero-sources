import type { Connection } from 'mysql2/promise';

import type { Dict } from '@cbnsndwch/zero-contracts';

export class TableSchemaService {
    #conn: Connection;

    constructor(conn: Connection) {
        this.#conn = conn;
    }

    async getColumnNames(schema: string, table: string): Promise<string[]> {
        const [rows] = await this.#conn.query(
            `SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ? ORDER BY ORDINAL_POSITION`,
            [schema, table]
        );
        return (rows as Dict[]).map(r => r.COLUMN_NAME);
    }
}
