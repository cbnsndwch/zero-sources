export class OutOfOrderPacketError extends Error {
    constructor(
        public readonly expected: number,
        public readonly received: number,
        message?: string
    ) {
        super(
            message ||
                `Out of order packet received. Expected sequence ${expected}, but got ${received}`
        );
        this.name = 'OutOfOrderPacketError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        Error.captureStackTrace?.(this, OutOfOrderPacketError);
    }
}
