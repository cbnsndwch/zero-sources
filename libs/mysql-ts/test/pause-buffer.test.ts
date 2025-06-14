// Example unit test for PauseBuffer
import { describe, it, expect } from 'vitest';
import { PauseBuffer } from '../src/pause-buffer.js';

describe('PauseBuffer', () => {
  it('should buffer packets when paused and flush on resume', () => {
    const pb = new PauseBuffer<number>();
    pb.pause();
    pb.pushIfPaused(1);
    pb.pushIfPaused(2);
    const flushed: number[] = [];
    pb.resume(pkt => flushed.push(pkt));
    expect(flushed).toEqual([1, 2]);
    expect(pb.isPaused).toBe(false);
  });

  it('should not buffer packets when not paused', () => {
    const pb = new PauseBuffer<number>();
    expect(pb.pushIfPaused(42)).toBe(false);
  });
});
