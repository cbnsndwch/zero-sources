import { table, string, boolean, enumeration, createSchema } from '@rocicorp/zero';

// Define the todos table based on the Todo entity
const todos = table('todos')
    .columns({
        _id: string(),
        title: string(),
        description: string().optional(),
        completed: boolean(),
        dueDate: string().optional(), // Store as ISO string
        priority: enumeration<'low' | 'medium' | 'high'>(),
        createdAt: string(), // ISO timestamp
        updatedAt: string()  // ISO timestamp
    })
    .primaryKey('_id');

// Create and export the schema
export const schema = createSchema({
    tables: [todos],
    relationships: [] // No relationships for this simple example
});
