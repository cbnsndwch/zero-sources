export class ProtocolError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly fatal: boolean
    ) {
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
