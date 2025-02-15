import { Zero } from '@rocicorp/zero';

import { type RoomType, type Schema, schema } from '@cbnsndwch/zchat-contracts';

import { clearJwt, getJwt, getRawJwt } from '../auth/jwt';

import { Atom } from './atom';
import { mark } from './perf';

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

export const zeroRef = new Atom<Zero<Schema>>();
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

    zeroRef.current = new Zero<Schema, any>({
        schema,
        logLevel: 'debug',
        server: import.meta.env.VITE_PUBLIC_SERVER,
        userID: auth?.decoded?.sub ?? 'anon',
        kvStore: 'document' in globalThis ? 'idb' : 'mem',
        mutators: {
            rooms: {
                async create(tx: any, input: { t: RoomType; name: string }) {
                    // ! server-side only
                    // tx.rooms.insert({ t, name });
                }
            }
        },
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

export function preload(z: Zero<Schema>) {
    if (didPreload) {
        return;
    }

    didPreload = true;

    const baseRoomQuery = z.query.rooms;
    // .related('labels')
    // .related('viewState', q => q.where('userID', z.userID));

    const { cleanup, complete } = baseRoomQuery.preload();

    complete.then(() => {
        mark('preload complete');

        cleanup();

        baseRoomQuery
            // .related('creator')
            // .related('assignee')
            // .related('emoji', emoji => emoji.related('creator'))
            // .related('comments', comments =>
            //     comments
            //         .related('creator')
            //         .related('emoji', emoji => emoji.related('creator'))
            //         .limit(INITIAL_COMMENT_LIMIT)
            //         .orderBy('created', 'desc')
            // )
            .preload();
    });

    z.query.users.preload();
    // z.query.label.preload();
}

// To enable accessing zero in the devtools easily.
function exposeDevHooks(z: Zero<Schema>) {
    if (!('window' in globalThis)) {
        return;
    }

    const casted = window as unknown as {
        z?: Zero<Schema>;
    };
    casted.z = z;
}
