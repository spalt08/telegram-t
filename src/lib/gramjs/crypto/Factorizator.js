const { getRandomInt } = require('../Helpers')
const JSBI = require('jsbi')

class Factorizator {
    /**
     * Finds the small multiplier by using Lopatin's method
     * @param what {JSBI.BigInt}
     * @return {JSBI.BigInt}
     */
    static findSmallMultiplierLopatin(what) {
        let g = JSBI.BigInt(0)
        for (let i = JSBI.BigInt(0); i < JSBI.BigInt(3); i++) {
            const q = JSBI.BigInt(30) || JSBI.BigInt((getRandomInt(0, 127) & 15) + 17)
            let x = JSBI.BigInt(40) || JSBI.BigInt(getRandomInt(0, 1000000000) + 1)

            let y = x
            const lim = JSBI.BigInt(1) << (i + JSBI.BigInt(18))
            for (let j = JSBI.BigInt(1); j < lim; j++) {
                let a = x
                let b = x

                let c = q
                while (b !== JSBI.BigInt(0)) {
                    if (JSBI.BigInt(b & JSBI.BigInt(1)) !== JSBI.BigInt(0)) {
                        c += a
                        if (c >= what) {
                            c -= what
                        }
                    }
                    a += a
                    if (a >= what) {
                        a -= what
                    }
                    b >>= JSBI.BigInt(1)
                }

                x = c
                const z = JSBI.BigInt(x < y ? y - x : x - y)
                g = this.gcd(z, what)

                if (g !== JSBI.BigInt(1)) {
                    break
                }

                if ((j & (j - JSBI.BigInt(1))) === JSBI.BigInt(0)) {
                    y = x
                }
            }
            if (g > 1) {
                break
            }
        }
        const p = what / g

        return p < g ? p : g
    }

    /**
     * Calculates the greatest common divisor
     * @param a {JSBI.BigInt}
     * @param b {JSBI.BigInt}
     * @returns {JSBI.BigInt}
     */
    static gcd(a, b) {
        while (a !== JSBI.BigInt(0) && b !== JSBI.BigInt(0)) {
            while ((b & JSBI.BigInt(1)) === JSBI.BigInt(0)) {
                b >>= JSBI.BigInt(1)
            }
            while ((a & JSBI.BigInt(1)) === JSBI.BigInt(0)) {
                a >>= JSBI.BigInt(1)
            }
            if (a > b) {
                a -= b
            } else {
                b -= a
            }
        }
        return b === JSBI.BigInt(0) ? a : b
    }

    /**
     * Factorizes the given number and returns both the divisor and the number divided by the divisor
     * @param pq {JSBI.BigInt}
     * @returns {{p: JSBI.BigInt, q: JSBI.BigInt}}
     */
    static factorize(pq) {
        const divisor = this.findSmallMultiplierLopatin(pq)
        return { p: divisor, q: pq / divisor }
    }
}

module.exports = Factorizator
