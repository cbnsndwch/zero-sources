import type { IncomingHttpHeaders } from 'node:http';

import type { Request } from 'express';

export type ShardID = string;

/**
 * Represents the base parameters required for a Zero Change Streamer. These are
 * specified by the Zero Change Source protocol.
 */
export type ZeroChangeStreamerParamsBase = {
    /**
     * The ID of the shard the streamer wants changes for.
     */
    shardId: ShardID;

    /**
     * The latest watermark the streamer has seen an ack for from the storer
     * service for the shard.
     */
    lastWatermark?: string;
};

/**
 * Parameters for the Zero Change Source implemented by this gateway. Includes
 * base parameters specified by the Zero Change Source protocol as well as
 * implementation-specific parameters used by this gateway.
 */
export type ZeroChangeStreamerParams = ZeroChangeStreamerParamsBase & {
    /**
     * The path of the gateway the Change Streamer is connecting to.
     */
    path: string;

    /**
     * The parsed headers of the initial request.
     */
    headers: IncomingHttpHeaders;

    /**
     * Any additional query string parameters passed by the client.
     */
    additionalParams: Record<string, string>;
};

/**
 * Extracts request parameters from a Zero ChangeStreamer incoming socket-starting
 * request. The following session parameters are provided by teh Change Streamer
 * as query string parameters:
 *
 * - `shardID` - The ID of the shard the streamer wants changes for. TODO: store shard config in DB
 * - `lastWatermark` - The latest watermark the streamer has seen an ack for from the storer service
 *
 * @param req The incoming request from the Zero ChangeStreamer
 */

export function getZeroChangeStreamerParams(req: Request): ZeroChangeStreamerParams {
    const headers = req.headers;

    const reqUrl = new URL(req.url, 'http://foo');
    const path = reqUrl.pathname;
    const {
        shardID: shardId,
        lastWatermark,
        ...additionalParams
    } = Object.fromEntries(reqUrl.searchParams.entries());

    return {
        // base params
        shardId,
        lastWatermark,
        // gateway-specific params
        path,
        headers,
        // extras
        additionalParams
    };
}
