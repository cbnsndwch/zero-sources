import { readFileSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';

import * as yaml from 'js-yaml';

import { AppConfig } from './contracts.js';

const YAML_CONFIG_FILENAME = process.env.CONFIG_FILE || './config.yaml';

export default function loadYamlConfig() {
    const configFilePath = isAbsolute(YAML_CONFIG_FILENAME)
        ? resolve(YAML_CONFIG_FILENAME)
        : resolve(__dirname, YAML_CONFIG_FILENAME);

    let ymlString: string;
    try {
        ymlString = readFileSync(configFilePath, 'utf8');
    } catch (err) {
        console.error(`Failed to read config file: ${configFilePath}`, err);
        process.exit(1);
    }

    const config = yaml.load(ymlString) as AppConfig;

    // TODO: validate config

    return config;
}
