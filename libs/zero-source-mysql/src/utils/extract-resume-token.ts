import type { ResumeToken } from 'mongodb';

export function extractResumeToken(token: ResumeToken): string | undefined {
    if (typeof token === 'string') {
        return token;
    }

    if (token === undefined || token === null) {
        return undefined;
    }

    if (typeof token === 'object' && '_data' in token) {
        return token._data as string;
    }

    return String(token);
}
