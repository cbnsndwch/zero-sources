'use strict';

import { invariant } from '@cbnsndwch/zero-contracts';

import type { IPacket } from './contracts/packet.js';

import Packet from './packets/packet.js';

type OnPacketCallback = (packet: IPacket) => void;

const MAX_PACKET_LENGTH = 16777215;

function readPacketLength(buffer: Buffer, offset: number) {
    invariant(
        offset + 3 < buffer.length,
        'readPacketLength: offset + 3 must be less than buffer length'
    );

    const b0 = buffer[offset]!;
    const b1 = buffer[offset + 1]!;
    const b2 = buffer[offset + 2]!;

    if (b1 + b2 === 0) {
        return b0;
    }

    return b0 + (b1 << 8) + (b2 << 16);
}

export default class PacketParser {
    /**
     * Array of last payload chunks. Only used when current payload is not complete
     */
    buffer: Buffer[];

    /**
     * Total length of chunks on buffer
     */
    bufferLength: number;

    /**
     * The length of the packet header in bytes. Represents the size of the
     * header portion of a MySQL packet, which typically contains metadata
     * about the packet such as length and sequence number. 4 bytes for normal
     * packets, 7 bytes for compressed protocol packets.
     */
    packetHeaderLength: number;

    /**
     * When in incomplete header state: number of header bytes received
     */
    headerLen: number;

    /**
     * _Expected_ payload length
     */
    length: number;

    /**
     * Buffer for accumulating parts of MySQL packets that exceed the maximum
     * packet size. Large packets are split across multiple MySQL protocol
     * packets and need to be reassembled. This array stores the individual
     * packet fragments until the complete packet can be reconstructed.
     */
    largePacketParts: Buffer[];

    /**
     * Holds the sequence ID of the first fragment of a large, multi-part MySQL
     * packet, ensuring the reassembled packet uses the correct sequence number.
     */
    firstPacketSequenceId: number | undefined;

    /**
     * A callback to be called when a complete packet is parsed.
     */
    onPacket: OnPacketCallback;

    /**
     * The function that will be executed to parse the next chunk of data.
     */
    execute: (chunk: Buffer) => void;

    /**
     * Creates a new PacketParser instance.
     *
     * @param onPacket A callback to be called when a complete packet is parsed.
     * @param packetHeaderLength The length of the packet header. Default is 4 for normal packets, 7 for compressed protocol packets. If not provided, it defaults to 4.
     */
    constructor(onPacket: OnPacketCallback, packetHeaderLength = 4) {
        // 4 for normal packets, 7 for compressed protocol packets
        if (typeof packetHeaderLength === 'undefined') {
            packetHeaderLength = 4;
        }

        // array of last payload chunks
        // only used when current payload is not complete
        this.buffer = [];

        // total length of chunks on buffer
        this.bufferLength = 0;

        this.packetHeaderLength = packetHeaderLength;

        // incomplete header state: number of header bytes received
        this.headerLen = 0;

        // expected payload length
        this.length = 0;

        this.largePacketParts = [];

        this.firstPacketSequenceId = 0;

        this.onPacket = onPacket;

        this.execute = this.executeStart.bind(this);
    }

    executeStart(chunk: Buffer) {
        let start = 0;
        const end = chunk.length;
        while (end - start >= 3) {
            this.length = readPacketLength(chunk, start);
            if (end - start >= this.length + this.packetHeaderLength) {
                // at least one full packet
                const sequenceId = chunk[start + 3]!;
                if (
                    this.length < MAX_PACKET_LENGTH &&
                    this.largePacketParts.length === 0
                ) {
                    this.onPacket(
                        new Packet(
                            sequenceId,
                            chunk,
                            start,
                            start + this.packetHeaderLength + this.length
                        )
                    );
                } else {
                    // first large packet - remember it's id
                    if (this.largePacketParts.length === 0) {
                        this.firstPacketSequenceId = sequenceId;
                    }
                    this.largePacketParts.push(
                        chunk.subarray(
                            start + this.packetHeaderLength,
                            start + this.packetHeaderLength + this.length
                        )
                    );
                    if (this.length < MAX_PACKET_LENGTH) {
                        this.#flushLargePacket();
                    }
                }

                start += this.packetHeaderLength + this.length;
            } else {
                // payload is incomplete
                this.buffer = [chunk.subarray(start + 3, end)];
                this.bufferLength = end - start - 3;
                this.execute = buffer => this.executePayload(buffer);
                return;
            }
        }
        if (end - start > 0) {
            // there is start of length header, but it's not full 3 bytes
            this.headerLen = end - start; // 1 or 2 bytes
            this.length = chunk[start]!;
            if (this.headerLen === 2) {
                this.length = chunk[start]! + (chunk[start + 1]! << 8);
                this.execute = buffer => this.executeHeader3(buffer);
            } else {
                this.execute = buffer => this.executeHeader2(buffer);
            }
        }
    }

