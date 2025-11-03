export type NestLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

export enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    DEBUG = 'DEBUG',
    VERBOSE = 'VERBOSE'
}

export const LOG_LEVELS = Object.values(LogLevel) as LogLevel[];

export const LOG_LEVEL_MAP: Record<LogLevel, NestLogLevel[]> = {
    [LogLevel.ERROR]: ['log', 'error'],
    [LogLevel.WARN]: ['log', 'error', 'warn'],
    [LogLevel.DEBUG]: ['log', 'error', 'warn', 'debug'],
    [LogLevel.VERBOSE]: ['log', 'error', 'warn', 'debug', 'verbose']
};

const levelFromEnv: any = process.env.LOG_LEVEL;
const ENV_LOG_LEVEL: LogLevel =
    levelFromEnv && LOG_LEVELS.includes(levelFromEnv)
        ? levelFromEnv
        : LogLevel.ERROR;

export const NEST_LOG_LEVEL = LOG_LEVEL_MAP[ENV_LOG_LEVEL];
