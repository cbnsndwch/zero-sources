import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the current directory of this script
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');

import { schema, mapping, permissions } from '../src/schema/index.js';

async function exportConfig() {
    console.log('📦 Exporting ZRocket configuration to JSON files...');

    // Create .local/config directory
    const outDir = join(packageRoot, 'dist');
    await mkdir(outDir, { recursive: true });

    try {
        // Export schema
        const schemaPath = join(outDir, 'schema.json');
        const schemaJson = JSON.stringify(schema, null, 2);
        await writeFile(schemaPath, schemaJson);
        console.log(`✅ Schema saved to: ${schemaPath}`);

        const permissionsPath = join(outDir, 'permissions.json');
        const permissionsJson = JSON.stringify(await permissions, null, 2);
        await writeFile(permissionsPath, permissionsJson);
        console.log(`✅ Permissions saved to: ${permissionsPath}`);

        // Export table mappings
        const mappingPath = join(outDir, 'mapping.json');
        const mappingJson = JSON.stringify(mapping, null, 2);
        await writeFile(mappingPath, mappingJson);
        console.log(`✅ Table mappings saved to: ${mappingPath}`);

        console.log('');
        console.log('🎉 All configuration files saved successfully!');
        console.log(`📁 Output directory: ${outDir}`);

        // For testing purposes
        // throw new Error('Failed successfully.');
    } catch (err) {
        console.error('❌ Export failed:', err.message);
        console.error(err);
        process.exit(1);
    }
}

// Run the export
exportConfig().catch(err => {
    console.error('❌ Export script failed:', err.message);
    console.error(err);
    process.exit(1);
});
