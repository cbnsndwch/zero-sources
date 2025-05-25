import Packet from 'mysql2/lib/packets/packet.js';

/**
 * Parses a UUID from the provided packet.
 *
 * @param this - The packet to read from.
 * @returns A UUID string in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.
 */
Packet.prototype.readUUID = function readUUID(this: Packet) {
    const buffer = this.readBuffer(16);

    const uuid = [
        buffer.toString('hex', 0, 4),
        buffer.toString('hex', 4, 6),
        buffer.toString('hex', 6, 8),
        buffer.toString('hex', 8, 10),
        buffer.toString('hex', 10, 16)
    ].join('-');

    return uuid;
};

/**
 * Reads an unsigned 64-bit integer from the current packet position.
 *
 * This method reads two 32-bit integers (low and high parts) from the packet,
 * combines them into a single 64-bit unsigned integer, and returns the result
 * as a `BigInt`.
 *
 * @returns The unsigned 64-bit integer value read from the packet.
 */
Packet.prototype.readUInt64 = function readUInt64(this: Packet): bigint {
    const low = this.readInt32();
    const high = this.readInt32();

    // Convert to BigInt
    return (BigInt(high) << 32n) | BigInt(low);
};
