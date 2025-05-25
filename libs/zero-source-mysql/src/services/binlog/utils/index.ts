
const MASK_NON_BLOCKING = 0x01;

/**
 * Determines whether the provided flags indicate non-blocking operation.
 *
 * @param flags - The flags value to check. Defaults to 0 if not provided.
 * @returns `true` if the non-blocking flag (bit 0) is set; otherwise, `false`.
 */
export function isNonBlockingFlags(flags = 0) {
    return Boolean(flags & MASK_NON_BLOCKING);
}

/**
 * Reads a null-terminated string from the buffer starting at the specified offset.
 *
 * @param offset - The position in the buffer to start reading from.
 * @param encoding - The character encoding to use when converting the buffer to a string.
 * @returns The string read from the buffer, up to (but not including) the first null byte (`0x00`).
 */
export function readNullTerminatedString(
    this: Buffer,
    offset: number,
    encoding: BufferEncoding
) {
    const end = this.indexOf(0, offset);
    const str = this.toString(encoding, offset, end);
    return str;
}
