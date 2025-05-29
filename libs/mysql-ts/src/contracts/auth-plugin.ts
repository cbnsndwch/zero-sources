import type Connection from '../connection.js';

export type PluginMetadata = {
    connection: Connection;
    command: string;
};

export type AuthPluginFn = (
    pluginData: Buffer
) => string | Buffer | Promise<string> | Promise<Buffer> | null;

export type AuthPlugin = (pluginMetadata: PluginMetadata) => AuthPluginFn;

export type AuthPluginDefinition<T> = (pluginOptions?: T) => AuthPlugin;
