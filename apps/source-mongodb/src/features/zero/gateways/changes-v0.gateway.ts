import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import {
    SubscribeMessage,
    WebSocketGateway,
    MessageBody,
    OnGatewayConnection,
    ConnectedSocket
} from '@nestjs/websockets';
import type { Request } from 'express';
import type { Model } from 'mongoose';
import { concatWith, Observable } from 'rxjs';
import { WebSocket } from 'ws';

import { v0 } from '@rocicorp/zero/change-protocol/v0';

import { AppConfig, AuthConfig, DbConfig } from '../../../config/contracts.js';

import { truncateBytes, WsCloseCode, WS_CLOSE_REASON_MAX_BYTES } from '../../../utils/index.js';

import { IWatermarkService, TOKEN_WATERMARK_SERVICE } from '../../watermark/contracts.js';

import { StreamerShard } from '../entities/streamer-shard.entity.js';

import { ChangeSourceV0, WATERMARK_INITIAL_SYNC } from '../services/change-source-v0.js';
import { ChangeMakerV0 } from '../services/change-maker-v0.js';
import { TableMappingService } from '../services/table-mapping.service.js';

import { getStreamerParams } from '../utils/get-streamer-params.js';

type DownstreamState = {
    shard: StreamerShard;
    source: ChangeSourceV0;
};

@WebSocketGateway({ path: '/changes/v0/stream' })
export class ChangesGatewayV0 implements OnGatewayConnection {
    #logger = new Logger(ChangesGatewayV0.name);

    #shardModel: Model<StreamerShard>;

    // the token zero-cache will send to authenticate
    #token?: string;

    // database configuration including table mappings
    #dbConfig: DbConfig;

    // the change mapper service that transforms MongoDB change stream events
    // into Zero events
    #changeMaker: ChangeMakerV0;

    // maps between mongo resume tokens and zero watermarks (lexi versions)
    #watermarkService: IWatermarkService;

    // service for handling table mappings, filters, and projections
    #tableMappingService: TableMappingService;

    /**
     * A map of client keys to RxJS subjects that can be used to multicast
     * changes to all clients interested on the same shard.
     */
    readonly #subscriptions = new Map<WebSocket, DownstreamState>();

    constructor(
        @Inject(TOKEN_WATERMARK_SERVICE) watermarkService: IWatermarkService,
        @InjectModel(StreamerShard.name) shardModel: Model<StreamerShard>,
        config: ConfigService<AppConfig>,
        changeMaker: ChangeMakerV0,
        tableMappingService: TableMappingService
    ) {
        this.#shardModel = shardModel;
        this.#watermarkService = watermarkService;
        this.#changeMaker = changeMaker;
        this.#tableMappingService = tableMappingService;

        const authConfig = config.get<AuthConfig>('auth');
        this.#token = authConfig?.token;

        const dbConfig = config.get<DbConfig>('db');
        if (!dbConfig) {
            throw new Error('Database configuration is required');
        }
        this.#dbConfig = dbConfig;
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
            const { shardId, lastWatermark, token } = params;

            // enforce auth only if configured
            if (this.#token && token !== this.#token) {
                client.close(WsCloseCode.WS_3000_UNAUTHORIZED, 'Auth token missing or invalid');
                return;
            }

            // create or update shard, saving the lastWatermark
            const shard = await this.#shardModel.findByIdAndUpdate(
                { _id: shardId },
                { lastWatermark },
                { upsert: true, new: true }
            );

            const source = new ChangeSourceV0(
                shard,
                this.#shardModel.db,
                this.#changeMaker,
                this.#watermarkService,
                this.#tableMappingService,
                this.#dbConfig
            );

            this.#subscriptions.set(client, { shard, source });

            const abortController = new AbortController();

            // stream db changes
            const resumeToken =
                !lastWatermark || lastWatermark === WATERMARK_INITIAL_SYNC
                    ? undefined
                    : await this.#watermarkService.getResumeToken(shard.id, lastWatermark);
            let stream$: Observable<v0.ChangeStreamMessage> = source.streamChanges$(
                abortController.signal,
                resumeToken
            );

            // handle initial sync scenario
            if (!lastWatermark || lastWatermark === WATERMARK_INITIAL_SYNC) {
                this.#logger.debug('No streamer watermark provided, performing initial sync');
                stream$ = source.initialSync$().pipe(concatWith(stream$));
            } else {
                this.#logger.debug(
                    `Got streamer watermark ${lastWatermark}, skipping initial sync`
                );
            }

            client.on('close', () => {
                this.#logger.debug('Client disconnected, stopping change stream');

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
                error: err => {
                    client.close(
                        WsCloseCode.WS_1011_INTERNAL_ERROR,
                        truncateBytes(err.message, WS_CLOSE_REASON_MAX_BYTES)
                    );
                }
            });
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
        @MessageBody() [eventName, ...data]: v0.ChangeSourceUpstream,
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
