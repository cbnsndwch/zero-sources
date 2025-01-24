import { Inject, Logger } from '@nestjs/common';
import { InjectModel, ModelDefinition } from '@nestjs/mongoose';
import {
    SubscribeMessage,
    WebSocketGateway,
    MessageBody,
    OnGatewayConnection,
    ConnectedSocket
} from '@nestjs/websockets';
import type { Request } from 'express';
import type { Model } from 'mongoose';
import { WebSocket } from 'ws';

import { ChangeSourceUpstream } from '@rocicorp/zero/change-protocol/v0';

import { truncateBytes, WsCloseCode, WS_CLOSE_REASON_MAX_BYTES } from '../../../utils/index.js';

import { StreamerShard } from '../entities/streamer-shard.entity.js';
import { ChangeStreamSource } from '../services/change-stream-manager.js';
import { getZeroChangeStreamerParams } from '../utils/get-zero-change-streamer-params.js';
import { TOKEN_PUBLISHED_COLLECTIONS } from '../providers/published-entities.provider.js';

type DownstreamState = {
    shard: StreamerShard;
    source: ChangeStreamSource;
};

@WebSocketGateway({ path: '/changes/v0/stream' })
export class V0ChangesGateway implements OnGatewayConnection {
    #logger = new Logger(V0ChangesGateway.name);

    #shardModel: Model<StreamerShard>;
    #publishedCollections: string[];

    /**
     * A map of client keys to RxJS subjects that can be used to multicast
     * changes to all clients interested on the same shard.
     */
    readonly #subscriptions = new Map<WebSocket, DownstreamState>();

    constructor(
        @InjectModel(StreamerShard.name) shardModel: Model<StreamerShard>,
        @Inject(TOKEN_PUBLISHED_COLLECTIONS) publishedCollections: string[]
    ) {
        this.#shardModel = shardModel;
        this.#publishedCollections = publishedCollections;
    }

    //#region Gateway Lifecycle

    /**
     * Handles a new client connection. This method is called when a new client
     * connects to the server
     *
     * The CustomChangeSource implementation will connect to the `ZERO_UPSTREAM_DB`
     * URI and add the following query parameters:
     *
     * - `shardID` for supporting multiple subscriptions with potentially
     *   different views of the upstream data
     * - `lastWatermark` is the watermark of the last committed / acked
     *   watermark. When specified, the endpoint should start streaming changes
     *   after the `lastWatermark`. When unspecified, the endpoint should
     *   perform an “initial sync” by streaming a snapshot of the data to be
     *   replicated (as one transaction), and incremental changes henceforth.
     *
     * @param client - The connected client socket.
     * @param args - Additional arguments passed during the connection.
     */
    async handleConnection(client: WebSocket, req: Request) {
        try {
            // TODO: add auth
            const { shardId, lastWatermark } = getZeroChangeStreamerParams(req);

            // create or update shard, saving the lastWatermark
            const shard = await this.#shardModel.findByIdAndUpdate(
                { _id: shardId },
                { lastWatermark },
                { upsert: true, new: true }
            );

            const source = new ChangeStreamSource(
                this.#shardModel.db,
                shard,
                this.#publishedCollections
            );
            this.#subscriptions.set(client, { shard, source });

            source
                .on('close', () => {
                    client.close(
                        WsCloseCode.WS_1012_SERVICE_RESTART,
                        truncateBytes(
                            'The underlying DB change stream was closed, please reconnect',
                            WS_CLOSE_REASON_MAX_BYTES
                        )
                    );
                })
                .on('change', change => {
                    client.send(JSON.stringify(change));
                });

            source.startStream();
        } catch (err: any) {
            this.#logger.error(err);

            if (client.readyState === WebSocket.OPEN) {
                client.close(
                    WsCloseCode.WS_1011_INTERNAL_ERROR,
                    truncateBytes(err.message, WS_CLOSE_REASON_MAX_BYTES)
                );
            } else {
                client.once('open', () => {
                    client.close(
                        WsCloseCode.WS_1011_INTERNAL_ERROR,
                        truncateBytes(err.message, WS_CLOSE_REASON_MAX_BYTES)
                    );
                });
            }
        }
    }

    //#endregion Gateway Lifecycle

    //#region Client Messages

    @SubscribeMessage('message')
    onMessage(
        @MessageBody() [eventName, ...data]: ChangeSourceUpstream,
        @ConnectedSocket() client: WebSocket
    ) {
        this.#logger.verbose(`Received streamer message: ${JSON.stringify(data)}`);

        if (!this.#subscriptions.has(client)) {
            this.#logger.error(`No ws subscription found for socket ${client}`);

            // TODO: maybe close socket?

            return;
        }

        const { shard } = this.#subscriptions.get(client)!;

        switch (eventName) {
            case 'status':
                this.#onStreamerAck(shard, data[1].watermark);
                break;
            default:
                eventName satisfies never;
                const msg = `Unexpected upstream message type ${eventName}`;

                this.#logger.error(msg);

                client.close(WsCloseCode.WS_1008_POLICY_VIOLATION, msg);

                break;
        }
    }

    //#endregion Client Messages

    //#region Helpers

    async #onStreamerAck(shard: StreamerShard, watermark: string) {
        // update the shard watermark so that if we restart the server, we start
        // streaming changes from it instead of the beginning
        shard.lastAcknowledgedWatermark = watermark;
        await shard.save();
    }

    //#endregion Helpers
}
