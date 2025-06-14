// Example unit test for ErrorChannel
import { describe, it, expect } from 'vitest';
import { DefaultErrorChannel } from '../src/error-channel.js';

describe('DefaultErrorChannel', () => {
  it('should throw on fatal', () => {
    const ec = new DefaultErrorChannel();
    expect(() => ec.fatal(new Error('fatal'))).toThrow('fatal');
  });
  it('should throw on protocol', () => {
    const ec = new DefaultErrorChannel();
    expect(() => ec.protocol('bad packet', 'ERR')).toThrow('Protocol error: bad packet [ERR]');
  });
  it('should throw on net', () => {
    const ec = new DefaultErrorChannel();
    expect(() => ec.net(Object.assign(new Error('net'), { code: 'ECONNRESET' }))).toThrow('net');
  });
});
