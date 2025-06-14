/**
 * SequenceManager: Centralizes all sequence ID validation, bumping, and
 * resetting logic.
 *
 * Inspired by node-mysql2's sequence ID handling, but extracted for clarity
 * and testability.
 */
export class SequenceManager {
    private expectedSequenceId: number = 0;
    private compressedSequenceId: number = 0;

    /**
     * Resets the sequence IDs to zero (or a given value).
     */
    reset(): void {
        this.expectedSequenceId = 0;
        this.compressedSequenceId = 0;
    }

    /**
     * Validates the incoming sequence ID against the expected value.
     * Returns true if valid, false otherwise.
     */
    expect(actual: number): boolean {
        return actual === this.expectedSequenceId;
    }

    /**
     * Advances the expected sequence ID by n (default 1).
     * Returns the new expected value.
     */
    next(n: number = 1): number {
        this.expectedSequenceId = (this.expectedSequenceId + n) % 256;
        return this.expectedSequenceId;
    }

    /**
     * Returns the current expected sequence ID.
     */
    get value(): number {
        return this.expectedSequenceId;
    }

    // Add compressed sequence logic as needed for protocol extensions.
}
