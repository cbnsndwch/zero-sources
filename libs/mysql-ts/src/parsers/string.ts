'use strict';

import { WithImplicitCoercion } from 'buffer';
import Iconv from 'iconv-lite';
import { createLRU } from 'lru.min';

const decoderCache = createLRU<string, Iconv.DecoderStream>({
    max: 500
});

export function decode(
    buffer: Buffer,
    encoding: string,
    start?: number,
    end?: number,
    options?: Iconv.Options
) {
    if (Buffer.isEncoding(encoding)) {
        return buffer.toString(encoding, start, end);
    }

    // Optimize for common case: encoding="short_string", options=undefined.
    let decoder: Iconv.DecoderStream;
    if (!options) {
        decoder = decoderCache.get(encoding)!;
        if (!decoder) {
            decoder = Iconv.getDecoder(encoding);
            decoderCache.set(encoding, decoder);
        }
    } else {
        const decoderArgs = { encoding, options };
        const decoderKey = JSON.stringify(decoderArgs);
        decoder = decoderCache.get(decoderKey)!;
        if (!decoder) {
            decoder = Iconv.getDecoder(
                decoderArgs.encoding,
                decoderArgs.options
            );
            decoderCache.set(decoderKey, decoder);
        }
    }

    const res = decoder.write(buffer.subarray(start, end));
    const trail = decoder.end();

    return trail ? res + trail : res;
}

export function encode(
    value: WithImplicitCoercion<string>,
    encoding: string,
    options?: Iconv.Options
) {
    if (encoding && Buffer.isEncoding(encoding)) {
        return Buffer.from(value, encoding);
    }

    const encoder = Iconv.getEncoder(encoding, options || {});

    const res = encoder.write(String(value));
    const trail = encoder.end();

    return trail && trail.length > 0 ? Buffer.concat([res, trail]) : res;
}
