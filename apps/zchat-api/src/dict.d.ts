/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Dict<T = any> {
        [key: string]: T;
    }
}

export {};
