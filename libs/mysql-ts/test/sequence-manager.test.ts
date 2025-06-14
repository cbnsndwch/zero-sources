// Example unit test for SequenceManager
import { describe, it, expect } from 'vitest';
import { SequenceManager } from '../src/sequence-manager.js';

describe('SequenceManager', () => {
  it('should reset sequence IDs', () => {
    const sm = new SequenceManager();
    sm.next();
    sm.reset();
    expect(sm.value).toBe(0);
  });

  it('should validate expected sequence ID', () => {
    const sm = new SequenceManager();
    expect(sm.expect(0)).toBe(true);
    sm.next();
    expect(sm.expect(1)).toBe(true);
    expect(sm.expect(2)).toBe(false);
  });

  it('should wrap sequence ID at 256', () => {
    const sm = new SequenceManager();
    for (let i = 0; i < 256; i++) sm.next();
    expect(sm.value).toBe(0);
  });
});
