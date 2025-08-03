import { useSyncExternalStore } from 'react';
import { Zero as ZeroConstructor } from '@rocicorp/zero';

import { schema, type Schema } from '@cbnsndwch/zrocket-contracts/schema';

import { clearJwt, getJwt, getRawJwt } from '../auth/jwt';

import type { Zero } from './contracts';

import { Atom } from './atom';
import { mark } from './perf';
import { createMutators, type Mutators } from './mutators';

// One more than we display so we can detect if there are more
// to load.
export const INITIAL_COMMENT_LIMIT = 101;

export type LoginState = {
    encoded: string;
    decoded: {
        sub: string;
        name: string;
        role: 'crew' | 'user';
    };
};

export const zeroRef = new Atom<Zero>();

export function getZeroSnapshot() {
    if (typeof document === 'undefined') {
        return null;
    }

    return zeroRef.current;
}

export function useZeroRef() {
    return useSyncExternalStore(
        zeroRef.onChange,
        getZeroSnapshot,
        getZeroSnapshot
    );
}

export const authRef = new Atom<LoginState>();

const jwt = getJwt();
const encodedJwt = getRawJwt();

authRef.current =
    encodedJwt && jwt
        ? {
              encoded: encodedJwt,
              decoded: jwt as LoginState['decoded']
          }
        : undefined;

authRef.onChange(auth => {
    zeroRef.current?.close();

    mark('creating new zero');

    zeroRef.current = new ZeroConstructor<Schema, Mutators>({
        schema,
        logLevel: 'debug',
        server: import.meta.env.VITE_PUBLIC_SYNC_SERVER,
        userID: auth?.decoded?.sub ?? 'anon',
        kvStore: 'document' in globalThis ? 'idb' : 'mem',
        mutators: createMutators(),
        auth: (error?: 'invalid-token') => {
            if (error === 'invalid-token') {
                clearJwt();
                authRef.current = undefined;
                return undefined;
            }
            return auth?.encoded;
        }
    });

    exposeDevHooks(zeroRef.current);
});

let didPreload = false;

export function preload(z: Zero) {
    if (didPreload) {
        return;
    }

    didPreload = true;

    const initialQueries = [
        z.query.channels
            .orderBy('createdAt', 'desc')
            .limit(50)
            .related('messages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            ),
        z.query.groups
            .orderBy('createdAt', 'desc')
            .limit(50)
            .related('messages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            ),
        z.query.chats
            .orderBy('createdAt', 'desc')
            .limit(50)
            .related('messages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            )
            .related('systemMessages', cb =>
                cb.orderBy('createdAt', 'desc').limit(50)
            ),
        z.query.users.where('active', '=', true)
    ];

    initialQueries.forEach(query => {
        query.preload();
    });

    // const preloadQueries = [
    //     z.query.messages

    // ].map(table => table.preload()).forEach(({ cleanup, complete }) => {

    // });

    // const { cleanup, complete } = preloadQueries.preload();

    // complete.then(() => {
    //     mark('preload complete');
    //
    //     cleanup();
    //
    //     // preloadQueries
    //     //     // .related('creator')
    //     //     // .related('assignee')
    //     //     // .related('emoji', emoji => emoji.related('creator'))
    //     //     // .related('comments', comments =>
    //     //     //     comments
    //     //     //         .related('creator')
    //     //     //         .related('emoji', emoji => emoji.related('creator'))
    //     //     //         .limit(INITIAL_COMMENT_LIMIT)
    //     //     //         .orderBy('created', 'desc')
    //     //     // )
    //     //     .preload();
    // });

    // z.query.users.preload();
    // z.query.label.preload();
}

// To enable accessing zero in the devtools easily.
function exposeDevHooks(z: Zero) {
    if ('window' in globalThis) {
        window.z = z;
    }
}
