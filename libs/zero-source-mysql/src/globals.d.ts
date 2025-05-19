declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
        }
    }

    declare const process: {
        env: {
            NODE_ENV?: string;
        };
    };
}