    executePayload(chunk: Buffer) {
        let start = 0;
        const end = chunk.length;
        const remainingPayload =
            this.length - this.bufferLength + this.packetHeaderLength - 3;
        if (end - start >= remainingPayload) {
            // last chunk for payload
            const payload = Buffer.allocUnsafe(
                this.length + this.packetHeaderLength
            );
            let offset = 3;
            for (let i = 0; i < this.buffer.length; ++i) {
                this.buffer[i]!.copy(payload, offset);
                offset += this.buffer[i]!.length;
            }
            chunk.copy(payload, offset, start, start + remainingPayload);
            const sequenceId = payload[3]!;
            if (
                this.length < MAX_PACKET_LENGTH &&
                this.largePacketParts.length === 0
            ) {
                this.onPacket(
                    new Packet(
                        sequenceId,
                        payload,
                        0,
                        this.length + this.packetHeaderLength
                    )
                );
            } else {
                // first large packet - remember it's id
                if (this.largePacketParts.length === 0) {
                    this.firstPacketSequenceId = sequenceId;
                }
                this.largePacketParts.push(
                    payload.subarray(
                        this.packetHeaderLength,
                        this.packetHeaderLength + this.length
                    )
                );
                if (this.length < MAX_PACKET_LENGTH) {
                    this.#flushLargePacket();
                }
            }
            this.buffer = [];
            this.bufferLength = 0;
            this.execute = buffer => this.executeStart(buffer);
            start += remainingPayload;
            if (end - start > 0) {
                return this.execute(chunk.subarray(start, end));
            }
        } else {
            this.buffer.push(chunk);
            this.bufferLength += chunk.length;
        }
        return null;
    }

    executeHeader2(chunk: Buffer) {
        this.length += chunk[0]! << 8;
        if (chunk.length > 1) {
            this.length += chunk[1]! << 16;
            this.execute = this.executePayload.bind(this);
            return this.executePayload(chunk.subarray(2));
        }

        this.execute = this.executeHeader3.bind(this);

        return null;
    }

    executeHeader3(chunk: Buffer) {
        this.length += chunk[0]! << 16;
        this.execute = this.executePayload.bind(this);
        return this.executePayload(chunk.subarray(1));
    }

    //#region Large Packet Handling

    /**
     * Flushes a large packet based on the packet header length.
     *
     * Determines whether to use the 7-byte or 4-byte packet header format
     * and calls the appropriate flush method accordingly.
     */
    #flushLargePacket() {
        if (this.packetHeaderLength === 7) {
            this.#flushLargePacket7();
        } else {
            this.#flushLargePacket4();
        }
    }

    #flushLargePacket4() {
        const numPackets = this.largePacketParts.length;
        this.largePacketParts.unshift(Buffer.from([0, 0, 0, 0])); // insert header
        const body = Buffer.concat(this.largePacketParts);
        const packet = new Packet(
            this.firstPacketSequenceId!,
            body,
            0,
            body.length
        );
        this.largePacketParts.length = 0;
        packet.numPackets = numPackets;
        this.onPacket(packet);
    }

    #flushLargePacket7() {
        const numPackets = this.largePacketParts.length;
        this.largePacketParts.unshift(Buffer.from([0, 0, 0, 0, 0, 0, 0])); // insert header
        const body = Buffer.concat(this.largePacketParts);
        this.largePacketParts.length = 0;
        const packet = new Packet(
            this.firstPacketSequenceId!,
            body,
            0,
            body.length
        );
        packet.numPackets = numPackets;
        this.onPacket(packet);
    }

    //#endregion Large Packet Handling
}
