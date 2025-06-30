declare global {
    interface Dict<T = any> {
        [key: string]: T;
    }
}

export {};
