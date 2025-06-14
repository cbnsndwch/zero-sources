/**
 * PauseBuffer: Queues Packet objects while the stream is paused; provides
 * resume callback to flush.
 *
 * Inspired by node-mysql2's pause/resume logic, but extracted for clarity and
 * testability
 */
export class PauseBuffer<T = any> {
    private buffer: T[] = [];
    private paused: boolean = false;

    /**
     * Pauses the buffer. Incoming packets will be queued.
     */
    pause(): void {
        this.paused = true;
    }

    /**
     * Pushes a packet to the buffer if paused, or returns false if not paused.
     * Returns true if the packet was buffered.
     */
    pushIfPaused(pkt: T): boolean {
        if (this.paused) {
            this.buffer.push(pkt);
            return true;
        }
        return false;
    }

    /**
     * Resumes the buffer and flushes all queued packets to the provided callback.
     */
    resume(flush: (pkt: T) => void): void {
        this.paused = false;
        while (this.buffer.length > 0) {
            flush(this.buffer.shift()!);
        }
    }

    /**
     * Returns whether the buffer is currently paused.
     */
    get isPaused(): boolean {
        return this.paused;
    }
}
