import type { IncomingHttpHeaders } from 'node:http';

import type { Request } from 'express';

import { invariant } from '@cbnsndwch/zero-contracts';

export type ShardID = string;

/**
 * Represents the base parameters required for a Zero Change Streamer. These are
 * specified by the Zero Change Source protocol.
 */
export type ZeroChangeStreamerParamsBase = {
    /**
     * The app ID for the Zero application (used for table name prefixes).
     */
    appId: string;

    /**
     * The ID of the shard the streamer wants changes for.
     */
    shardId: ShardID;

    /**
     * The list of publications the client is interested in.
     */
    shardPublications: string[];

    /**
     * The version of the shard's data model.
     */
    replicaVersion?: string | undefined;

    /**
     * The latest watermark the streamer has seen an ack for from the storer
     * service for the shard.
     */
    lastWatermark?: string | undefined;

    /**
     * The token used to authenticate the streamer.
     */
    token?: string | undefined;
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
 * request. The following session parameters are provided by the Change Streamer
 * as query string parameters:
 *
 * - `shardID` - The ID of the shard the streamer wants changes for. TODO: store shard config in DB
 * - `lastWatermark` - The latest watermark the streamer has seen an ack for from the storer service
 *
 * @param req The incoming request from the Zero ChangeStreamer
 */
export function getStreamerParams(req: Request): ZeroChangeStreamerParams {
    const headers = req.headers;

    const reqUrl = new URL(req.url, 'http://unused');
    const shardPublications = reqUrl.searchParams.getAll('shardPublications');
    const path = reqUrl.pathname;

    const {
        appID: appId,
        shardNum: shardId, // Zero cache uses shardNum instead of shardId
        k: token,
        lastWatermark,
        replicaVersion,
        ...additionalParams
    } = Object.fromEntries(reqUrl.searchParams.entries());

    invariant(!!shardId, 'Zero streamer did not provide shardID or shardNum');
    invariant(!!appId, 'Zero streamer did not provide appID');

    return {
        // base params
        appId,
        shardId,
        replicaVersion,
        lastWatermark,
        shardPublications,
        // auth
        token,
        // gateway-specific params
        path,
        headers,
        // extras
        additionalParams
    };
}
