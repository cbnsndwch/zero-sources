type PacketErrorOptions = {
    err: string;
    errorCode: number;
    sqlState: string;
};

export class PacketError extends Error {
    readonly err: string;
    readonly code: number;
    readonly sqlState: string;

    constructor(
        message: string,
        { err, errorCode: code, sqlState }: PacketErrorOptions
    ) {
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);

        this.err = err;
        this.code = code;
        this.sqlState = sqlState;
    }
}
