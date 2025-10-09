import { Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    type OnGatewayConnection
} from '@nestjs/websockets';
import type { v0 } from '@rocicorp/zero/change-protocol/v0';
import type { Request } from 'express';
import type { Model } from 'mongoose';
import { concatWith, type Observable } from 'rxjs';
import { WebSocket } from 'ws';

import {
    TOKEN_WATERMARK_SERVICE,
    truncateBytes,
    WS_CLOSE_REASON_MAX_BYTES,
    WsCloseCode,
    type IWatermarkService
} from '@cbnsndwch/zero-contracts';

import {
    TOKEN_MODULE_OPTIONS,
    type ZeroMongoModuleOptions
} from '../contracts/zero-mongo-module-options.contract.js';
import { StreamerShard } from '../entities/streamer-shard.entity.js';
import { getStreamerParams } from '../utils/get-streamer-params.js';

import {
    TOKEN_CHANGE_MAKER_V0,
    type ChangeMakerV0
} from './change-maker-v0.js';
import { ChangeSourceV0 } from './change-source-v0.js';

type DownstreamState = {
    shard: StreamerShard;
    source: ChangeSourceV0;
};

@WebSocketGateway({ path: '/changes/v0/stream' })
export class ChangesGatewayV0 implements OnGatewayConnection {
    #logger = new Logger(ChangesGatewayV0.name);

    #shardModel: Model<StreamerShard>;

    // module option
    #options: ZeroMongoModuleOptions;

    // the change mapper service that transforms MongoDB change stream events
    // into Zero events
    #changeMaker: ChangeMakerV0;

    // maps between mongo resume tokens and zero watermarks (lexi versions)
    #watermarkService: IWatermarkService;

    /**
     * A map of client keys to RxJS subjects that can be used to multicast
     * changes to all clients interested on the same shard.
     */
    readonly #subscriptions = new Map<WebSocket, DownstreamState>();

    constructor(
        @Inject(TOKEN_WATERMARK_SERVICE) watermarkService: IWatermarkService,
        @Inject(TOKEN_MODULE_OPTIONS) options: ZeroMongoModuleOptions,
        @Inject(TOKEN_CHANGE_MAKER_V0) changeMaker: ChangeMakerV0,
        @InjectModel(StreamerShard.name) shardModel: Model<StreamerShard>
    ) {
        this.#shardModel = shardModel;
        this.#watermarkService = watermarkService;
        this.#changeMaker = changeMaker;
        this.#options = options;
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
            const params = getStreamerParams(req);
            const { appId, shardId, lastWatermark, token, shardPublications } =
                params;

            // enforce auth only if configured
            if (
                this.#options.streamerToken &&
                token !== this.#options.streamerToken
            ) {
                client.close(
                    WsCloseCode.WS_3000_UNAUTHORIZED,
                    'Auth token missing or invalid'
                );
                return;
            }

            // create or update shard, saving the lastWatermark
            const shard = await this.#shardModel.findByIdAndUpdate(
                { _id: shardId },
                { lastWatermark },
                { upsert: true, new: true }
            );

            const source = new ChangeSourceV0(
                appId,
                shard,
                this.#shardModel.db,
                this.#options.tables,
                this.#changeMaker,
                this.#watermarkService
            );

            this.#subscriptions.set(client, { shard, source });

            const abortController = new AbortController();

            // get the resume token for the shard, if one exists
            const resumeToken = !lastWatermark
                ? undefined
                : await this.#watermarkService.getResumeToken(
                      shard.id,
                      lastWatermark
                  );

            // Determine which collections to watch
            // If Zero cache provided shardPublications, use those
            // Otherwise, use all collections from the change maker service
            const collectionsToWatch =
                shardPublications.length > 0
                    ? shardPublications
                    : this.#changeMaker.getAllWatchedCollections();

            this.#logger.log(
                `Watching collections: ${collectionsToWatch.join(', ')}`
            );

            // stream db changes
            let stream$: Observable<v0.ChangeStreamMessage> =
                source.streamChanges$(
                    collectionsToWatch,
                    abortController.signal,
                    resumeToken
                );

            // handle initial sync scenario
            if (!lastWatermark) {
                this.#logger.debug(
                    'No streamer watermark provided, performing initial sync'
                );
                stream$ = source.initialSync$().pipe(concatWith(stream$));
            } else {
                this.#logger.debug(
                    `Got streamer watermark ${lastWatermark}, skipping initial sync`
                );
            }

            client.on('close', () => {
                this.#logger.debug(
                    'Client disconnected, stopping change stream'
                );

                // stop change stream when client disconnects
                abortController.abort();
            });

            // start watching the change stream
            stream$.subscribe({
                next: change => {
                    const json = JSON.stringify(change);

                    this.#logger.verbose(json);

                    client.send(json);
                },
                complete: () => {
                    if (client.CLOSED) {
                        // client socket is already closed, no need to do anything
                        return;
                    }

                    client.close(
                        WsCloseCode.WS_1012_SERVICE_RESTART,
                        truncateBytes(
                            'The underlying DB change stream was closed, please reconnect',
                            WS_CLOSE_REASON_MAX_BYTES
                        )
                    );
                },
                error: (err: Error) => {
                    this.#logger.error(
                        `Error in change stream: ${err.message}. Closing the WS connection`
                    );

                    client.close(
                        WsCloseCode.WS_1011_INTERNAL_ERROR,
                        truncateBytes(err.message, WS_CLOSE_REASON_MAX_BYTES)
                    );
                }
            });
        } catch (err) {
            this.#logger.error(err);

            if (client.readyState === WebSocket.OPEN) {
                client.close(
                    WsCloseCode.WS_1011_INTERNAL_ERROR,
                    truncateBytes(
                        (err as Error).message,
                        WS_CLOSE_REASON_MAX_BYTES
                    )
                );
            } else {
                client.once('open', () => {
                    client.close(
                        WsCloseCode.WS_1011_INTERNAL_ERROR,
                        truncateBytes(
                            (err as Error).message,
                            WS_CLOSE_REASON_MAX_BYTES
                        )
                    );
                });
            }
        }
    }

    //#endregion Gateway Lifecycle

    //#region Client Messages

    @SubscribeMessage('message')
    onMessage(
        @MessageBody() [eventName, ...data]: v0.ChangeSourceUpstream,
        @ConnectedSocket() client: WebSocket
    ) {
        this.#logger.verbose(
            `Received streamer message: ${JSON.stringify(data)}`
        );

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

                // eslint-disable-next-line no-case-declarations
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
