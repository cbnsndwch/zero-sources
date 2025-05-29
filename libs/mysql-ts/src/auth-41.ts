'use strict';

/*
4.1 authentication: (http://bazaar.launchpad.net/~mysql/mysql-server/5.5/view/head:/sql/password.c)

  SERVER:  public_seed=create_random_string()
           send(public_seed)

  CLIENT:  recv(public_seed)
           hash_stage1=sha1("password")
           hash_stage2=sha1(hash_stage1)
           reply=xor(hash_stage1, sha1(public_seed,hash_stage2)

           // this three steps are done in scramble()

           send(reply)


  SERVER:  recv(reply)
           hash_stage1=xor(reply, sha1(public_seed,hash_stage2))
           candidate_hash2=sha1(hash_stage1)
           check(candidate_hash2==hash_stage2)

server stores sha1(sha1(password)) ( hash_stag2)
*/

import { createHash } from 'node:crypto';

function sha1(
    msg: Buffer | string,
    msg1?: Buffer | string,
    msg2?: Buffer | string
): Buffer {
    const hash = createHash('sha1');
    hash.update(msg);
    if (msg1) {
        hash.update(msg1);
    }

    if (msg2) {
        hash.update(msg2);
    }

    return hash.digest();
}

function xor(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.allocUnsafe(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i]! ^ b[i]!;
    }
    return result;
}

const _xor = xor;
export { _xor as xor };

function token(
    password: Buffer | string,
    scramble1: Buffer,
    scramble2: Buffer
): Buffer {
    if (!password) {
        return Buffer.alloc(0);
    }
    const stage1 = sha1(password);
    return calculateTokenFromPasswordSha(stage1, scramble1, scramble2);
}

export function calculateTokenFromPasswordSha(
    passwordSha: Buffer,
    scramble1: Buffer,
    scramble2: Buffer
): Buffer {
    // we use AUTH 41 here, and we need only the bytes we just need.
    const authPluginData1 = scramble1.slice(0, 8);
    const authPluginData2 = scramble2.slice(0, 12);
    const stage2 = sha1(passwordSha);
    const stage3 = sha1(authPluginData1, authPluginData2, stage2);
    return xor(stage3, passwordSha);
}

export const calculateToken = token;

export function verifyToken(
    publicSeed1: Buffer,
    publicSeed2: Buffer,
    token: Buffer,
    doubleSha: Buffer
): boolean {
    const hashStage1 = xor(token, sha1(publicSeed1, publicSeed2, doubleSha));
    const candidateHash2 = sha1(hashStage1);
    return candidateHash2.compare(doubleSha) === 0;
}

export function doubleSha1(password: Buffer | string): Buffer {
    return sha1(sha1(password));
}

export function xorRotating(data: Buffer, seed: Buffer): Buffer {
    const result = Buffer.allocUnsafe(data.length);
    const seedLen = seed.length;

    for (let i = 0; i < data.length; i++) {
        result[i] = data[i]! ^ seed[i % seedLen]!;
    }
    return result;
}
