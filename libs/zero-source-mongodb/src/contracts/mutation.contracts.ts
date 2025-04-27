import { z } from 'zod';

import { skipAssertJSONValue } from './asserts.js';
import { isJSONValue } from './json.js';

export const TOKEN_ZERO_MUTATORS = Symbol.for('TOKEN_ZERO_MUTATORS');

export const argSchema = z.any().refine(
    value => {
        if (skipAssertJSONValue) {
            return true;
        }

        const path: Array<string | number> = [];
        return isJSONValue(value, path);
    },
    {
        message: `Not a JSON value`
    }
);

export const mutationSchema = z.object({
    type: z.literal('custom'),
    id: z.number(),
    clientID: z.string(),
    timestamp: z.number(),
    name: z.string(),
    args: z.array(argSchema)
});

export type Mutation = z.infer<typeof mutationSchema>;

export const serverMutationBodySchema = z.object({
    timestamp: z.number(),

    clientGroupID: z.string(),

    requestID: z.string(),

    mutations: z.array(mutationSchema),

    pushVersion: z.number(),

    // For legacy (CRUD) mutations, the schema is tied to the client group /
    // sync connection. For custom mutations, schema versioning is delegated
    // to the custom protocol / api-server.
    schemaVersion: z.number().optional()
});

export type ServerMutationBody = z.infer<typeof serverMutationBodySchema>;

/**
 * The schema for the querystring parameters of the custom push endpoint.
 */
export const pushParamsSchema = z.object({
    schema: z.string(),
    appID: z.string()
});

export type ServerMutationParams = z.infer<typeof pushParamsSchema>;
