export class NotImplementedError extends Error {
    constructor(message: string = 'Method not implemented') {
        super(message);

        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
