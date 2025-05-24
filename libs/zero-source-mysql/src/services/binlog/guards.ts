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
