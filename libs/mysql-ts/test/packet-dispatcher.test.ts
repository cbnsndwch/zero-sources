// Example unit test for PacketDispatcher
import { describe, it, expect, vi } from 'vitest';
import { PacketDispatcher } from '../src/packet-dispatcher.js';

describe('PacketDispatcher', () => {
  it('should dispatch packets to the current command', () => {
    const dispatcher = new PacketDispatcher();
    const mockCommand = { execute: vi.fn().mockReturnValue(true) };
    dispatcher.setCurrent(mockCommand);
    expect(dispatcher.dispatch({})).toBe(true);
    expect(mockCommand.execute).toHaveBeenCalled();
  });

  it('should return false if no command is set', () => {
    const dispatcher = new PacketDispatcher();
    expect(dispatcher.dispatch({})).toBe(false);
  });

  it('should clear the current command', () => {
    const dispatcher = new PacketDispatcher();
    const mockCommand = { execute: vi.fn() };
    dispatcher.setCurrent(mockCommand);
    dispatcher.clear();
    expect(dispatcher.current).toBeNull();
  });
});
