import {
    eGCD_, greater, divide_, str2bigInt, equalsInt,
    isZero, bigInt2str, copy_, copyInt_, rightShift_, sub_, add_, bpe, one
} from './vendor/leemon';

type Bytes = number[]

function bytesToHex(bytes: Bytes | Uint8Array = []) {
    const arr = [];
    for (let i = 0; i < bytes.length; i++) {
        arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
    }
    return arr.join('');
}

function bytesFromHex(hexString: string): Bytes {
    const len = hexString.length;
    let start = 0;
    const bytes = [];

    if (hexString.length % 2) {
        bytes.push(parseInt(hexString.charAt(0), 16));
        start++;
    }

    for (let i = start; i < len; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    return bytes;
}

function bytesFromLeemonBigInt(bigInt: Bytes) {
    const str = bigInt2str(bigInt, 16);
    return bytesFromHex(str);
}

function nextRandomInt(maxValue: number) {
    return Math.floor(Math.random() * maxValue);
}


function pqPrimeFactorization(pqBytes: Bytes) {
    const minSize = Math.ceil(64 / bpe) + 1;

    // const what = new BigInteger(pqBytes)
    const hex = bytesToHex(pqBytes);
    const lWhat = str2bigInt(hex, 16, minSize);
    const result = pqPrimeLeemon(lWhat);
    return result;
}


function pqPrimeLeemon(what: Bytes) {
    const minBits = 64;
    const minLen = Math.ceil(minBits / bpe) + 1;
    let it = 0;
    let q, lim;
    const a = new Array(minLen);
    const b = new Array(minLen);
    const c = new Array(minLen);
    const g = new Array(minLen);
    const z = new Array(minLen);
    const x = new Array(minLen);
    const y = new Array(minLen);

    for (let i = 0; i < 3; i++) {
        q = (nextRandomInt(128) & 15) + 17;
        copyInt_(x, nextRandomInt(1000000000) + 1);
        copy_(y, x);
        lim = 1 << i + 18;

        for (let j = 1; j < lim; j++) {
            ++it;
            copy_(a, x);
            copy_(b, x);
            copyInt_(c, q);

            while (!isZero(b)) {
                if (b[0] & 1) {
                    add_(c, a);
                    if (greater(c, what)) {
                        sub_(c, what);
                    }
                }
                add_(a, a);
                if (greater(a, what)) {
                    sub_(a, what);
                }
                rightShift_(b, 1);
            }

            copy_(x, c);
            if (greater(x, y)) {
                copy_(z, x);
                sub_(z, y);
            } else {
                copy_(z, y);
                sub_(z, x);
            }
            eGCD_(z, what, g, a, b);
            if (!equalsInt(g, 1)) {
                break;
            }
            if ((j & j - 1) === 0) {
                copy_(y, x);
            }
        }
        if (greater(g, one)) {
            break;
        }
    }

    divide_(what, g, x, y);

    const [P, Q] =
        greater(g, x)
            ? [x, g]
            : [g, x];

    // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10))

    return [bytesFromLeemonBigInt(P), bytesFromLeemonBigInt(Q), it];
}

class FactorizatorLeemon {
    static factorize(pq: Bytes) {
        const [p, q] = pqPrimeFactorization(pq)
        return {p: Buffer.from(p as number[]), q: Buffer.from(q as number[])}
    }
}

module.exports = FactorizatorLeemon;
