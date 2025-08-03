import { readFileSync } from 'node:fs';
import { resolve, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as yaml from 'js-yaml';

import { AppConfig } from './contracts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const YAML_CONFIG_FILENAME = process.env.CONFIG_FILE || 'config.yml';

export default function loadYamlConfig() {
    // Try multiple possible locations for the config file
    const possiblePaths = [
        // Current working directory
        resolve(process.cwd(), YAML_CONFIG_FILENAME),
        // Relative to this file's directory
        isAbsolute(YAML_CONFIG_FILENAME)
            ? resolve(YAML_CONFIG_FILENAME)
            : resolve(__dirname, YAML_CONFIG_FILENAME),
        // Root of the app directory
        resolve(__dirname, '..', '..', YAML_CONFIG_FILENAME),
        // Dist directory
        resolve(__dirname, '..', YAML_CONFIG_FILENAME)
    ];

    let ymlString: string;
    let configFilePath: string | null = null;

    for (const path of possiblePaths) {
        try {
            ymlString = readFileSync(path, 'utf8');
            configFilePath = path;
            break;
        } catch {
            // Continue to next path
            continue;
        }
    }

    if (!configFilePath) {
        console.error(
            `Failed to find config file. Tried paths:`,
            possiblePaths
        );
        process.exit(1);
    }

    console.log(`Loading config from: ${configFilePath}`);
    const config = yaml.load(ymlString!) as AppConfig;

    // TODO: validate config

    return config;
}
